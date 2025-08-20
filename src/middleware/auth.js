import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import User from "../models/User.js";
import { logger } from "../utils/logger.js";

/**
 * Verify JWT token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    // Use same secret as in authController
    const jwtSecret =
      process.env.JWT_SECRET || "default-secret-key-for-development";
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.userId).select(
      "-matKhau -tokenLamMoi"
    );

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (!user.trangThaiHoatDong) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    req.user = user;
    req.userId = user._id;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    logger.error("Auth middleware error:", error);
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Xác thực thất bại",
    });
  }
};

/**
 * Check user role - Fixed to handle single role or array of roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Yêu cầu xác thực",
      });
    }

    // Handle both single role and array of roles
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Bạn không có quyền truy cập tài nguyên này",
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (token) {
      const jwtSecret =
        process.env.JWT_SECRET || "default-secret-key-for-development";
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.userId).select(
        "-matKhau -tokenLamMoi"
      );

      if (user && user.trangThaiHoatDong) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (error) {
    // Ignore token errors for optional auth
    logger.debug("Optional auth token error:", error.message);
  }

  next();
};
