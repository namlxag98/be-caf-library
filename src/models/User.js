import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    tenDangNhap: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    matKhau: {
      type: String,
      required: true,
    },
    hoTen: {
      type: String,
      trim: true,
      required: true,
    },
    soDienThoai: {
      type: String,
      trim: true,
    },
    diaChi: {
      type: String,
      trim: true,
    },
    anhDaiDien: {
      type: String,
      default: null,
    },
    vaiTro: {
      type: String,
      enum: ["admin", "teacher", "user"],
      default: "user",
    },
    trangThaiHoatDong: {
      type: Boolean,
      default: true,
    },
    soDuTaiKhoan: {
      type: Number,
      default: 0,
    },
    tokenLamMoi: {
      type: String,
    },
    ngayDangKy: {
      type: Date,
      default: Date.now,
    },
    lanDangNhapCuoi: {
      type: Date,
    },
    xacThucEmail: {
      type: Boolean,
      default: false,
    },
    maXacThuc: {
      type: String,
      default: null,
    },
    thoiGianHetHanMaXacThuc: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("matKhau")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.matKhau = await bcrypt.hash(this.matKhau, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.soSanhMatKhau = async function (matKhauNhap) {
  return bcrypt.compare(matKhauNhap, this.matKhau);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.matKhau;
  delete user.tokenLamMoi;
  delete user.maXacThuc;
  delete user.thoiGianHetHanMaXacThuc;
  return user;
};

// Indexes
userSchema.index({ vaiTro: 1, trangThaiHoatDong: 1 });

export default mongoose.model("User", userSchema);
