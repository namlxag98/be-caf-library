import httpStatus from "http-status";

// Simple validation middleware without Joi
export const validateCategory = (req, res, next) => {
  const { tenDanhMuc, maDanhMuc } = req.body;
  const isUpdate = req.method === "PUT";

  // Basic validation
  const errors = [];

  // For CREATE operations - all required fields must be present
  if (!isUpdate) {
    // Check required fields for CREATE
    if (!tenDanhMuc || typeof tenDanhMuc !== "object") {
      errors.push({
        field: "tenDanhMuc",
        message: "tenDanhMuc là bắt buộc và phải là một đối tượng",
      });
    } else {
      if (!tenDanhMuc.vi) {
        errors.push({
          field: "tenDanhMuc.vi",
          message: "Tên tiếng Việt là bắt buộc",
        });
      }
      if (!tenDanhMuc.en) {
        errors.push({
          field: "tenDanhMuc.en",
          message: "Tên tiếng Anh là bắt buộc",
        });
      }
    }

    if (!maDanhMuc) {
      errors.push({ field: "maDanhMuc", message: "Mã danh mục là bắt buộc" });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(maDanhMuc)) {
      errors.push({
        field: "maDanhMuc",
        message:
          "Mã danh mục chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới",
      });
    }
  } else {
    // For UPDATE operations - only validate provided fields
    if (tenDanhMuc) {
      if (typeof tenDanhMuc !== "object") {
        errors.push({
          field: "tenDanhMuc",
          message: "tenDanhMuc phải là một đối tượng",
        });
      } else {
        // If tenDanhMuc is provided, validate its structure
        if (tenDanhMuc.vi !== undefined && !tenDanhMuc.vi) {
          errors.push({
            field: "tenDanhMuc.vi",
            message: "Tên tiếng Việt không được để trống",
          });
        }
        if (tenDanhMuc.en !== undefined && !tenDanhMuc.en) {
          errors.push({
            field: "tenDanhMuc.en",
            message: "Tên tiếng Anh không được để trống",
          });
        }
      }
    }

    if (maDanhMuc !== undefined) {
      if (!maDanhMuc) {
        errors.push({
          field: "maDanhMuc",
          message: "Mã danh mục không được để trống",
        });
      } else if (!/^[a-zA-Z0-9_-]+$/.test(maDanhMuc)) {
        errors.push({
          field: "maDanhMuc",
          message:
            "Mã danh mục chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới",
        });
      }
    }
  }

  // Check optional fields structure
  if (req.body.moTa && typeof req.body.moTa !== "object") {
    errors.push({ field: "moTa", message: "moTa phải là một đối tượng" });
  }

  if (req.body.searchKeywords && typeof req.body.searchKeywords !== "object") {
    errors.push({
      field: "searchKeywords",
      message: "searchKeywords phải là một đối tượng",
    });
  }

  // Validate thuTu if provided
  if (req.body.thuTu !== undefined) {
    const thuTu = parseInt(req.body.thuTu);
    if (isNaN(thuTu) || thuTu < 0) {
      errors.push({
        field: "thuTu",
        message: "thuTu phải là số nguyên không âm",
      });
    } else {
      req.body.thuTu = thuTu;
    }
  }

  // Validate kichHoat if provided
  if (req.body.kichHoat !== undefined) {
    if (typeof req.body.kichHoat !== "boolean") {
      // Try to convert string to boolean
      if (req.body.kichHoat === "true") {
        req.body.kichHoat = true;
      } else if (req.body.kichHoat === "false") {
        req.body.kichHoat = false;
      } else {
        errors.push({
          field: "kichHoat",
          message: "kichHoat phải là boolean",
        });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  // Set defaults only for CREATE operations
  if (!isUpdate) {
    req.body.thuTu = req.body.thuTu || 0;
    req.body.kichHoat =
      req.body.kichHoat !== undefined ? req.body.kichHoat : true;
  }

  next();
};

export const validateDocument = (req, res, next) => {
  // Parse JSON strings from form-data if needed
  try {
    // Parse nested objects from form-data
    if (typeof req.body.thongTinDaNgonNgu === "string") {
      req.body.thongTinDaNgonNgu = JSON.parse(req.body.thongTinDaNgonNgu);
    }
    if (typeof req.body.tacGia === "string") {
      req.body.tacGia = JSON.parse(req.body.tacGia);
    }
    if (typeof req.body.searchMetadata === "string") {
      req.body.searchMetadata = JSON.parse(req.body.searchMetadata);
    }
    if (typeof req.body.gia === "string") {
      req.body.gia = JSON.parse(req.body.gia);
    }
    if (typeof req.body.customFields === "string") {
      req.body.customFields = JSON.parse(req.body.customFields);
    }
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Định dạng JSON không hợp lệ trong request body",
      error: error.message,
    });
  }

  const errors = [];

  // Validate required fields
  if (!req.body.thongTinDaNgonNgu) {
    errors.push({
      field: "thongTinDaNgonNgu",
      message: "Thông tin tài liệu là bắt buộc",
    });
  } else {
    if (!req.body.thongTinDaNgonNgu.tieuDe) {
      errors.push({
        field: "thongTinDaNgonNgu.tieuDe",
        message: "Tiêu đề là bắt buộc",
      });
    } else {
      if (!req.body.thongTinDaNgonNgu.tieuDe.vi) {
        errors.push({
          field: "thongTinDaNgonNgu.tieuDe.vi",
          message: "Tiêu đề tiếng Việt là bắt buộc",
        });
      }
      if (!req.body.thongTinDaNgonNgu.tieuDe.en) {
        errors.push({
          field: "thongTinDaNgonNgu.tieuDe.en",
          message: "Tiêu đề tiếng Anh là bắt buộc",
        });
      }
    }
  }

  if (
    !req.body.tacGia ||
    !Array.isArray(req.body.tacGia) ||
    req.body.tacGia.length === 0
  ) {
    errors.push({
      field: "tacGia",
      message: "Cần ít nhất một tác giả",
    });
  }

  if (!req.body.danhMuc) {
    errors.push({ field: "danhMuc", message: "Danh mục là bắt buộc" });
  }

  if (errors.length > 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  // Set defaults
  if (!req.body.searchMetadata) {
    req.body.searchMetadata = {
      filterTags: {
        tinhTrang: "cong_khai",
      },
    };
  }

  if (!req.body.gia) {
    req.body.gia = {
      mienPhi: true,
      giaXem: 0,
      giaTaiXuong: 0,
    };
  }

  // Custom fields validation will be handled in the controller
  // after fetching the category to get its custom fields configuration

  next();
};

// Query validation middleware
export const validateSearchQuery = (req, res, next) => {
  // Set defaults for query parameters
  req.query.page = parseInt(req.query.page) || 1;
  req.query.limit = Math.min(parseInt(req.query.limit) || 20, 100);
  req.query.sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  if (
    ![
      "createdAt",
      "updatedAt",
      "thongKe.luotXem",
      "thongKe.luotTaiXuong",
    ].includes(req.query.sortBy)
  ) {
    req.query.sortBy = "createdAt";
  }

  next();
};

// Auth validation
export const validateAuth = {
  register: (req, res, next) => {
    const { tenDangNhap, email, matKhau } = req.body;
    const errors = [];

    if (!tenDangNhap || tenDangNhap.trim().length < 2) {
      errors.push({
        field: "tenDangNhap",
        message: "Tên đăng nhập phải có ít nhất 2 ký tự",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        field: "email",
        message: "Email hợp lệ là bắt buộc",
      });
    }

    if (!matKhau || matKhau.length < 6) {
      errors.push({
        field: "matKhau",
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    if (errors.length > 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    next();
  },

  login: (req, res, next) => {
    const { tenDangNhap, matKhau } = req.body;
    const errors = [];

    if (!tenDangNhap) {
      errors.push({
        field: "tenDangNhap",
        message: "Tên đăng nhập là bắt buộc",
      });
    }

    if (!matKhau) {
      errors.push({
        field: "matKhau",
        message: "Mật khẩu là bắt buộc",
      });
    }

    if (errors.length > 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    next();
  },

  changePassword: (req, res, next) => {
    const { matKhauCu, matKhauMoi } = req.body;
    const errors = [];

    if (!matKhauCu) {
      errors.push({
        field: "matKhauCu",
        message: "Mật khẩu cũ là bắt buộc",
      });
    }

    if (!matKhauMoi || matKhauMoi.length < 6) {
      errors.push({
        field: "matKhauMoi",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    if (errors.length > 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    next();
  },
};

// User validation
export const validateUserUpdate = (req, res, next) => {
  const errors = [];
  const { email, tenDangNhap, soDienThoai, matKhau } = req.body;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({
      field: "email",
      message: "Định dạng email không hợp lệ",
    });
  }

  if (tenDangNhap && typeof tenDangNhap !== "string") {
    errors.push({
      field: "tenDangNhap",
      message: "Tên đăng nhập phải là chuỗi ký tự",
    });
  }

  if (soDienThoai && !/^[0-9]{10,11}$/.test(soDienThoai)) {
    errors.push({
      field: "soDienThoai",
      message: "Định dạng số điện thoại không hợp lệ",
    });
  }

  if (matKhau && matKhau.length < 6) {
    errors.push({
      field: "matKhau",
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  if (errors.length > 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};

export const validateUserCreation = (req, res, next) => {
  const { tenDangNhap, email, matKhau, hoTen, vaiTro } = req.body;
  const errors = [];

  if (!tenDangNhap || tenDangNhap.trim().length < 2) {
    errors.push({
      field: "tenDangNhap",
      message: "Tên đăng nhập phải có ít nhất 2 ký tự",
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({
      field: "email",
      message: "Email hợp lệ là bắt buộc",
    });
  }

  if (!matKhau || matKhau.length < 6) {
    errors.push({
      field: "matKhau",
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  if (!hoTen) {
    errors.push({
      field: "hoTen",
      message: "Họ tên là bắt buộc",
    });
  }

  if (vaiTro && !["admin", "teacher", "user"].includes(vaiTro)) {
    errors.push({
      field: "vaiTro",
      message: "Vai trò không hợp lệ",
    });
  }

  if (errors.length > 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};

export const validateBalanceUpdate = (req, res, next) => {
  const { soDu } = req.body;
  const errors = [];

  if (soDu === undefined || soDu === null) {
    errors.push({
      field: "soDu",
      message: "Số dư là bắt buộc",
    });
  } else if (typeof soDu !== "number" || isNaN(soDu)) {
    errors.push({
      field: "soDu",
      message: "Số dư phải là một số hợp lệ",
    });
  }

  if (errors.length > 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};
