import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loaiGiaoDich: {
      type: String,
      enum: ["nap_tien", "tai_xuong", "hoan_tien", "thuong"],
      required: true,
    },
    soTien: {
      type: Number,
      required: true,
    },
    soDuTruoc: {
      type: Number,
      required: true,
    },
    soDuSau: {
      type: Number,
      required: true,
    },
    noiDung: {
      type: String,
      required: true,
    },
    chiTiet: {
      taiLieu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
      },
      maGiaoDich: String,
      phuongThucThanhToan: String,
    },
    trangThai: {
      type: String,
      enum: ["dang_xu_ly", "hoan_thanh", "that_bai", "da_huy"],
      default: "hoan_thanh",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ nguoiDung: 1, createdAt: -1 });
transactionSchema.index({ loaiGiaoDich: 1, trangThai: 1 });
transactionSchema.index({ "chiTiet.maGiaoDich": 1 });

export default mongoose.model("Transaction", transactionSchema);
