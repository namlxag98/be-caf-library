import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import Comment from "../models/Comment.js";
import { logger } from "../utils/logger.js";
import File from "../models/File.js";
import UserActivity from "../models/UserActivity.js";
import Document from "../models/Document.js";

/**
 * Lấy danh sách bình luận của file
 * @route GET /api/files/:fileId/commentsupdateComment
 * @access Public
 */
export const getFileComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { file: req.params.fileId };

  const comments = await Comment.find(query)
    .populate("nguoiDung", "ten email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Comment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

/**
 * Tạo bình luận mới
 * @route POST /api/files/:fileId/comments
 * @access Private
 */
export const createComment = asyncHandler(async (req, res) => {
  const { noiDung } = req.body;
  const fileId = req.params.fileId;

  const file = await File.findById(fileId);
  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  const comment = await Comment.create({
    noiDung,
    file: fileId,
    nguoiDung: req.user._id,
  });

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "binh_luan",
    chiTiet: { fileId, commentId: comment._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Comment ${comment._id} được tạo bởi user ${req.user._id}`);

  res.status(201).json({
    success: true,
    data: comment,
  });
});

/**
 * Cập nhật bình luận
 * @route PUT /api/comments/:id
 * @access Private
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { noiDung } = req.body;
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy bình luận",
    });
  }

  // Kiểm tra quyền sở hữu
  if (
    comment.nguoiDung.toString() !== req.user._id.toString() &&
    req.user.vaiTro !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: "Không có quyền cập nhật bình luận này",
    });
  }

  comment.noiDung = noiDung;
  await comment.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "cap_nhat_binh_luan",
    chiTiet: { commentId: comment._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Comment ${comment._id} được cập nhật bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

/**
 * Xóa bình luận
 * @route DELETE /api/comments/:id
 * @access Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy bình luận",
    });
  }

  // Kiểm tra quyền sở hữu
  if (
    comment.nguoiDung.toString() !== req.user._id.toString() &&
    req.user.vaiTro !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: "Không có quyền xóa bình luận này",
    });
  }

  await comment.remove();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "xoa_binh_luan",
    chiTiet: { commentId: comment._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Comment ${comment._id} bị xóa bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Xóa bình luận thành công",
  });
});

/**
 * Get replies for a comment
 */
export const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [replies, total] = await Promise.all([
    Comment.find({
      binhLuanCha: commentId,
      trangThai: "active",
    })
      .populate("nguoiDung", "hoTen avatar vaiTro")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments({
      binhLuanCha: commentId,
      trangThai: "active",
    }),
  ]);

  res.json({
    success: true,
    data: {
      replies,
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
 * Like/unlike comment
 */
export const toggleLikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Comment not found",
    });
  }

  const userIndex = comment.luotThich.indexOf(req.userId);

  if (userIndex > -1) {
    // Unlike
    comment.luotThich.splice(userIndex, 1);
  } else {
    // Like
    comment.luotThich.push(req.userId);
  }

  await comment.save();

  res.json({
    success: true,
    data: {
      liked: userIndex === -1,
      totalLikes: comment.luotThich.length,
    },
  });
});

/**
 * Report comment
 */
export const reportComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { lyDo } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Here you would typically create a report record
  // For now, we'll just log it
  logger.info(
    `Comment ${commentId} reported by user ${req.userId} for: ${lyDo}`
  );

  res.json({
    success: true,
    message: "Báo cáo bình luận thành công",
  });
});

/**
 * Lấy danh sách bình luận của tài liệu
 * @route GET /api/documents/:documentId/comments
 * @access Public
 */
export const getComments = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { page = 1, limit = 10, sort = "-ngayTao" } = req.query;
  const skip = (page - 1) * limit;

  // Kiểm tra tài liệu tồn tại
  const document = await Document.findById(documentId);
  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy tài liệu",
    });
  }

  // Xây dựng query
  const query = {
    taiLieu: documentId,
    binhLuanCha: null, // Chỉ lấy các bình luận gốc
    trangThai: "active", // Chỉ lấy bình luận đang hoạt động
  };

  // Thực hiện query với populate và phân trang
  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate("nguoiDung", "hoTen avatar")
      .populate({
        path: "binhLuanCon",
        populate: {
          path: "nguoiDung",
          select: "hoTen avatar",
        },
        options: { sort: { ngayTao: 1 } },
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Comment.countDocuments(query),
  ]);

  // Tính toán thông tin phân trang
  const pagination = {
    page: Number(page),
    limit: Number(limit),
    total,
    pages: Math.ceil(total / limit),
  };

  // Log activity nếu người dùng đã đăng nhập
  if (req.userId) {
    await UserActivity.create({
      nguoiDung: req.userId,
      hanhDong: "xem_binh_luan",
      chiTiet: { documentId },
      diaChiIP: req.ip,
      thietBi: req.headers["user-agent"],
    });
  }

  res.json({
    success: true,
    data: comments,
    pagination,
  });
});

/**
 * Duyệt bình luận (Admin only)
 * @route POST /api/comments/approve/:id
 * @access Private/Admin
 */
export const approveComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy bình luận",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể duyệt bình luận",
    });
  }

  comment.trangThai = "active";
  comment.nguoiDuyet = req.user._id;
  comment.thoiGianDuyet = new Date();

  await comment.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "duyet_binh_luan",
    chiTiet: { commentId: comment._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Comment ${comment._id} được duyệt bởi admin ${req.user._id}`);

  res.json({
    success: true,
    data: comment,
    message: "Duyệt bình luận thành công",
  });
});
