import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendEmail } from "../services/emailService.js";

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  // Sử dụng secret key cố định nếu không có trong env
  const jwtSecret =
    process.env.JWT_SECRET || "default-secret-key-for-development";
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || "default-refresh-secret-for-development";

  const accessToken = jwt.sign({ userId: userId.toString() }, jwtSecret, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ userId: userId.toString() }, refreshSecret, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

/**
 * Register new user
 */
export const register = asyncHandler(async (req, res) => {
  const { tenDangNhap, email, matKhau, soDienThoai, diaChi, hoTen } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { tenDangNhap }],
  });

  if (existingUser) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Tên đăng nhập hoặc email đã tồn tại",
    });
  }

  // Create verification code
  const maXacThuc = crypto.randomBytes(32).toString("hex");
  const thoiGianHetHanMaXacThuc = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = new User({
    tenDangNhap,
    email,
    hoTen,
    matKhau,
    soDienThoai,
    diaChi,
    maXacThuc,
    thoiGianHetHanMaXacThuc,
    vaiTro: "user",
    trangThaiHoatDong: true,
  });

  await user.save();

  // Send verification email (optional - only if email service is configured)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    try {
      await sendEmail({
        to: email,
        subject: "Xác thực tài khoản",
        html: `
          <h2>Xin chào ${tenDangNhap},</h2>
          <p>Vui lòng click vào link sau để xác thực tài khoản của bạn:</p>
          <a href="${
            process.env.CLIENT_URL || "http://localhost:3000"
          }/verify-email?code=${maXacThuc}">Xác thực tài khoản</a>
          <p>Link này sẽ hết hạn sau 24 giờ.</p>
        `,
      });
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message);
      // Continue with registration even if email fails
    }
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.tokenLamMoi = refreshToken;
  await user.save();

  res.status(httpStatus.CREATED).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        tenDangNhap: user.tenDangNhap,
        email: user.email,
        hoTen: user.hoTen,
        vaiTro: user.vaiTro,
      },
      accessToken,
      refreshToken,
    },
    message: "Đăng ký thành công!",
  });
});

/**
 * Login
 */
export const login = asyncHandler(async (req, res) => {
  const { tenDangNhap, matKhau } = req.body;

  // Find user
  const user = await User.findOne({ tenDangNhap });
  if (!user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng",
    });
  }

  // Check password
  const isPasswordValid = await user.soSanhMatKhau(matKhau);
  if (!isPasswordValid) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng",
    });
  }

  // Check if account is active
  if (!user.trangThaiHoatDong) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Tài khoản của bạn đã bị khóa",
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update user
  user.tokenLamMoi = refreshToken;
  user.lanDangNhapCuoi = new Date();
  await user.save();

  // Log activity
  await ActivityLog.create({
    nguoiDung: user._id,
    loaiHanhDong: "dang_nhap",
    chiTiet: {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        tenDangNhap: user.tenDangNhap,
        email: user.email,
        hoTen: user.hoTen,
        vaiTro: user.vaiTro,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Refresh token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Refresh token là bắt buộc",
    });
  }

  try {
    // Verify refresh token
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      "default-refresh-secret-for-development";
    const decoded = jwt.verify(refreshToken, refreshSecret);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.tokenLamMoi !== refreshToken) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Refresh token không hợp lệ",
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token
    user.tokenLamMoi = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Refresh token đã hết hạn",
      });
    }
    throw error;
  }
});

/**
 * Logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token
  await User.findByIdAndUpdate(req.user._id, {
    tokenLamMoi: null,
  });

  // Log activity
  await ActivityLog.create({
    nguoiDung: req.user._id,
    loaiHanhDong: "dang_xuat",
    chiTiet: {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  res.json({
    success: true,
    message: "Đăng xuất thành công",
  });
});

/**
 * Verify email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const user = await User.findOne({
    maXacThuc: code,
    thoiGianHetHanMaXacThuc: { $gt: new Date() },
  });

  if (!user) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Mã xác thực không hợp lệ hoặc đã hết hạn",
    });
  }

  user.xacThucEmail = true;
  user.maXacThuc = null;
  user.thoiGianHetHanMaXacThuc = null;
  await user.save();

  res.json({
    success: true,
    message: "Xác thực email thành công",
  });
});

/**
 * Forgot password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy người dùng với email này",
    });
  }

  // Generate reset code
  const resetCode = crypto.randomBytes(32).toString("hex");
  user.maXacThuc = resetCode;
  user.thoiGianHetHanMaXacThuc = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send email
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    try {
      await sendEmail({
        to: email,
        subject: "Reset mật khẩu",
        html: `
          <h2>Reset mật khẩu</h2>
          <p>Click vào link sau để reset mật khẩu của bạn:</p>
          <a href="${
            process.env.CLIENT_URL || "http://localhost:3000"
          }/reset-password?code=${resetCode}">Reset mật khẩu</a>
          <p>Link này sẽ hết hạn sau 1 giờ.</p>
        `,
      });
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message);
    }
  }

  res.json({
    success: true,
    message: "Đã gửi link đặt lại mật khẩu vào email của bạn",
  });
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { code, newPassword } = req.body;

  const user = await User.findOne({
    maXacThuc: code,
    thoiGianHetHanMaXacThuc: { $gt: new Date() },
  });

  if (!user) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
    });
  }

  user.matKhau = newPassword;
  user.maXacThuc = null;
  user.thoiGianHetHanMaXacThuc = null;
  await user.save();

  res.json({
    success: true,
    message: "Đặt lại mật khẩu thành công",
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  // Verify old password
  const isPasswordValid = await user.soSanhMatKhau(oldPassword);
  if (!isPasswordValid) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Mật khẩu cũ không đúng",
    });
  }

  // Check if new password is the same as old password
  if (newPassword === oldPassword) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Mật khẩu mới không được trùng với mật khẩu cũ",
    });
  }

  user.matKhau = newPassword;
  await user.save();

  // Log activity
  await ActivityLog.create({
    nguoiDung: req.user._id,
    loaiHanhDong: "thay_doi_thong_tin",
    chiTiet: {
      noiDung: "Changed password",
    },
  });

  res.json({
    success: true,
    message: "Đổi mật khẩu thành công",
  });
});
