import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import Document from "../models/Document.js";
import Category from "../models/Category.js";
import { googleDriveService } from "../services/googleDriveService.js";
import { logger } from "../utils/logger.js";
import UserActivity from "../models/UserActivity.js";
import fs from "fs";
import path from "path";
import os from "os";
import slugify from "slugify";

/**
 * Create a new document with file upload
 */
export const createDocument = asyncHandler(async (req, res) => {
  const {
    thongTinDaNgonNgu,
    tacGia,
    danhMuc,
    customFields,
    searchMetadata,
    gia,
  } = req.body;

  // Validate category exists
  const category = await Category.findById(danhMuc);
  if (!category) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Category not found",
    });
  }

  // Validate custom fields based on category configuration
  if (category.customFieldsConfig && category.customFieldsConfig.required) {
    const missingFields = [];
    const customFieldsData = customFields || {};

    for (const requiredField of category.customFieldsConfig.required) {
      if (!customFieldsData[requiredField]) {
        missingFields.push(requiredField);
      }
    }

    if (missingFields.length > 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Thiếu thông tin bắt buộc cho danh mục này",
        requiredFields: missingFields,
      });
    }

    // Validate field types and constraints
    if (category.customFieldsConfig.fieldTypes) {
      const fieldErrors = [];
      const fieldTypes = category.customFieldsConfig.fieldTypes;
      for (const [fieldName, fieldConfig] of Object.entries(fieldTypes)) {
        const fieldValue = customFieldsData[fieldName];

        if (fieldValue !== undefined) {
          // Type validation
          switch (fieldConfig.type) {
            case "string":
              if (typeof fieldValue !== "string") {
                fieldErrors.push({
                  field: `customFields.${fieldName}`,
                  message: `${fieldName} phải là chuỗi`,
                });
              }
              break;
            case "number":
              if (typeof fieldValue !== "number" || isNaN(fieldValue)) {
                fieldErrors.push({
                  field: `customFields.${fieldName}`,
                  message: `${fieldName} phải là số`,
                });
              }
              break;
            case "boolean":
              if (typeof fieldValue !== "boolean") {
                fieldErrors.push({
                  field: `customFields.${fieldName}`,
                  message: `${fieldName} phải là boolean`,
                });
              }
              break;
            case "date":
              if (isNaN(Date.parse(fieldValue))) {
                fieldErrors.push({
                  field: `customFields.${fieldName}`,
                  message: `${fieldName} phải là ngày hợp lệ`,
                });
              }
              break;
            case "array":
              if (!Array.isArray(fieldValue)) {
                fieldErrors.push({
                  field: `customFields.${fieldName}`,
                  message: `${fieldName} phải là mảng`,
                });
              }
              break;
            case "object":
              if (typeof fieldValue !== "object" || Array.isArray(fieldValue)) {
                fieldErrors.push({
                  field: `customFields.${fieldName}`,
                  message: `${fieldName} phải là đối tượng`,
                });
              }
              break;
          }

          // Additional validation
          if (fieldConfig.validation) {
            const validation = fieldConfig.validation;

            if (validation.min !== undefined && fieldValue < validation.min) {
              fieldErrors.push({
                field: `customFields.${fieldName}`,
                message: `${fieldName} phải lớn hơn hoặc bằng ${validation.min}`,
              });
            }

            if (validation.max !== undefined && fieldValue > validation.max) {
              fieldErrors.push({
                field: `customFields.${fieldName}`,
                message: `${fieldName} phải nhỏ hơn hoặc bằng ${validation.max}`,
              });
            }

            if (
              validation.pattern &&
              !new RegExp(validation.pattern).test(fieldValue)
            ) {
              fieldErrors.push({
                field: `customFields.${fieldName}`,
                message: `${fieldName} không đúng định dạng`,
              });
            }

            if (validation.enum && !validation.enum.includes(fieldValue)) {
              fieldErrors.push({
                field: `customFields.${fieldName}`,
                message: `${fieldName} phải là một trong các giá trị: ${validation.enum.join(
                  ", "
                )}`,
              });
            }
          }
        }
      }

      if (fieldErrors.length > 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors: fieldErrors,
        });
      }
    }
  }

  // Process uploaded files
  if (!googleDriveService.drive) {
    await googleDriveService.initialize();
  }
  const files = [];
  if (req.files && req.files.length > 0) {
    // Lấy tiêu đề document (ưu tiên tiếng Việt)
    const docTitle = thongTinDaNgonNgu?.tieuDe?.vi || "document";
    // Hàm slugify đơn giản nếu chưa có
    const toSlug = (str) => slugify(str, { lower: true, strict: true });
    for (const file of req.files) {
      try {
        let tempPath = file.path;
        // Nếu file là buffer (memoryStorage), lưu ra file tạm
        if (!tempPath && file.buffer) {
          tempPath = path.join(
            os.tmpdir(),
            `${Date.now()}-${file.originalname}`
          );
          fs.writeFileSync(tempPath, file.buffer);
        }
        // Lấy phần mở rộng file
        const ext = path.extname(file.originalname);
        // Đặt tên file theo slug document
        const slugFileName = `${toSlug(docTitle)}${ext}`;
        // Kiểm tra file tồn tại trước khi upload
        console.log(
          "Uploading file from tempPath:",
          tempPath,
          "Exists:",
          fs.existsSync(tempPath)
        );
        const driveFile = await googleDriveService.uploadFile(
          tempPath,
          slugFileName,
          file.mimetype
        );
        // Xóa file tạm nếu có
        if (file.buffer && tempPath) {
          fs.unlinkSync(tempPath);
        }
        files.push({
          tenFile: {
            vi: slugFileName,
            en: slugFileName,
          },
          tenFileGoc: file.originalname,
          loaiFile: file.mimetype,
          googleDriveFileId: driveFile.fileId,
          kichThuocFile: file.size,
          nguoiUpload: req.userId,
        });
      } catch (error) {
        logger.error("Error uploading file:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: `Failed to upload file: ${file.originalname}`,
        });
      }
    }
  }

  // Set approval status based on user role
  let trangThaiDuyet = "cho_duyet";
  if (req.user.vaiTro === "admin") {
    trangThaiDuyet = "da_duyet";
  }

  // Create document
  const document = new Document({
    thongTinDaNgonNgu,
    tacGia,
    danhMuc,
    customFields: customFields || {},
    files,
    searchMetadata,
    gia,
    nguoiUpload: req.userId,
    trangThaiDuyet,
  });

  const savedDocument = await document.save();
  await savedDocument.populate("danhMuc");

  // Log activity
  await UserActivity.create({
    nguoiDung: req.userId,
    hanhDong: "upload_tai_lieu",
    chiTiet: {
      taiLieu: savedDocument._id,
      noiDung: `Uploaded document: ${thongTinDaNgonNgu.tieuDe.vi}`,
    },
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: savedDocument,
  });
});

/**
 * Get all documents with search and filter
 */
export const getDocuments = asyncHandler(async (req, res) => {
  const {
    q, // search query
    language = "both",
    category,
    author,
    yearFrom,
    yearTo,
    status,
    pricing,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build search query
  let searchQuery = {};

  // Set default filter based on user role and authentication
  if (req.user) {
    const isAdmin = req.user.vaiTro === "admin";
    const isTeacher = req.user.vaiTro === "teacher";
    
    if (isAdmin) {
      // Admin can see all documents by default, but can filter by status
      if (!req.query.trangThaiDuyet) {
        // If no status filter specified, show all documents
        delete searchQuery.trangThaiDuyet;
      }
    } else if (isTeacher) {
      // Teacher can see their own documents (any status) + others' approved documents
      if (!req.query.trangThaiDuyet) {
        searchQuery.$or = [
          { nguoiUpload: req.userId }, // Own documents (any status)
          { trangThaiDuyet: "da_duyet" } // Others' approved documents
        ];
        delete searchQuery.trangThaiDuyet;
      }
    } else {
      // Regular users can only see approved documents
      searchQuery.trangThaiDuyet = "da_duyet";
    }
  } else {
    // Public access - only approved documents
    searchQuery.trangThaiDuyet = "da_duyet";
  }

  // Text search - sửa logic để tìm kiếm linh hoạt hơn
  if (q) {
    // Tìm kiếm trong nhiều trường thay vì chỉ dùng $text
    const searchRegex = { $regex: q, $options: "i" };
    searchQuery.$or = [
      { "thongTinDaNgonNgu.tieuDe.vi": searchRegex },
      { "thongTinDaNgonNgu.tieuDe.en": searchRegex },
      { "thongTinDaNgonNgu.tomTat.vi": searchRegex },
      { "thongTinDaNgonNgu.tomTat.en": searchRegex },
      { "thongTinDaNgonNgu.tuKhoa.vi": searchRegex },
      { "thongTinDaNgonNgu.tuKhoa.en": searchRegex },
      { "searchMetadata.searchTextVi": searchRegex },
      { "searchMetadata.searchTextEn": searchRegex },
      { "searchMetadata.allKeywords": searchRegex }
    ];
  }

  // Filters
  if (category) {
    searchQuery.danhMuc = category;
  }

  if (author) {
    searchQuery.$or = [
      { "tacGia.hoTen.vi": { $regex: author, $options: "i" } },
      { "tacGia.hoTen.en": { $regex: author, $options: "i" } },
    ];
  }

  if (yearFrom || yearTo) {
    searchQuery["searchMetadata.filterTags.namXuatBan"] = {};
    if (yearFrom)
      searchQuery["searchMetadata.filterTags.namXuatBan"].$gte =
        parseInt(yearFrom);
    if (yearTo)
      searchQuery["searchMetadata.filterTags.namXuatBan"].$lte =
        parseInt(yearTo);
  }

  if (status) {
    searchQuery["searchMetadata.filterTags.tinhTrang"] = status;
  }

  // Override status filter if explicitly specified
  if (req.query.trangThaiDuyet) {
    // If status is explicitly requested, use it and remove the $or condition
    if (searchQuery.$or) {
      delete searchQuery.$or;
    }
    searchQuery.trangThaiDuyet = req.query.trangThaiDuyet;
  }

  if (pricing === "mien_phi") {
    searchQuery["gia.mienPhi"] = true;
  } else if (pricing === "tra_phi") {
    searchQuery["gia.mienPhi"] = false;
  }

  // Log query để debug
  console.log("Search Query:", JSON.stringify(searchQuery, null, 2));

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const [documents, totalCount] = await Promise.all([
    Document.find(searchQuery)
      .populate("danhMuc")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Document.countDocuments(searchQuery),
  ]);

  // Log results để debug
  console.log("Found documents:", documents.length);
  console.log("Total count:", totalCount);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    },
  });
});

/**
 * Get document by ID
 */
export const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).populate("danhMuc");

  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Document not found",
    });
  }

  // Check viewing permissions based on role and ownership
  if (req.user) {
    const isOwner = document.nguoiUpload.toString() === req.userId.toString();
    const isAdmin = req.user.vaiTro === "admin";
    const isTeacher = req.user.vaiTro === "teacher";
    
    if (isAdmin) {
      // Admin can view all documents
    } else if (isTeacher) {
      // Teacher can view their own documents (any status) or others' approved documents
      if (!isOwner && document.trangThaiDuyet !== "da_duyet") {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: "Bạn không có quyền xem tài liệu này",
        });
      }
    } else {
      // Regular users can only view approved documents
      if (document.trangThaiDuyet !== "da_duyet") {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: "Bạn không có quyền xem tài liệu này",
        });
      }
    }
  } else {
    // Public access - only approved documents
    if (document.trangThaiDuyet !== "da_duyet") {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Bạn không có quyền xem tài liệu này",
      });
    }
  }

  // Increment view count
  document.thongKe.luotXem += 1;
  await document.save();

  res.json({
    success: true,
    data: document,
  });
});

/**
 * Download file from document
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { documentId, fileId } = req.params;

  const document = await Document.findById(documentId);
  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Document not found",
    });
  }

  const file = document.files.id(fileId);
  if (!file) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "File not found",
    });
  }

  try {
    const fileStream = await googleDriveService.downloadFile(
      file.googleDriveFileId
    );

    // Set headers
    res.setHeader("Content-Type", file.loaiFile);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.tenFileGoc}"`
    );

    // Increment download count
    document.thongKe.luotTaiXuong += 1;
    await document.save();

    // Pipe the stream to response
    fileStream.pipe(res);
  } catch (error) {
    logger.error("Error downloading file:", error);
    logger.error("Error message:", error.message);
    logger.error("Error stack:", error.stack);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to download file",
      error: error.message,
      stack: error.stack,
    });
  }
});

/**
 * Update document
 */
export const updateDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy tài liệu",
    });
  }

  // Check editing permissions based on role and ownership
  const isOwner = document.nguoiUpload.toString() === req.userId.toString();
  const isAdmin = req.user.vaiTro === "admin";
  const isTeacher = req.user.vaiTro === "teacher";
  
  if (isAdmin) {
    // Admin can edit all documents
  } else if (isTeacher) {
    // Teacher can only edit their own documents
    if (!isOwner) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Bạn chỉ có thể sửa tài liệu của mình",
      });
    }
  } else {
    // Regular users can only edit their own documents
    if (!isOwner) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Bạn chỉ có thể sửa tài liệu của mình",
      });
    }
  }

  // Nếu là admin, có thể cập nhật mọi trường
  // Nếu là người tạo, chỉ có thể cập nhật một số trường
  const allowedFields =
    req.user.vaiTro === "admin"
      ? ["tieuDe", "moTa", "tuKhoa", "danhMuc", "gia", "trangThai"]
      : ["tieuDe", "moTa", "tuKhoa", "danhMuc", "gia"];

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      document[key] = req.body[key];
    }
  });

  // Nếu cập nhật file, xử lý upload
  if (req.file) {
    const oldFileId = document.fileId;
    const uploadResult = await googleDriveService.uploadFile(req.file);

    document.fileId = uploadResult.id;
    document.duongDan = uploadResult.webViewLink;
    document.kichThuoc = uploadResult.size;
    document.loaiFile = uploadResult.mimeType;

    // Xóa file cũ
    if (oldFileId) {
      await googleDriveService.deleteFile(oldFileId);
    }
  }

  await document.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.userId,
    hanhDong: "cap_nhat_tai_lieu",
    chiTiet: { documentId: document._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Document ${document._id} được cập nhật bởi ${req.userId}`);

  res.json({
    success: true,
    message: "Cập nhật tài liệu thành công",
    data: document,
  });
});

/**
 * Delete document
 */
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy tài liệu",
    });
  }

  // Check deletion permissions based on role and ownership
  const isOwner = document.nguoiUpload.toString() === req.userId.toString();
  const isAdmin = req.user.vaiTro === "admin";
  const isTeacher = req.user.vaiTro === "teacher";
  
  if (isAdmin) {
    // Admin can delete all documents
  } else if (isTeacher) {
    // Teacher can only delete their own documents
    if (!isOwner) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Bạn chỉ có thể xóa tài liệu của mình",
      });
    }
  } else {
    // Regular users can only delete their own documents
    if (!isOwner) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Bạn chỉ có thể xóa tài liệu của mình",
      });
    }
  }

  // Xóa file từ Google Drive
  if (document.fileId) {
    await googleDriveService.deleteFile(document.fileId);
  }

  await document.deleteOne();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.userId,
    hanhDong: "xoa_tai_lieu",
    chiTiet: { documentId: document._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Document ${document._id} bị xóa bởi ${req.userId}`);

  res.json({
    success: true,
    message: "Xóa tài liệu thành công",
  });
});

/**
 * Phê duyệt tài liệu
 * @route PUT /api/documents/:id/approve
 * @access Private/Admin
 */
export const approveDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy tài liệu",
    });
  }

  if (document.trangThaiDuyet !== "cho_duyet") {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Tài liệu không ở trạng thái chờ duyệt",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể duyệt tài liệu",
    });
  }

  document.trangThaiDuyet = "da_duyet";
  document.nguoiDuyet = req.userId;
  document.ngayDuyet = new Date();
  document.lyDoTuChoi = null;

  await document.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.userId,
    hanhDong: "duyet_tai_lieu",
    chiTiet: { documentId: document._id },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Document ${document._id} được duyệt bởi admin ${req.userId}`);

  res.json({
    success: true,
    message: "Duyệt tài liệu thành công",
    data: document,
  });
});

/**
 * Từ chối tài liệu
 * @route PUT /api/documents/:id/reject
 * @access Private/Admin
 */
export const rejectDocument = asyncHandler(async (req, res) => {
  const { lyDoTuChoi } = req.body;

  if (!lyDoTuChoi) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Vui lòng cung cấp lý do từ chối",
    });
  }

  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy tài liệu",
    });
  }

  if (document.trangThaiDuyet !== "cho_duyet") {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Tài liệu không ở trạng thái chờ duyệt",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể từ chối tài liệu",
    });
  }

  document.trangThaiDuyet = "tu_choi";
  document.nguoiDuyet = req.userId;
  document.ngayDuyet = new Date();
  document.lyDoTuChoi = lyDoTuChoi;

  await document.save();

  // Log activity
  await UserActivity.create({
    nguoiDung: req.userId,
    hanhDong: "tu_choi_tai_lieu",
    chiTiet: {
      documentId: document._id,
      lyDoTuChoi,
    },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(`Document ${document._id} bị từ chối bởi admin ${req.userId}`);

  res.json({
    success: true,
    message: "Từ chối tài liệu thành công",
    data: document,
  });
});

/**
 * Tìm kiếm tài liệu
 * @route GET /api/documents/search
 * @access Public
 */
export const searchDocuments = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = {
    trangThaiDuyet: "da_duyet",
    $or: [
      { "thongTinDaNgonNgu.tieuDe.vi": { $regex: q, $options: "i" } },
      { "thongTinDaNgonNgu.tieuDe.en": { $regex: q, $options: "i" } },
      { "thongTinDaNgonNgu.tomTat.vi": { $regex: q, $options: "i" } },
      { "thongTinDaNgonNgu.tomTat.en": { $regex: q, $options: "i" } },
      { "thongTinDaNgonNgu.tuKhoa.vi": { $regex: q, $options: "i" } },
      { "thongTinDaNgonNgu.tuKhoa.en": { $regex: q, $options: "i" } },
      { "searchMetadata.searchTextVi": { $regex: q, $options: "i" } },
      { "searchMetadata.searchTextEn": { $regex: q, $options: "i" } },
      { "searchMetadata.allKeywords": { $regex: q, $options: "i" } },
    ],
  };

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate("nguoiTao", "hoTen email")
      .populate("danhMuc", "ten")
      .sort({ ngayTao: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Lọc tài liệu theo danh mục
 * @route GET /api/documents/category/:categoryId
 * @access Public
 */
export const getDocumentsByCategory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = {
    danhMuc: req.params.categoryId,
    trangThaiDuyet: "da_duyet",
  };

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate("nguoiTao", "hoTen email")
      .populate("danhMuc", "ten")
      .sort({ ngayTao: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Lọc tài liệu theo người tạo
 * @route GET /api/documents/user/:userId
 * @access Public
 */
export const getDocumentsByUser = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = {
    nguoiTao: req.params.userId,
    trangThaiDuyet: "da_duyet",
  };

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate("nguoiTao", "hoTen email")
      .populate("danhMuc", "ten")
      .sort({ ngayTao: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Lấy tài liệu đang chờ duyệt
 * @route GET /api/documents/pending
 * @access Private/Admin
 */
export const getPendingDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { trangThaiDuyet: "cho_duyet" };

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate("nguoiTao", "hoTen email")
      .populate("danhMuc", "ten")
      .sort({ ngayTao: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Lấy tài liệu bị từ chối
 * @route GET /api/documents/rejected
 * @access Private/Admin
 */
export const getRejectedDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { trangThaiDuyet: "tu_choi" };

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate("nguoiTao", "hoTen email")
      .populate("danhMuc", "ten")
      .populate("nguoiDuyet", "hoTen email")
      .sort({ ngayDuyet: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Lấy thống kê tài liệu
 * @route GET /api/documents/stats
 * @access Private/Admin
 */
export const getDocumentStats = asyncHandler(async (req, res) => {
  const stats = await Document.aggregate([
    {
      $group: {
        _id: "$trangThai",
        count: { $sum: 1 },
        totalViews: { $sum: "$luotXem" },
        totalDownloads: { $sum: "$luotTai" },
        totalRevenue: { $sum: "$gia" },
      },
    },
  ]);

  const categoryStats = await Document.aggregate([
    {
      $group: {
        _id: "$danhMuc",
        count: { $sum: 1 },
        totalViews: { $sum: "$luotXem" },
        totalDownloads: { $sum: "$luotTai" },
        totalRevenue: { $sum: "$gia" },
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
        _id: 1,
        categoryName: "$category.ten",
        count: 1,
        totalViews: 1,
        totalDownloads: 1,
        totalRevenue: 1,
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      byStatus: stats,
      byCategory: categoryStats,
    },
  });
});

/**
 * Lấy tài liệu phổ biến
 * @route GET /api/documents/popular
 * @access Public
 */
export const getPopularDocuments = asyncHandler(async (req, res) => {
  const { limit = 10, timeRange = "week" } = req.query;

  let dateFilter = {};
  const now = new Date();

  switch (timeRange) {
    case "day":
      dateFilter = {
        ngayTao: { $gte: new Date(now.setDate(now.getDate() - 1)) },
      };
      break;
    case "week":
      dateFilter = {
        ngayTao: { $gte: new Date(now.setDate(now.getDate() - 7)) },
      };
      break;
    case "month":
      dateFilter = {
        ngayTao: { $gte: new Date(now.setMonth(now.getMonth() - 1)) },
      };
      break;
    case "year":
      dateFilter = {
        ngayTao: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) },
      };
      break;
  }

  const documents = await Document.find({
    ...dateFilter,
    trangThai: "approved",
  })
    .populate("nguoiTao", "hoTen email")
    .populate("danhMuc", "ten")
    .sort({ luotTai: -1, luotXem: -1 })
    .limit(Number(limit));

  res.json({
    success: true,
    data: documents,
  });
});

/**
 * Lấy tài liệu mới nhất
 * @route GET /api/documents/latest
 * @access Public
 */
export const getLatestDocuments = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const documents = await Document.find({ trangThai: "approved" })
    .populate("nguoiTao", "hoTen email")
    .populate("danhMuc", "ten")
    .sort({ ngayTao: -1 })
    .limit(Number(limit));

  res.json({
    success: true,
    data: documents,
  });
});
