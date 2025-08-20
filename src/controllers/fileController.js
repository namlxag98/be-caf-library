import File from "../models/File.js";
import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";
import asyncHandler from "express-async-handler";
import { logger } from "../utils/logger.js";
import httpStatus from "http-status";

/**
 * Lấy danh sách file
 * @route GET /api/files
 * @access Public
 */
export const getFiles = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const query = { daDuyet: true };

  if (search) {
    query.$or = [
      { ten: { $regex: search, $options: "i" } },
      { moTa: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.danhMuc = category;
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const files = await File.find(query)
    .populate("nguoiUpload", "ten email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await File.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      files,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

/**
 * Lấy file theo ID
 * @route GET /api/files/:id
 * @access Public
 */
export const getFileById = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id)
    .populate("nguoiUpload", "ten email")
    .populate("nguoiDuyet", "ten email");

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  res.status(200).json({
    success: true,
    data: file,
  });
});

/**
 * Tạo file mới
 * @route POST /api/files
 * @access Private
 */
export const createFile = asyncHandler(async (req, res) => {
  const { ten, moTa, duongDan, kichThuoc, loaiFile, gia, danhMuc } = req.body;

  const file = await File.create({
    ten,
    moTa,
    duongDan,
    kichThuoc,
    loaiFile,
    gia,
    danhMuc,
    nguoiUpload: req.user._id,
  });

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "tai_len",
    chiTiet: { fileId: file._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`File ${file._id} được tạo bởi user ${req.user._id}`);

  res.status(201).json({
    success: true,
    data: file,
  });
});

/**
 * Cập nhật file
 * @route PUT /api/files/:id
 * @access Private
 */
export const updateFile = asyncHandler(async (req, res) => {
  const { ten, moTa, gia, danhMuc } = req.body;
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  // Kiểm tra quyền sở hữu
  if (
    file.nguoiUpload.toString() !== req.user._id.toString() &&
    req.user.vaiTro !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: "Không có quyền cập nhật file này",
    });
  }

  if (ten) file.ten = ten;
  if (moTa) file.moTa = moTa;
  if (gia) file.gia = gia;
  if (danhMuc) file.danhMuc = danhMuc;

  await file.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "cap_nhat_file",
    chiTiet: { fileId: file._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`File ${file._id} được cập nhật bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: file,
  });
});

/**
 * Xóa file
 * @route DELETE /api/files/:id
 * @access Private
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  // Kiểm tra quyền sở hữu
  if (
    file.nguoiUpload.toString() !== req.user._id.toString() &&
    req.user.vaiTro !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: "Không có quyền xóa file này",
    });
  }

  await file.remove();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "xoa_file",
    chiTiet: { fileId: file._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`File ${file._id} bị xóa bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: "Xóa file thành công",
  });
});

/**
 * Duyệt file
 * @route PUT /api/files/:id/approve
 * @access Private/Admin
 */
export const approveFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể duyệt file",
    });
  }

  file.daDuyet = true;
  file.nguoiDuyet = req.user._id;
  file.thoiGianDuyet = Date.now();

  await file.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "duyet_file",
    chiTiet: { fileId: file._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`File ${file._id} được duyệt bởi admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: file,
  });
});

/**
 * Tải file
 * @route GET /api/files/:id/download
 * @access Private
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: "Không tìm thấy file",
    });
  }

  if (!file.daDuyet) {
    return res.status(403).json({
      success: false,
      error: "File chưa được duyệt",
    });
  }

  // Kiểm tra số dư
  const user = await User.findById(req.user._id);
  if (user.soDu < file.gia) {
    return res.status(400).json({
      success: false,
      error: "Số dư không đủ",
    });
  }

  // Cập nhật số dư
  user.soDu -= file.gia;
  await user.save();

  // Cập nhật lượt tải
  file.luotTai += 1;
  await file.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "tai_xuong",
    chiTiet: { fileId: file._id, gia: file.gia },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`File ${file._id} được tải bởi user ${req.user._id}`);

  res.status(200).json({
    success: true,
    data: {
      duongDan: file.duongDan,
      ten: file.ten,
      loaiFile: file.loaiFile,
    },
  });
});

/**
 * Upload file
 * @route POST /api/files/upload
 * @access Private
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Không có file được upload",
    });
  }

  const { ten, moTa, gia, danhMuc } = req.body;

  const file = await File.create({
    ten: ten || req.file.originalname,
    moTa: moTa || "",
    duongDan: req.file.path,
    kichThuoc: req.file.size,
    loaiFile: req.file.mimetype,
    gia: gia || 0,
    danhMuc: danhMuc,
    nguoiUpload: req.user._id,
    daDuyet: req.user.vaiTro === "admin", // Admin upload thì tự động duyệt
  });

  // Log activity
  await UserActivity.create({
    nguoiDung: req.user._id,
    hanhDong: "tai_len",
    chiTiet: { fileId: file._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`File ${file._id} được upload bởi user ${req.user._id}`);

  res.status(201).json({
    success: true,
    data: file,
    message: "Upload file thành công",
  });
});
