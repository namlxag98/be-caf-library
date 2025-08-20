import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import Rating from "../models/Rating.js";
import Document from "../models/Document.js";
import Transaction from "../models/Transaction.js";
import ActivityLog from "../models/ActivityLog.js";
import { logger } from "../utils/logger.js";
import File from "../models/File.js";
import UserActivity from "../models/UserActivity.js";

/**
 * Create or update rating
 */
export const createOrUpdateRating = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { diemDanhGia, binhLuan } = req.body;

  // Check if document exists
  const document = await Document.findById(documentId);
  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Document not found",
    });
  }

  // Check if user has downloaded this document
  const hasDownloaded = await Transaction.findOne({
    nguoiDung: req.userId,
    loaiGiaoDich: "tai_xuong",
    "chiTiet.taiLieu": documentId,
    trangThai: "completed",
  });

  if (!hasDownloaded) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "You can only rate documents you have downloaded",
    });
  }

  // Check if rating exists
  let rating = await Rating.findOne({
    taiLieu: documentId,
    nguoiDung: req.userId,
  });

  if (rating) {
    // Update existing rating
    rating.diemDanhGia = diemDanhGia;
    rating.binhLuan = binhLuan;
    await rating.save();
  } else {
    // Create new rating
    rating = await Rating.create({
      taiLieu: documentId,
      nguoiDung: req.userId,
      diemDanhGia,
      binhLuan,
    });
  }

  // Log activity
  await ActivityLog.create({
    nguoiDung: req.userId,
    loaiHanhDong: "danh_gia",
    chiTiet: {
      taiLieu: documentId,
      noiDung: `Rated ${diemDanhGia} stars`,
    },
  });

  res.json({
    success: true,
    data: rating,
  });
});

/**
 * Get ratings for document
 */
export const getRatings = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [ratings, total] = await Promise.all([
    Rating.find({
      taiLieu: documentId,
      trangThai: "active",
    })
      .populate("nguoiDung", "hoTen avatar")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Rating.countDocuments({
      taiLieu: documentId,
      trangThai: "active",
    }),
  ]);

  // Get rating distribution
  const distribution = await Rating.aggregate([
    {
      $match: {
        taiLieu: documentId,
        trangThai: "active",
      },
    },
    {
      $group: {
        _id: "$diemDanhGia",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  // Format distribution
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  distribution.forEach((item) => {
    ratingDistribution[item._id] = item.count;
  });

  res.json({
    success: true,
    data: {
      ratings,
      distribution: ratingDistribution,
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
 * Get user's rating for document
 */
export const getUserRating = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  const rating = await Rating.findOne({
    taiLieu: documentId,
    nguoiDung: req.userId,
  });

  res.json({
    success: true,
    data: rating,
  });
});

/**
 * Hide/unhide rating (admin only)
 */
export const toggleRatingVisibility = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;

  const rating = await Rating.findById(ratingId);

  if (!rating) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Rating not found",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể ẩn đánh giá",
    });
  }

  rating.trangThai = rating.trangThai === "active" ? "hidden" : "active";
  await rating.save();

  res.json({
    success: true,
    data: {
      trangThai: rating.trangThai,
    },
  });
});

/**
 * Lấy đánh giá của file
 * @route GET /api/files/:fileId/ratings
 * @access Public
 */
export const getFileRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { file: req.params.fileId };

  const ratings = await Rating.find(query)
    .populate("nguoiDung", "ten email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Rating.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      ratings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

/**
 * Tạo đánh giá mới
 * @route POST /api/files/:fileId/ratings
 * @access Private
 */
export const createRating = asyncHandler(async (req, res) => {
  const { diem, nhanXet } = req.body;
  const fileId = req.params.fileId;

  const file = await File.findById(fileId);
  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  // Kiểm tra xem user đã đánh giá chưa
  const existingRating = await Rating.findOne({
    file: fileId,
    nguoiDung: req.user._id,
  });

  if (existingRating) {
    return res.status(400).json({
      success: false,
      error: "Bạn đã đánh giá file này rồi",
    });
  }

  const rating = await Rating.create({
    diem,
    nhanXet,
    file: fileId,
    nguoiDung: req.user._id,
  });

  // Cập nhật điểm đánh giá trung bình của file
  const ratings = await Rating.find({ file: fileId });
  const tongDiem = ratings.reduce((sum, r) => sum + r.diem, 0);
  file.diemDanhGia = tongDiem / ratings.length;
  file.tongDanhGia = ratings.length;
  await file.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "danh_gia",
    chiTiet: { fileId, ratingId: rating._id, diem },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Rating ${rating._id} được tạo bởi user ${req.user._id}`);

  res.status(201).json({
    success: true,
    data: rating,
  });
});

/**
 * Cập nhật đánh giá
 * @route PUT /api/ratings/:id
 * @access Private
 */
export const updateRating = asyncHandler(async (req, res) => {
  const { diem, nhanXet } = req.body;
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy đánh giá",
    });
  }

  // Kiểm tra quyền sở hữu
  if (
    rating.nguoiDung.toString() !== req.user._id.toString() &&
    req.user.vaiTro !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: "Không có quyền cập nhật đánh giá này",
    });
  }

  rating.diem = diem;
  rating.nhanXet = nhanXet;
  await rating.save();

  // Cập nhật điểm đánh giá trung bình của file
  const file = await File.findById(rating.file);
  const ratings = await Rating.find({ file: rating.file });
  const tongDiem = ratings.reduce((sum, r) => sum + r.diem, 0);
  file.diemDanhGia = tongDiem / ratings.length;
  file.tongDanhGia = ratings.length;
  await file.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "cap_nhat_danh_gia",
    chiTiet: { ratingId: rating._id, diem },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Rating ${rating._id} được cập nhật bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: rating,
  });
});

/**
 * Xóa đánh giá
 * @route DELETE /api/ratings/:id
 * @access Private
 */
export const deleteRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy đánh giá",
    });
  }

  // Kiểm tra quyền sở hữu
  if (
    rating.nguoiDung.toString() !== req.user._id.toString() &&
    req.user.vaiTro !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: "Không có quyền xóa đánh giá này",
    });
  }

  await rating.remove();

  // Cập nhật điểm đánh giá trung bình của file
  const file = await File.findById(rating.file);
  const ratings = await Rating.find({ file: rating.file });
  const tongDiem = ratings.reduce((sum, r) => sum + r.diem, 0);
  file.diemDanhGia = ratings.length > 0 ? tongDiem / ratings.length : 0;
  file.tongDanhGia = ratings.length;
  await file.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "xoa_danh_gia",
    chiTiet: { ratingId: rating._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Rating ${rating._id} bị xóa bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Xóa đánh giá thành công",
  });
});
