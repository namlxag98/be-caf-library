import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    // Multilingual information
    thongTinDaNgonNgu: {
      tieuDe: {
        vi: { type: String, required: true },
        en: { type: String, required: true },
      },
      tomTat: {
        vi: String,
        en: String,
      },
      tuKhoa: {
        vi: [String],
        en: [String],
      },
      ngonNguChinh: {
        type: String,
        enum: ["vi", "en"],
        default: "vi",
      },
    },

    // Authors with multilingual support
    tacGia: [
      {
        hoTen: {
          vi: { type: String, required: true },
          en: String,
        },
        email: String,
        donViCongTac: {
          vi: String,
          en: String,
        },
        vaiTro: {
          type: String,
          enum: ["tac_gia_chinh", "dong_tac_gia"],
          default: "dong_tac_gia",
        },
      },
    ],

    // Category reference
    danhMuc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Custom fields based on category
    customFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Files management
    files: [
      {
        tenFile: {
          vi: String,
          en: String,
        },
        tenFileGoc: String,
        loaiFile: String,
        googleDriveFileId: String,
        kichThuocFile: Number,
        ngayUpload: {
          type: Date,
          default: Date.now,
        },
        nguoiUpload: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Search metadata
    searchMetadata: {
      searchTextVi: String,
      searchTextEn: String,
      allKeywords: [String],
      filterTags: {
        namXuatBan: Number,
        capDo: {
          type: String,
          enum: ["co_ban", "trung_binh", "nang_cao"],
        },
        tinhTrang: {
          type: String,
          enum: ["cong_khai", "gioi_han", "rieng_tu"],
          default: "cong_khai",
        },
        coTinhPhi: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Pricing and access control
    gia: {
      mienPhi: {
        type: Boolean,
        default: true,
      },
      giaXem: {
        type: Number,
        default: 0,
      },
      giaTaiXuong: {
        type: Number,
        default: 0,
      },
    },

    // Statistics
    thongKe: {
      luotXem: {
        type: Number,
        default: 0,
      },
      luotTaiXuong: {
        type: Number,
        default: 0,
      },
      danhGia: {
        diemTrungBinh: {
          type: Number,
          default: 0,
        },
        soLuotDanhGia: {
          type: Number,
          default: 0,
        },
      },
    },

    // System info
    nguoiUpload: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trangThaiDuyet: {
      type: String,
      enum: ["cho_duyet", "da_duyet", "tu_choi"],
      default: "cho_duyet",
    },
    nguoiDuyet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ngayDuyet: {
      type: Date,
    },
    lyDoTuChoi: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create text indexes for search
documentSchema.index({
  "thongTinDaNgonNgu.tieuDe.vi": "text",
  "thongTinDaNgonNgu.tieuDe.en": "text",
  "thongTinDaNgonNgu.tomTat.vi": "text",
  "thongTinDaNgonNgu.tomTat.en": "text",
  "thongTinDaNgonNgu.tuKhoa.vi": "text",
  "thongTinDaNgonNgu.tuKhoa.en": "text",
  "searchMetadata.searchTextVi": "text",
  "searchMetadata.searchTextEn": "text",
  "searchMetadata.allKeywords": "text"
});

// Compound indexes
documentSchema.index({ trangThaiDuyet: 1 });
documentSchema.index({ "searchMetadata.filterTags.tinhTrang": 1 });
documentSchema.index({ danhMuc: 1, "searchMetadata.filterTags.namXuatBan": 1 });
documentSchema.index({ trangThaiDuyet: 1, danhMuc: 1 });
documentSchema.index({ trangThaiDuyet: 1, createdAt: -1 });
documentSchema.index({ trangThaiDuyet: 1, "thongKe.luotXem": -1 });

export default mongoose.model("Document", documentSchema);
