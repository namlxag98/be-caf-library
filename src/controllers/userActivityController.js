import asyncHandler from "express-async-handler";
import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";
import File from "../models/File.js";
import Comment from "../models/Comment.js";

export const getUserActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, hanhDong } = req.query;
  const query = { nguoiDung: req.user._id };

  if (hanhDong) {
    query.hanhDong = hanhDong;
  }

  const activities = await UserActivity.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await UserActivity.countDocuments(query);

  res.json({
    activities,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalFiles,
    totalDownloads,
    totalComments,
    recentActivities,
  ] = await Promise.all([
    User.countDocuments(),
    File.countDocuments(),
    File.aggregate([{ $group: { _id: null, total: { $sum: "$luotTai" } } }]),
    Comment.countDocuments(),
    UserActivity.find()
      .populate("nguoiDung", "tenDangNhap")
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  res.json({
    totalUsers,
    totalFiles,
    totalDownloads: totalDownloads[0]?.total || 0,
    totalComments,
    recentActivities,
  });
});
