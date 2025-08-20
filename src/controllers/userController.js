import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import Document from "../models/Document.js";
import Transaction from "../models/Transaction.js";
import { logger } from "../utils/logger.js";
import UserActivity from "../models/UserActivity.js";

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("-matKhau -tokenLamMoi");

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { tenDangNhap, soDienThoai, diaChi } = req.body;

  const user = await User.findById(req.userId);

  if (tenDangNhap) user.tenDangNhap = tenDangNhap;
  if (soDienThoai) user.soDienThoai = soDienThoai;
  if (diaChi) user.diaChi = diaChi;

  await user.save();

  // Log activity
  await ActivityLog.create({
    nguoiDung: req.userId,
    loaiHanhDong: "thay_doi_thong_tin",
    chiTiet: {
      noiDung: "Updated profile information",
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Upload avatar
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Không có file được tải lên",
    });
  }

  // Here you would upload to storage service
  // For now, we'll use local path
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  await User.findByIdAndUpdate(req.userId, { anhDaiDien: avatarUrl });

  res.json({
    success: true,
    data: { anhDaiDien: avatarUrl },
  });
});

/**
 * Get user activity history
 */
export const getActivityHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, loaiHanhDong, startDate, endDate } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = { nguoiDung: req.userId };

  if (loaiHanhDong) {
    query.loaiHanhDong = loaiHanhDong;
  }

  if (startDate || endDate) {
    query.thoiGian = {};
    if (startDate) query.thoiGian.$gte = new Date(startDate);
    if (endDate) query.thoiGian.$lte = new Date(endDate);
  }

  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .populate("chiTiet.taiLieu", "thongTinDaNgonNgu.tieuDe")
      .sort({ thoiGian: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const [documentsUploaded, documentsDownloaded, totalSpent, totalDeposited] =
    await Promise.all([
      Document.countDocuments({ nguoiUpload: userId }),
      Transaction.countDocuments({
        nguoiDung: userId,
        loaiGiaoDich: "tai_xuong",
      }),
      Transaction.aggregate([
        {
          $match: {
            nguoiDung: userId,
            loaiGiaoDich: "tai_xuong",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: "$soTien" } },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            nguoiDung: userId,
            loaiGiaoDich: "nap_tien",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$soTien" },
          },
        },
      ]),
    ]);

  res.json({
    success: true,
    data: {
      documentsUploaded,
      documentsDownloaded,
      totalSpent: totalSpent[0]?.total || 0,
      totalDeposited: totalDeposited[0]?.total || 0,
      currentBalance: req.user.soDuTaiKhoan,
    },
  });
});

/**
 * Get downloaded documents
 */
export const getDownloadedDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get transactions for downloaded documents
  const transactions = await Transaction.find({
    nguoiDung: req.userId,
    loaiGiaoDich: "tai_xuong",
    trangThai: "completed",
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: "chiTiet.taiLieu",
      select: "thongTinDaNgonNgu loaiTaiLieu danhMuc files",
      populate: {
        path: "danhMuc",
        select: "tenDanhMuc",
      },
    });

  const total = await Transaction.countDocuments({
    nguoiDung: req.userId,
    loaiGiaoDich: "tai_xuong",
    trangThai: "completed",
  });

  res.json({
    success: true,
    data: {
      documents: transactions.map((t) => ({
        document: t.chiTiet.taiLieu,
        downloadedAt: t.createdAt,
        price: Math.abs(t.soTien),
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

/**
 * Admin: Get all users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    vaiTro,
    trangThai,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { soDienThoai: { $regex: search, $options: "i" } },
    ];
  }

  if (vaiTro) {
    query.vaiTro = vaiTro;
  }

  if (trangThai) {
    query.trangThai = trangThai;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-matKhau -refreshToken")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

/**
 * Admin: Update user role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { vaiTro } = req.body;

  if (!["admin", "teacher", "user"].includes(vaiTro)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Vai trò không hợp lệ",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy người dùng",
    });
  }

  user.vaiTro = vaiTro;
  await user.save();

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Admin: Update user status
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { trangThai } = req.body;

  if (!["active", "inactive", "banned"].includes(trangThai)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Trạng thái không hợp lệ",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy người dùng",
    });
  }

  user.trangThai = trangThai;
  await user.save();

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Admin: Get user details
 */
export const getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-matKhau -refreshToken");
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy người dùng",
    });
  }

  // Get additional stats
  const [totalDocuments, totalDownloads, totalSpent, recentActivity] =
    await Promise.all([
      Document.countDocuments({ nguoiUpload: userId }),
      Transaction.countDocuments({
        nguoiDung: userId,
        loaiGiaoDich: "tai_xuong",
      }),
      Transaction.aggregate([
        {
          $match: {
            nguoiDung: mongoose.Types.ObjectId(userId),
            loaiGiaoDich: "tai_xuong",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: "$soTien" } },
          },
        },
      ]),
      ActivityLog.find({ nguoiDung: userId }).sort({ thoiGian: -1 }).limit(10),
    ]);

  res.json({
    success: true,
    data: {
      user,
      stats: {
        totalDocuments,
        totalDownloads,
        totalSpent: totalSpent[0]?.total || 0,
      },
      recentActivity,
    },
  });
});

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, vaiTro } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { tenDangNhap: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (vaiTro) {
    query.vaiTro = vaiTro;
  }

  const users = await User.find(query)
    .select("-matKhau -tokenLamMoi")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

/**
 * Get user by ID (admin only)
 * @route GET /api/users/:id
 * @access Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-matKhau -tokenLamMoi"
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy người dùng",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Update user (admin only)
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, message: "Không tìm thấy người dùng" });
  }

  const { hoTen, email, soDienThoai, vaiTro, trangThaiHoatDong, tenDangNhap } =
    req.body;

  // Cập nhật các trường
  user.hoTen = hoTen ?? user.hoTen;
  user.email = email ?? user.email;
  user.soDienThoai = soDienThoai ?? user.soDienThoai;
  user.vaiTro = vaiTro ?? user.vaiTro;
  user.trangThaiHoatDong = trangThaiHoatDong ?? user.trangThaiHoatDong;
  user.tenDangNhap = tenDangNhap ?? user.tenDangNhap;

  const updatedUser = await user.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id, // Admin performing the action
    hanhDong: "cap_nhat_nguoi_dung",
    chiTiet: {
      updatedUserId: updatedUser._id,
      updatedFields: Object.keys(req.body),
    },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  res.json({ success: true, data: updatedUser });
});

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy người dùng",
    });
  }

  await user.deleteOne();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "xoa_nguoi_dung",
    chiTiet: { deletedUserId: user._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`User ${user._id} deleted by admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Xóa người dùng thành công",
  });
});

/**
 * Update user balance (admin only)
 * @route PUT /api/users/:id/balance
 * @access Private/Admin
 */
export const updateUserBalance = asyncHandler(async (req, res) => {
  const { amount, type } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy người dùng",
    });
  }

  if (type === "add") {
    user.soDuTaiKhoan += amount;
  } else if (type === "subtract") {
    if (user.soDuTaiKhoan < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance",
      });
    }
    user.soDuTaiKhoan -= amount;
  }

  await user.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "cap_nhat_so_du",
    chiTiet: { userId: user._id, amount, type },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`User ${user._id} balance updated by admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-matKhau");
  if (!user) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, message: "Không tìm thấy người dùng" });
  }
  res.status(httpStatus.OK).json({ success: true, data: user });
});

/**
 * Update current user's profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, message: "Không tìm thấy người dùng" });
  }

  // Update fields
  const { hoTen, soDienThoai, diaChi } = req.body;
  if (hoTen) user.hoTen = hoTen;
  if (soDienThoai) user.soDienThoai = soDienThoai;
  if (diaChi) user.diaChi = diaChi;

  const updatedUser = await user.save();
  logger.info(`User ${user._id} profile updated`);

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

/**
 * Admin: Create a new user
 * @route POST /api/users
 * @access Private/Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const {
    tenDangNhap,
    email,
    matKhau,
    hoTen,
    soDienThoai,
    diaChi,
    vaiTro,
    trangThaiHoatDong,
  } = req.body;

  // Check if user exists
  const userExists = await User.findOne({
    $or: [{ email }, { tenDangNhap }],
  });
  if (userExists) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Email hoặc Tên đăng nhập đã tồn tại",
    });
  }

  // Create user
  const user = await User.create({
    tenDangNhap,
    email,
    matKhau, // Password will be hashed by pre-save hook
    hoTen,
    soDienThoai,
    diaChi,
    vaiTro: vaiTro || "user",
    trangThaiHoatDong: trangThaiHoatDong ?? true,
  });

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id, // Admin performing the action
    hanhDong: "tao_nguoi_dung", // You might need to add this to the enum
    chiTiet: {
      createdUserId: user._id,
      email: user.email,
      vaiTro: user.vaiTro,
    },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  // Remove sensitive data before sending response
  user.matKhau = undefined;

  res.status(httpStatus.CREATED).json({ success: true, data: user });
});
