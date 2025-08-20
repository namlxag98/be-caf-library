import crypto from "crypto";
import path from "path";

/**
 * Generate unique filename
 */
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString("hex");
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  return `${baseName}_${timestamp}_${randomString}${extension}`;
};

/**
 * Sanitize filename for safe storage
 */
export const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
};

/**
 * Convert bytes to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Validate file type
 */
export const isValidFileType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

/**
 * Generate search text for indexing
 */
export const generateSearchText = (document) => {
  const searchTerms = [];

  // Add titles
  if (document.thongTinDaNgonNgu?.tieuDe) {
    if (document.thongTinDaNgonNgu.tieuDe.vi) {
      searchTerms.push(document.thongTinDaNgonNgu.tieuDe.vi);
    }
    if (document.thongTinDaNgonNgu.tieuDe.en) {
      searchTerms.push(document.thongTinDaNgonNgu.tieuDe.en);
    }
  }

  // Add descriptions
  if (document.thongTinDaNgonNgu?.moTa) {
    if (document.thongTinDaNgonNgu.moTa.vi) {
      searchTerms.push(document.thongTinDaNgonNgu.moTa.vi);
    }
    if (document.thongTinDaNgonNgu.moTa.en) {
      searchTerms.push(document.thongTinDaNgonNgu.moTa.en);
    }
  }

  // Add summaries
  if (document.thongTinDaNgonNgu?.tomTat) {
    if (document.thongTinDaNgonNgu.tomTat.vi) {
      searchTerms.push(document.thongTinDaNgonNgu.tomTat.vi);
    }
    if (document.thongTinDaNgonNgu.tomTat.en) {
      searchTerms.push(document.thongTinDaNgonNgu.tomTat.en);
    }
  }

  // Add keywords
  if (document.thongTinDaNgonNgu?.tuKhoa) {
    if (document.thongTinDaNgonNgu.tuKhoa.vi) {
      searchTerms.push(...document.thongTinDaNgonNgu.tuKhoa.vi);
    }
    if (document.thongTinDaNgonNgu.tuKhoa.en) {
      searchTerms.push(...document.thongTinDaNgonNgu.tuKhoa.en);
    }
  }

  // Add author names
  if (document.tacGia && Array.isArray(document.tacGia)) {
    document.tacGia.forEach((author) => {
      if (author.hoTen?.vi) {
        searchTerms.push(author.hoTen.vi);
      }
      if (author.hoTen?.en) {
        searchTerms.push(author.hoTen.en);
      }
    });
  }

  return searchTerms.join(" ").toLowerCase();
};

/**
 * Pagination helper
 */
export const paginate = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    skip,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};

/**
 * Sort helper
 */
export const buildSortQuery = (sortBy, sortOrder = "desc") => {
  const validSortFields = [
    "createdAt",
    "updatedAt",
    "thongKe.luotXem",
    "thongKe.luotTaiXuong",
    "thongTinDaNgonNgu.tieuDe.vi",
    "thongTinDaNgonNgu.tieuDe.en",
  ];

  if (!validSortFields.includes(sortBy)) {
    sortBy = "createdAt";
  }

  const order = sortOrder === "asc" ? 1 : -1;
  const sortQuery = {};
  sortQuery[sortBy] = order;

  return sortQuery;
};

/**
 * Build search query for MongoDB
 */
export const buildSearchQuery = (filters) => {
  const query = {};

  // Text search
  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  // Category filter
  if (filters.category) {
    query.danhMuc = filters.category;
  }

  // Author filter
  if (filters.author) {
    query.$or = [
      { "tacGia.hoTen.vi": { $regex: filters.author, $options: "i" } },
      { "tacGia.hoTen.en": { $regex: filters.author, $options: "i" } },
    ];
  }

  // Year range filter
  if (filters.yearFrom || filters.yearTo) {
    query["searchMetadata.filterTags.namXuatBan"] = {};
    if (filters.yearFrom) {
      query["searchMetadata.filterTags.namXuatBan"].$gte = parseInt(
        filters.yearFrom
      );
    }
    if (filters.yearTo) {
      query["searchMetadata.filterTags.namXuatBan"].$lte = parseInt(
        filters.yearTo
      );
    }
  }

  // Status filter
  if (filters.status) {
    query["searchMetadata.filterTags.tinhTrang"] = filters.status;
  }

  // Pricing filter
  if (filters.pricing === "mien_phi") {
    query["gia.mienPhi"] = true;
  } else if (filters.pricing === "tra_phi") {
    query["gia.mienPhi"] = false;
  }

  return query;
};

/**
 * Clean object of undefined values
 */
export const cleanObject = (obj) => {
  const cleaned = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        const nestedCleaned = cleanObject(obj[key]);
        if (Object.keys(nestedCleaned).length > 0) {
          cleaned[key] = nestedCleaned;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  });

  return cleaned;
};

/**
 * Generate slug from text
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[đĐ]/g, "d") // Replace Vietnamese d
    .replace(/[^a-z0-9 -]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};
