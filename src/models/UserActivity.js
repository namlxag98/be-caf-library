import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hanhDong: {
      type: String,
      required: true,
      enum: [
        "dang_nhap",
        "dang_xuat",
        "tai_len",
        "tai_xuong",
        "binh_luan",
        "danh_gia",
        "mua_hang",
        "cap_nhat_thong_tin",
        // Thêm các enum values cần thiết cho category operations
        "tao_danh_muc",
        "cap_nhat_danh_muc",
        "xoa_danh_muc",
        // Thêm các enum values cho document operations
        "upload_tai_lieu",
        "cap_nhat_tai_lieu",
        "duyet_tai_lieu",
        "tu_choi_tai_lieu",
        "xem_tai_lieu",
        "xoa_tai_lieu",
        "nap_tien",
        "thay_doi_thong_tin",
        // Thêm các enum values khác
        "cap_nhat_file",
        "xoa_file",
        "duyet_file",
        "cap_nhat_binh_luan",
        "xoa_binh_luan",
        "cap_nhat_danh_gia",
        "xoa_danh_gia",
        "cap_nhat_nguoi_dung",
        "xoa_nguoi_dung",
        "tao_nguoi_dung",
      ],
    },
    chiTiet: {
      type: mongoose.Schema.Types.Mixed,
    },
    diaChiIP: {
      type: String,
    },
    thietBi: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userActivitySchema.index({ nguoiDung: 1, createdAt: -1 });
userActivitySchema.index({ hanhDong: 1, createdAt: -1 });

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;
