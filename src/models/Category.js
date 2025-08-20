import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    tenDanhMuc: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
    },
    maDanhMuc: {
      type: String,
      required: true,
      unique: true, // This already creates an index
    },
    moTa: {
      vi: String,
      en: String,
    },
    danhMucCha: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    thuTu: {
      type: Number,
      default: 0,
    },
    kichHoat: {
      type: Boolean,
      default: true,
    },
    searchKeywords: {
      vi: [String],
      en: [String],
    },
    // Custom fields configuration for this category
    // fieldTypes example:
    // {
    //   fieldName1: { type: 'string' },
    //   fieldName2: { type: 'select', options: ['option1', 'option2', ...] },
    //   ...
    // }
    customFieldsConfig: {
      required: [String], // Array of required field names
      optional: [String], // Array of optional field names
      fieldTypes: {
        type: Object,
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

// Only add additional indexes that are not already created by unique constraints
categorySchema.index({ "tenDanhMuc.vi": 1, "tenDanhMuc.en": 1 });
categorySchema.index({ danhMucCha: 1, thuTu: 1 }); // Compound index for hierarchy queries

export default mongoose.model("Category", categorySchema);
