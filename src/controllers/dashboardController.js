import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import mongoose from "mongoose";
import Document from "../models/Document.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import ActivityLog from "../models/ActivityLog.js";
import File from "../models/File.js";
import UserActivity from "../models/UserActivity.js";

/**
 * Get dashboard overview
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const [
    totalDocuments,
    totalUsers,
    totalCategories,
    totalRevenue,
    documentsThisMonth,
    usersThisMonth,
    revenueThisMonth,
    popularDocuments,
  ] = await Promise.all([
    // Total counts
    Document.countDocuments(),
    User.countDocuments(),
    Category.countDocuments({ kichHoat: true }),

    // Total revenue
    Transaction.aggregate([
      {
        $match: {
          loaiGiaoDich: "tai_xuong",
          trangThai: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: "$soTien" } },
        },
      },
    ]),

    // This month's data
    Document.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1)),
      },
    }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1)),
      },
    }),
    Transaction.aggregate([
      {
        $match: {
          loaiGiaoDich: "tai_xuong",
          trangThai: "completed",
          createdAt: {
            $gte: new Date(new Date().setDate(1)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: "$soTien" } },
        },
      },
    ]),

    // Popular documents
    Document.find()
      .sort({ "thongKe.luotTaiXuong": -1 })
      .limit(5)
      .select("thongTinDaNgonNgu thongKe"),
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalDocuments,
        totalUsers,
        totalCategories,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      thisMonth: {
        documents: documentsThisMonth,
        users: usersThisMonth,
        revenue: revenueThisMonth[0]?.total || 0,
      },
      popularDocuments,
    },
  });
});

/**
 * Get revenue statistics
 */
export const getRevenueStats = asyncHandler(async (req, res) => {
  const { period = "month", year = new Date().getFullYear() } = req.query;

  let groupBy;
  let dateFilter = {
    $gte: new Date(`${year}-01-01`),
    $lte: new Date(`${year}-12-31`),
  };

  switch (period) {
    case "day":
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      break;
    case "month":
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      break;
    case "year":
      groupBy = {
        year: { $year: "$createdAt" },
      };
      dateFilter = {}; // Show all years
      break;
    default:
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
  }

  const revenueData = await Transaction.aggregate([
    {
      $match: {
        loaiGiaoDich: "tai_xuong",
        trangThai: "completed",
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: { $abs: "$soTien" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  res.json({
    success: true,
    data: revenueData,
  });
});

/**
 * Get document statistics
 */
export const getDocumentStats = asyncHandler(async (req, res) => {
  const [byCategory, byType, byStatus, topRated, recentlyAdded] =
    await Promise.all([
      // Documents by category
      Document.aggregate([
        {
          $group: {
            _id: "$danhMuc",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $project: {
            category: "$category.tenDanhMuc",
            count: 1,
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),

      // Documents by type
      Document.aggregate([
        {
          $group: {
            _id: "$loaiTaiLieu",
            count: { $sum: 1 },
          },
        },
      ]),

      // Documents by status
      Document.aggregate([
        {
          $group: {
            _id: "$trangThaiDuyet",
            count: { $sum: 1 },
          },
        },
      ]),

      // Top rated documents
      Document.find()
        .sort({ "thongKe.danhGia.diemTrungBinh": -1 })
        .limit(10)
        .select("thongTinDaNgonNgu thongKe.danhGia"),

      // Recently added
      Document.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("thongTinDaNgonNgu createdAt")
        .populate("nguoiUpload", "hoTen"),
    ]);

  res.json({
    success: true,
    data: {
      byCategory,
      byType,
      byStatus,
      topRated,
      recentlyAdded,
    },
  });
});

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const now = new Date();
  let startDate;

  switch (period) {
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const stats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: period === "year" ? "%Y-%m" : "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get activity logs
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    loaiHanhDong,
    userId,
    startDate,
    endDate,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = {};

  if (loaiHanhDong) {
    query.loaiHanhDong = loaiHanhDong;
  }

  if (userId) {
    query.nguoiDung = userId;
  }

  if (startDate || endDate) {
    query.thoiGian = {};
    if (startDate) query.thoiGian.$gte = new Date(startDate);
    if (endDate) query.thoiGian.$lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .populate("nguoiDung", "hoTen email")
      .populate("chiTiet.taiLieu", "thongTinDaNgonNgu.tieuDe")
      .sort({ thoiGian: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      logs,
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
 * Get file statistics
 * @route GET /api/dashboard/files
 * @access Private/Admin
 */
export const getFileStats = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const now = new Date();
  let startDate;

  switch (period) {
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const stats = await File.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: period === "year" ? "%Y-%m" : "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Get recent activities
 * @route GET /api/dashboard/activities
 * @access Private/Admin
 */
export const getRecentActivities = asyncHandler(async (req, res) => {
  const activities = await UserActivity.find()
    .populate("nguoiDung", "tenDangNhap")
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: activities,
  });
});

/**
 * Get top downloads
 * @route GET /api/dashboard/top-downloads
 * @access Private/Admin
 */
export const getTopDownloads = asyncHandler(async (req, res) => {
  const topDownloads = await File.find()
    .sort({ downloadCount: -1 })
    .limit(10)
    .populate("nguoiUpload", "tenDangNhap");

  res.status(200).json({
    success: true,
    data: topDownloads,
  });
});

/**
 * Get top users
 * @route GET /api/dashboard/top-users
 * @access Private/Admin
 */
export const getTopUsers = asyncHandler(async (req, res) => {
  const topUsers = await User.find()
    .sort({ soDuTaiKhoan: -1 })
    .limit(10)
    .select("-matKhau -tokenLamMoi");

  res.status(200).json({
    success: true,
    data: topUsers,
  });
});

export const getRevenueStatistics = getRevenueStats;
export const getUserStatistics = getUserStats;
export const getFileStatistics = getFileStats;

/**
 * Get current user's document count
 * @route GET /api/dashboard/me/documents/count
 * @access Private (any authenticated user)
 */
export const getMyDocumentsCount = asyncHandler(async (req, res) => {
  const [total, approved, pending, rejected] = await Promise.all([
    Document.countDocuments({ nguoiUpload: req.userId }),
    Document.countDocuments({
      nguoiUpload: req.userId,
      trangThaiDuyet: "da_duyet",
    }),
    Document.countDocuments({
      nguoiUpload: req.userId,
      trangThaiDuyet: "cho_duyet",
    }),
    Document.countDocuments({
      nguoiUpload: req.userId,
      trangThaiDuyet: "tu_choi",
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      approved,
      pending,
      rejected,
    },
  });
});
