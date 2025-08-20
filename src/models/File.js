import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    tenFile: {
      type: String,
      required: true,
      trim: true,
    },
    moTa: {
      type: String,
      trim: true,
    },
    duongDan: {
      type: String,
      required: true,
    },
    kichThuoc: {
      type: Number,
      required: true,
    },
    loaiFile: {
      type: String,
      required: true,
    },
    nguoiUpload: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gia: {
      type: Number,
      required: true,
      min: 0,
    },
    daDuyet: {
      type: Boolean,
      default: false,
    },
    nguoiDuyet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    thoiGianDuyet: {
      type: Date,
    },
    luotTai: {
      type: Number,
      default: 0,
    },
    diemDanhGia: {
      type: Number,
      default: 0,
    },
    tongDanhGia: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
fileSchema.index({ nguoiUpload: 1, daDuyet: 1 });
fileSchema.index({ tenFile: "text", moTa: "text" });

const File = mongoose.model("File", fileSchema);

export default File;
