import asyncHandler from "express-async-handler";
import httpStatus from "http-status";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import ActivityLog from "../models/ActivityLog.js";
import { logger } from "../utils/logger.js";
import UserActivity from "../models/UserActivity.js";

/**
 * Create deposit transaction
 */
export const deposit = asyncHandler(async (req, res) => {
  const { soTien, phuongThucThanhToan, maGiaoDich } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.userId).session(session);
    const soDuTruoc = user.soDuTaiKhoan;
    const soDuSau = soDuTruoc + soTien;

    // Update user balance
    user.soDuTaiKhoan = soDuSau;
    await user.save({ session });

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          nguoiDung: req.userId,
          loaiGiaoDich: "nap_tien",
          soTien,
          soDuTruoc,
          soDuSau,
          noiDung: `Nạp tiền qua ${phuongThucThanhToan}`,
          chiTiet: {
            maGiaoDich,
            phuongThucThanhToan,
          },
          trangThai: "completed",
        },
      ],
      { session }
    );

    // Log activity
    await ActivityLog.create(
      [
        {
          nguoiDung: req.userId,
          loaiHanhDong: "nap_tien",
          chiTiet: {
            soTien,
            noiDung: `Deposited ${soTien} VND`,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        transaction: transaction[0],
        newBalance: soDuSau,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Download file with payment
 */
export const downloadWithPayment = asyncHandler(async (req, res) => {
  const { documentId, fileId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get document
    const document = await Document.findById(documentId).session(session);
    if (!document) {
      await session.abortTransaction();
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy tài liệu",
      });
    }

    // Get file
    const file = document.files.id(fileId);
    if (!file) {
      await session.abortTransaction();
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy file",
      });
    }

    // Check if free
    if (document.gia.mienPhi) {
      await session.abortTransaction();
      return res.json({
        success: true,
        data: {
          canDownload: true,
          message: "Tài liệu này được tải xuống miễn phí",
        },
      });
    }

    // Check if already purchased
    const existingTransaction = await Transaction.findOne({
      nguoiDung: req.userId,
      loaiGiaoDich: "tai_xuong",
      "chiTiet.taiLieu": documentId,
      trangThai: "completed",
    }).session(session);

    if (existingTransaction) {
      await session.abortTransaction();
      return res.json({
        success: true,
        data: {
          canDownload: true,
          message: "Bạn đã mua tài liệu này",
        },
      });
    }

    // Get user and check balance
    const user = await User.findById(req.userId).session(session);
    const giaTaiXuong = document.gia.giaTaiXuong;

    if (user.soDuTaiKhoan < giaTaiXuong) {
      await session.abortTransaction();
      return res.status(httpStatus.PAYMENT_REQUIRED).json({
        success: false,
        message: "Số dư không đủ",
        data: {
          required: giaTaiXuong,
          current: user.soDuTaiKhoan,
          deficit: giaTaiXuong - user.soDuTaiKhoan,
        },
      });
    }

    // Process payment
    const soDuTruoc = user.soDuTaiKhoan;
    const soDuSau = soDuTruoc - giaTaiXuong;

    user.soDuTaiKhoan = soDuSau;
    await user.save({ session });

    // Create transaction
    const transaction = await Transaction.create(
      [
        {
          nguoiDung: req.userId,
          loaiGiaoDich: "tai_xuong",
          soTien: -giaTaiXuong,
          soDuTruoc,
          soDuSau,
          noiDung: `Tải xuống tài liệu: ${document.thongTinDaNgonNgu.tieuDe.vi}`,
          chiTiet: {
            taiLieu: documentId,
            file: fileId,
          },
          trangThai: "completed",
        },
      ],
      { session }
    );

    // Update document statistics
    document.thongKe.luotTaiXuong += 1;
    await document.save({ session });

    // Log activity
    await ActivityLog.create(
      [
        {
          nguoiDung: req.userId,
          loaiHanhDong: "tai_xuong",
          chiTiet: {
            taiLieu: documentId,
            file: fileId,
            soTien: giaTaiXuong,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        canDownload: true,
        transaction: transaction[0],
        newBalance: soDuSau,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Get transaction history
 */
export const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, loaiGiaoDich, startDate, endDate } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = { nguoiDung: req.userId };

  if (loaiGiaoDich) {
    query.loaiGiaoDich = loaiGiaoDich;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("chiTiet.taiLieu", "thongTinDaNgonNgu.tieuDe")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
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
 * Get transaction statistics
 */
export const getTransactionStats = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;

  let dateFilter;
  const now = new Date();

  switch (period) {
    case "week":
      dateFilter = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      dateFilter = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      dateFilter = new Date(0); // All time
  }

  const stats = await Transaction.aggregate([
    {
      $match: {
        nguoiDung: mongoose.Types.ObjectId(req.userId),
        createdAt: { $gte: dateFilter },
      },
    },
    {
      $group: {
        _id: "$loaiGiaoDich",
        total: { $sum: "$soTien" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Format stats
  const formattedStats = {
    nap_tien: { total: 0, count: 0 },
    tai_xuong: { total: 0, count: 0 },
    hoan_tien: { total: 0, count: 0 },
    thuong: { total: 0, count: 0 },
  };

  stats.forEach((stat) => {
    formattedStats[stat._id] = {
      total: stat.total,
      count: stat.count,
    };
  });

  res.json({
    success: true,
    data: formattedStats,
  });
});

/**
 * Admin: Process refund
 */
export const processRefund = asyncHandler(async (req, res) => {
  const { transactionId, lyDo } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get original transaction
    const originalTransaction = await Transaction.findById(
      transactionId
    ).session(session);

    if (
      !originalTransaction ||
      originalTransaction.loaiGiaoDich !== "tai_xuong"
    ) {
      await session.abortTransaction();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Giao dịch không hợp lệ để hoàn tiền",
      });
    }

    // Get user
    const user = await User.findById(originalTransaction.nguoiDung).session(
      session
    );
    const refundAmount = Math.abs(originalTransaction.soTien);
    const soDuTruoc = user.soDuTaiKhoan;
    const soDuSau = soDuTruoc + refundAmount;

    // Update balance
    user.soDuTaiKhoan = soDuSau;
    await user.save({ session });

    // Create refund transaction
    const refundTransaction = await Transaction.create(
      [
        {
          nguoiDung: user._id,
          loaiGiaoDich: "hoan_tien",
          soTien: refundAmount,
          soDuTruoc,
          soDuSau,
          noiDung: `Hoàn tiền: ${lyDo}`,
          chiTiet: {
            maGiaoDich: originalTransaction._id.toString(),
          },
          trangThai: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      data: refundTransaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Get all transactions (admin only)
 * @route GET /api/transactions
 * @access Private/Admin
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, type, status } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { noiDung: { $regex: search, $options: "i" } },
      { "nguoiDung.tenDangNhap": { $regex: search, $options: "i" } },
    ];
  }

  if (type) query.loaiGiaoDich = type;
  if (status) query.trangThai = status;

  const transactions = await Transaction.find(query)
    .populate("nguoiDung", "tenDangNhap email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

/**
 * Get transaction statistics (admin only)
 * @route GET /api/transactions/statistics
 * @access Private/Admin
 */
export const getTransactionStatsAdmin = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = {};

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const stats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Get transaction by ID (admin only)
 * @route GET /api/transactions/:id
 * @access Private/Admin
 */
export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "nguoiDung",
    "tenDangNhap email"
  );

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

/**
 * Create new transaction (admin only)
 * @route POST /api/transactions
 * @access Private/Admin
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const { userId, type, amount, description } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  const transaction = await Transaction.create({
    nguoiDung: userId,
    loaiGiaoDich: type,
    soTien: amount,
    noiDung: description,
    trangThai: "hoan_thanh",
  });

  // Update user balance
  if (type === "nap_tien") {
    user.soDuTaiKhoan += amount;
  } else if (type === "rut_tien") {
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
    hanhDong: "tao_giao_dich",
    chiTiet: { transactionId: transaction._id, userId, type, amount },
    diaChiIP: req.ip,
    thietBi: req.headers["user-agent"],
  });

  logger.info(
    `Transaction created by admin ${req.user._id} for user ${userId}`
  );

  res.status(201).json({
    success: true,
    data: transaction,
  });
});

/**
 * Update transaction (admin only)
 * @route PUT /api/transactions/:id
 * @access Private/Admin
 */
export const updateTransaction = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  transaction.status = status;
  await transaction.save();

  // Log activity
  await UserActivity.create({
    user: req.user._id,
    action: "update_transaction",
    details: { transactionId: transaction._id, status },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  logger.info(
    `Transaction ${transaction._id} updated by admin ${req.user._id}`
  );

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

/**
 * Delete transaction (admin only)
 * @route DELETE /api/transactions/:id
 * @access Private/Admin
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  await transaction.remove();

  // Log activity
  await UserActivity.create({
    user: req.user._id,
    action: "delete_transaction",
    details: { transactionId: transaction._id },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  logger.info(
    `Transaction ${transaction._id} deleted by admin ${req.user._id}`
  );

  res.status(200).json({
    success: true,
    message: "Xóa giao dịch thành công",
  });
});

/**
 * Get user's transactions
 * @route GET /api/transactions/my-transactions
 * @access Private
 */
export const getUserTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    loaiGiaoDich,
    trangThai,
    startDate,
    endDate,
  } = req.query;
  const query = { nguoiDung: req.userId };

  // Apply filters
  if (loaiGiaoDich) {
    query.loaiGiaoDich = loaiGiaoDich;
  }

  if (trangThai) {
    query.trangThai = trangThai;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("chiTiet.taiLieu", "thongTinDaNgonNgu.tieuDe")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

export const getTransactionStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filters = { startDate, endDate };

    const statistics = await getTransactionStatistics(filters);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
