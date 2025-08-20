import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    taiLieu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    diemDanhGia: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    binhLuan: {
      type: String,
      maxlength: 500,
    },
    trangThai: {
      type: String,
      enum: ["hoat_dong", "an"],
      default: "hoat_dong",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one rating per user per document
ratingSchema.index({ taiLieu: 1, nguoiDung: 1 }, { unique: true });
ratingSchema.index({ taiLieu: 1, trangThai: 1 });

// Static method to calculate average rating
ratingSchema.statics.tinhDiemTrungBinh = async function (documentId) {
  const result = await this.aggregate([
    {
      $match: {
        taiLieu: documentId,
        trangThai: "hoat_dong",
      },
    },
    {
      $group: {
        _id: "$taiLieu",
        diemTrungBinh: { $avg: "$diemDanhGia" },
        soLuotDanhGia: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await mongoose.model("Document").findByIdAndUpdate(documentId, {
      "thongKe.danhGia.diemTrungBinh":
        Math.round(result[0].diemTrungBinh * 10) / 10,
      "thongKe.danhGia.soLuotDanhGia": result[0].soLuotDanhGia,
    });
  } else {
    await mongoose.model("Document").findByIdAndUpdate(documentId, {
      "thongKe.danhGia.diemTrungBinh": 0,
      "thongKe.danhGia.soLuotDanhGia": 0,
    });
  }
};

// Update average rating after save
ratingSchema.post("save", function () {
  this.constructor.tinhDiemTrungBinh(this.taiLieu);
});

// Update average rating after update
ratingSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.tinhDiemTrungBinh(doc.taiLieu);
  }
});

export default mongoose.model("Rating", ratingSchema);
