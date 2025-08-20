import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
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
    noiDung: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    binhLuanCha: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    trangThai: {
      type: String,
      enum: ["hoat_dong", "an", "da_xoa"],
      default: "hoat_dong",
    },
    luotThich: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    daChinhSua: {
      type: Boolean,
      default: false,
    },
    ngayChinhSua: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for reply count
commentSchema.virtual("soLuotPhanHoi", {
  ref: "Comment",
  localField: "_id",
  foreignField: "binhLuanCha",
  count: true,
});

// Indexes
commentSchema.index({ taiLieu: 1, trangThai: 1, createdAt: -1 });
commentSchema.index({ nguoiDung: 1 });
commentSchema.index({ binhLuanCha: 1 });

// Populate user info when querying
commentSchema.pre(/^find/, function () {
  this.populate({
    path: "nguoiDung",
    select: "hoTen anhDaiDien vaiTro",
  });
});

export default mongoose.model("Comment", commentSchema);
