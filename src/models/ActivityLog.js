import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loaiHanhDong: {
      type: String,
      enum: [
        "dang_nhap",
        "dang_xuat",
        "xem_tai_lieu",
        "tai_xuong",
        "upload_tai_lieu",
        "binh_luan",
        "danh_gia",
        "nap_tien",
        "thay_doi_thong_tin",
      ],
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
      soTien: Number,
      noiDung: String,
      ipAddress: String,
      userAgent: String,
      thietBi: String,
    },
    thoiGian: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
activityLogSchema.index({ nguoiDung: 1, thoiGian: -1 });
activityLogSchema.index({ loaiHanhDong: 1 });
activityLogSchema.index({ "chiTiet.taiLieu": 1 });

// Auto-delete old logs after 90 days
activityLogSchema.index({ thoiGian: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model("ActivityLog", activityLogSchema);
