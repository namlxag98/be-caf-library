import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Document from "../models/Document.js";
import { logger } from "../utils/logger.js";
import File from "../models/File.js";
import UserActivity from "../models/UserActivity.js";

/**
 * Create new category
 */
export const createCategory = asyncHandler(async (req, res) => {
  const {
    tenDanhMuc,
    maDanhMuc,
    moTa,
    danhMucCha,
    thuTu,
    searchKeywords,
    customFieldsConfig,
  } = req.body;

  // Check if user is authenticated and has admin role
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Yêu cầu xác thực",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể tạo danh mục",
    });
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if category code already exists
    const existingCategory = await Category.findOne({ maDanhMuc }).session(
      session
    );
    if (existingCategory) {
      await session.abortTransaction();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Mã danh mục đã tồn tại",
      });
    }

    // Validate parent category if provided
    if (danhMucCha) {
      const parentCategory = await Category.findById(danhMucCha).session(
        session
      );
      if (!parentCategory) {
        await session.abortTransaction();
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Không tìm thấy danh mục cha",
        });
      }
    }

    // Create category
    const category = new Category({
      tenDanhMuc,
      maDanhMuc,
      moTa,
      danhMucCha,
      thuTu: thuTu || 0,
      kichHoat: true,
      searchKeywords,
      customFieldsConfig: customFieldsConfig || undefined,
    });

    const savedCategory = await category.save({ session });

    // Populate parent category
    await savedCategory.populate("danhMucCha");

    // Log activity
    try {
      await UserActivity.create(
        [
          {
            nguoiDung: req.user._id,
            hanhDong: "tao_danh_muc",
            chiTiet: {
              categoryId: savedCategory._id,
              categoryName: savedCategory.tenDanhMuc.vi,
              categoryCode: savedCategory.maDanhMuc,
            },
            diaChiIP: req.ip || "unknown",
            thietBi: req.headers["user-agent"] || "unknown",
          },
        ],
        { session }
      );
    } catch (activityError) {
      logger.warn("Failed to log activity:", activityError.message);
      // Don't fail the whole operation if activity logging fails
    }

    // Commit transaction
    await session.commitTransaction();

    logger.info(
      `Category ${savedCategory._id} được tạo bởi admin ${req.user._id}`
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      data: savedCategory,
      message: "Tạo danh mục thành công",
    });
  } catch (error) {
    // Abort transaction on any error
    await session.abortTransaction();

    logger.error("Error creating category:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Lỗi khi tạo danh mục",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // End session
    session.endSession();
  }
});

/**
 * Get all categories with hierarchy
 */
export const getCategories = asyncHandler(async (req, res) => {
  const {
    language = "both",
    active = true,
    parent,
    search,
    includeChildren = false,
  } = req.query;

  let query = {};

  // Filter by active status
  if (active !== "all") {
    query.kichHoat = active === "true";
  }

  // Filter by parent category
  if (parent === "root") {
    query.danhMucCha = null;
  } else if (parent && parent !== "all") {
    query.danhMucCha = parent;
  }

  // Search functionality
  if (search) {
    query.$or = [
      { "tenDanhMuc.vi": { $regex: search, $options: "i" } },
      { "tenDanhMuc.en": { $regex: search, $options: "i" } },
      { maDanhMuc: { $regex: search, $options: "i" } },
      { "searchKeywords.vi": { $in: [new RegExp(search, "i")] } },
      { "searchKeywords.en": { $in: [new RegExp(search, "i")] } },
    ];
  }

  const categories = await Category.find(query)
    .populate("danhMucCha")
    .sort({ thuTu: 1, "tenDanhMuc.vi": 1 });

  // Include children count if requested
  if (includeChildren === "true") {
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const childrenCount = await Category.countDocuments({
          danhMucCha: category._id,
          kichHoat: true,
        });

        const documentsCount = await Document.countDocuments({
          danhMuc: category._id,
          "searchMetadata.filterTags.tinhTrang": "cong_khai",
        });

        const categoryObj = category.toObject();
        categoryObj.childrenCount = childrenCount;
        categoryObj.documentsCount = documentsCount;
        return categoryObj;
      })
    );

    res.json({
      success: true,
      data: categoriesWithCounts,
    });
  } else {
    res.json({
      success: true,
      data: categories,
    });
  }
});

/**
 * Get category tree structure
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  const { language = "vi" } = req.query;

  const buildTree = async (parentId = null) => {
    const categories = await Category.find({
      danhMucCha: parentId,
      kichHoat: true,
    }).sort({ thuTu: 1, "tenDanhMuc.vi": 1 });

    const tree = [];

    for (const category of categories) {
      const documentsCount = await Document.countDocuments({
        danhMuc: category._id,
        "searchMetadata.filterTags.tinhTrang": "cong_khai",
      });

      const children = await buildTree(category._id);

      tree.push({
        _id: category._id,
        tenDanhMuc: category.tenDanhMuc,
        maDanhMuc: category.maDanhMuc,
        moTa: category.moTa,
        thuTu: category.thuTu,
        documentsCount,
        children: children.length > 0 ? children : undefined,
      });
    }

    return tree;
  };

  const categoryTree = await buildTree();

  res.json({
    success: true,
    data: categoryTree,
  });
});

/**
 * Get category by ID
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate(
    "danhMucCha"
  );

  if (!category) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy danh mục",
    });
  }

  // Get children categories
  const children = await Category.find({
    danhMucCha: category._id,
    kichHoat: true,
  }).sort({ thuTu: 1 });

  // Get documents count
  const documentsCount = await Document.countDocuments({
    danhMuc: category._id,
  });

  const result = category.toObject();
  result.children = children;
  result.documentsCount = documentsCount;

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Update category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  // Check if user is authenticated and has admin role
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Yêu cầu xác thực",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể cập nhật danh mục",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await Category.findById(req.params.id).session(session);

    if (!category) {
      await session.abortTransaction();
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Check if new category code conflicts (only if maDanhMuc is being updated)
    if (req.body.maDanhMuc && req.body.maDanhMuc !== category.maDanhMuc) {
      const existingCategory = await Category.findOne({
        maDanhMuc: req.body.maDanhMuc,
        _id: { $ne: category._id },
      }).session(session);

      if (existingCategory) {
        await session.abortTransaction();
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Mã danh mục đã tồn tại",
        });
      }
    }

    // Validate parent category (only if danhMucCha is being updated)
    if (req.body.danhMucCha !== undefined) {
      if (req.body.danhMucCha === category._id.toString()) {
        await session.abortTransaction();
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Danh mục không thể là cha của chính nó",
        });
      }

      if (req.body.danhMucCha && req.body.danhMucCha !== null) {
        const parentCategory = await Category.findById(
          req.body.danhMucCha
        ).session(session);
        if (!parentCategory) {
          await session.abortTransaction();
          return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Không tìm thấy danh mục cha",
          });
        }
      }
    }

    // Store original values for comparison
    const originalValues = {
      tenDanhMuc: category.tenDanhMuc,
      maDanhMuc: category.maDanhMuc,
      moTa: category.moTa,
      danhMucCha: category.danhMucCha,
      thuTu: category.thuTu,
      kichHoat: category.kichHoat,
      searchKeywords: category.searchKeywords,
    };

    // Update only provided fields
    const updateFields = {};
    const allowedFields = [
      "tenDanhMuc",
      "maDanhMuc",
      "moTa",
      "danhMucCha",
      "thuTu",
      "kichHoat",
      "searchKeywords",
      "customFieldsConfig",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
        category[field] = req.body[field];
      }
    });

    // Check if any fields were actually updated
    if (Object.keys(updateFields).length === 0) {
      await session.abortTransaction();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Không có dữ liệu nào được cập nhật",
      });
    }

    const updatedCategory = await category.save({ session });
    await updatedCategory.populate("danhMucCha");

    // Log activity (with error handling)
    try {
      await UserActivity.create(
        [
          {
            nguoiDung: req.user._id,
            hanhDong: "cap_nhat_danh_muc",
            chiTiet: {
              categoryId: updatedCategory._id,
              categoryName: updatedCategory.tenDanhMuc?.vi || "Unknown",
              categoryCode: updatedCategory.maDanhMuc,
              updatedFields: Object.keys(updateFields),
              originalValues,
              newValues: updateFields,
            },
            diaChiIP: req.ip || "unknown",
            thietBi: req.headers["user-agent"] || "unknown",
          },
        ],
        { session }
      );
    } catch (activityError) {
      logger.warn("Failed to log activity:", activityError.message);
    }

    await session.commitTransaction();

    logger.info(
      `Category ${updatedCategory._id} được cập nhật bởi admin ${req.user._id}`
    );

    res.json({
      success: true,
      data: updatedCategory,
      message: "Cập nhật danh mục thành công",
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error updating category:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Lỗi khi cập nhật danh mục",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
});

/**
 * Delete category
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  // Check if user is authenticated and has admin role
  if (!req.user) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Yêu cầu xác thực",
    });
  }

  if (req.user.vaiTro !== "admin") {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "Chỉ admin mới có thể xóa danh mục",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await Category.findById(req.params.id).session(session);

    if (!category) {
      await session.abortTransaction();
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({
      danhMucCha: category._id,
    }).session(session);

    if (childrenCount > 0) {
      await session.abortTransaction();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Không thể xóa danh mục có danh mục con",
      });
    }

    // Check if category has documents
    const documentsCount = await Document.countDocuments({
      danhMuc: category._id,
    }).session(session);

    if (documentsCount > 0) {
      await session.abortTransaction();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Không thể xóa danh mục có tài liệu liên kết",
      });
    }

    // Check if category has files
    const fileCount = await File.countDocuments({
      danhMuc: category._id,
    }).session(session);

    if (fileCount > 0) {
      await session.abortTransaction();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Không thể xóa danh mục này vì đang có file đang sử dụng",
      });
    }

    // Store category info before deletion
    const categoryInfo = {
      id: category._id,
      name: category.tenDanhMuc.vi,
      code: category.maDanhMuc,
    };

    await category.deleteOne({ session });

    // Log activity (with error handling)
    try {
      await UserActivity.create(
        [
          {
            nguoiDung: req.user._id,
            hanhDong: "xoa_danh_muc",
            chiTiet: {
              categoryId: categoryInfo.id,
              categoryName: categoryInfo.name,
              categoryCode: categoryInfo.code,
            },
            diaChiIP: req.ip || "unknown",
            thietBi: req.headers["user-agent"] || "unknown",
          },
        ],
        { session }
      );
    } catch (activityError) {
      logger.warn("Failed to log activity:", activityError.message);
    }

    await session.commitTransaction();

    logger.info(`Category ${categoryInfo.id} deleted by admin ${req.user._id}`);

    res.json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error deleting category:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Lỗi khi xóa danh mục",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
});

/**
 * Get category statistics
 */
export const getCategoryStatistics = asyncHandler(async (req, res) => {
  const stats = await Category.aggregate([
    {
      $lookup: {
        from: "documents",
        localField: "_id",
        foreignField: "danhMuc",
        as: "documents",
      },
    },
    {
      $project: {
        tenDanhMuc: 1,
        maDanhMuc: 1,
        kichHoat: 1,
        documentsCount: { $size: "$documents" },
        activeDocuments: {
          $size: {
            $filter: {
              input: "$documents",
              cond: {
                $eq: [
                  "$$this.searchMetadata.filterTags.tinhTrang",
                  "cong_khai",
                ],
              },
            },
          },
        },
      },
    },
    {
      $sort: { documentsCount: -1 },
    },
  ]);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get category stats
 */
export const getCategoryStats = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy danh mục",
    });
  }

  const stats = await File.aggregate([
    { $match: { danhMuc: category._id } },
    {
      $group: {
        _id: null,
        tongFile: { $sum: 1 },
        tongLuotTai: { $sum: "$luotTai" },
        tongDoanhThu: { $sum: "$gia" },
        diemTrungBinh: { $avg: "$diemDanhGia" },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      category,
      stats: stats[0] || {
        tongFile: 0,
        tongLuotTai: 0,
        tongDoanhThu: 0,
        diemTrungBinh: 0,
      },
    },
  });
});

/**
 * Get category custom fields configuration
 */
export const getCategoryCustomFields = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Không tìm thấy danh mục",
    });
  }

  res.json({
    success: true,
    data: {
      categoryId: category._id,
      categoryName: category.tenDanhMuc,
      customFieldsConfig: category.customFieldsConfig || {
        required: [],
        optional: [],
        fieldTypes: {},
      },
    },
  });
});
