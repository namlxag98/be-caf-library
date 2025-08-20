# BMC CAF Library - API Category & Document Collection

## Environment Setup

### Environment Variables

```json
{
  "base_url": "http://localhost:3000/api",
  "auth_token": "",
  "admin_token": "",
  "document_id": "",
  "category_id": "",
  "user_id": ""
}
```

---

## 1. Category Management APIs

### 1.1 Get All Categories (Public)

```http
GET {{base_url}}/categories
```

**Query Parameters:**

- `language`: vi/en/both (default: both)
- `active`: true/false/all (default: true)
- `parent`: root/all/{ObjectId} (default: all)
- `search`: Search term
- `includeChildren`: true/false (default: false)

**Example Requests:**

```http
GET {{base_url}}/categories?language=vi&active=true
GET {{base_url}}/categories?parent=root&includeChildren=true
GET {{base_url}}/categories?search=công nghệ
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "tenDanhMuc": {
        "vi": "Công nghệ thông tin",
        "en": "Information Technology"
      },
      "maDanhMuc": "CNTT_001",
      "moTa": {
        "vi": "Danh mục các tài liệu về công nghệ thông tin",
        "en": "Category for information technology documents"
      },
      "danhMucCha": null,
      "thuTu": 1,
      "kichHoat": true,
      "searchKeywords": {
        "vi": ["công nghệ", "thông tin", "IT"],
        "en": ["technology", "information", "IT"]
      },
      "customFieldsConfig": {
        "required": ["tacGia", "namXuatBan", "tapChi"],
        "optional": ["soTrang", "doi", "issn"],
        "fieldTypes": {
          "tacGia": {
            "type": "string",
            "label": {
              "vi": "Tác giả",
              "en": "Author"
            },
            "validation": {
              "required": true
            }
          }
        }
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 1.2 Get Category Tree (Public)

```http
GET {{base_url}}/categories/tree?language=vi
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "tenDanhMuc": {
        "vi": "Công nghệ thông tin",
        "en": "Information Technology"
      },
      "maDanhMuc": "CNTT_001",
      "documentsCount": 25,
      "children": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "tenDanhMuc": {
            "vi": "Lập trình",
            "en": "Programming"
          },
          "maDanhMuc": "CNTT_001_01",
          "documentsCount": 10
        }
      ]
    }
  ]
}
```

---

### 1.3 Get Category by ID (Public)

```http
GET {{base_url}}/categories/{{category_id}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "tenDanhMuc": {
      "vi": "Công nghệ thông tin",
      "en": "Information Technology"
    },
    "maDanhMuc": "CNTT_001",
    "moTa": {
      "vi": "Danh mục các tài liệu về công nghệ thông tin",
      "en": "Category for information technology documents"
    },
    "danhMucCha": null,
    "thuTu": 1,
    "kichHoat": true,
    "searchKeywords": {
      "vi": ["công nghệ", "thông tin", "IT"],
      "en": ["technology", "information", "IT"]
    },
    "customFieldsConfig": {
      "required": ["tacGia", "namXuatBan", "tapChi"],
      "optional": ["soTrang", "doi", "issn"],
      "fieldTypes": {
        "tacGia": {
          "type": "string",
          "label": {
            "vi": "Tác giả",
            "en": "Author"
          },
          "validation": {
            "required": true
          }
        },
        "namXuatBan": {
          "type": "number",
          "label": {
            "vi": "Năm xuất bản",
            "en": "Publication Year"
          },
          "validation": {
            "required": true,
            "min": 1900,
            "max": 2030
          }
        },
        "tapChi": {
          "type": "string",
          "label": {
            "vi": "Tạp chí",
            "en": "Journal"
          },
          "validation": {
            "required": true
          }
        },
        "capDo": {
          "type": "string",
          "label": {
            "vi": "Cấp độ",
            "en": "Level"
          },
          "validation": {
            "required": false,
            "enum": ["co_ban", "trung_binh", "nang_cao"]
          }
        }
      }
    },
    "children": [],
    "documentsCount": 25,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 1.4 Get Category Custom Fields Configuration (Public)

```http
GET {{base_url}}/categories/{{category_id}}/custom-fields
```

**Response:**

```json
{
  "success": true,
  "data": {
    "categoryId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "categoryName": {
      "vi": "Bài báo khoa học",
      "en": "Scientific Article"
    },
    "customFieldsConfig": {
      "required": ["tacGia", "namXuatBan", "tapChi"],
      "optional": ["soTrang", "doi", "issn", "capDo"],
      "fieldTypes": {
        "tacGia": {
          "type": "string",
          "label": {
            "vi": "Tác giả",
            "en": "Author"
          },
          "description": {
            "vi": "Tên tác giả chính",
            "en": "Main author name"
          },
          "validation": {
            "required": true
          }
        },
        "namXuatBan": {
          "type": "number",
          "label": {
            "vi": "Năm xuất bản",
            "en": "Publication Year"
          },
          "validation": {
            "required": true,
            "min": 1900,
            "max": 2030
          }
        },
        "tapChi": {
          "type": "string",
          "label": {
            "vi": "Tạp chí",
            "en": "Journal"
          },
          "validation": {
            "required": true
          }
        },
        "capDo": {
          "type": "string",
          "label": {
            "vi": "Cấp độ",
            "en": "Level"
          },
          "validation": {
            "required": false,
            "enum": ["co_ban", "trung_binh", "nang_cao"]
          }
        }
      }
    }
  }
}
```

---

### 1.5 Create Category (Admin Only)

```http
POST {{base_url}}/categories
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "tenDanhMuc": {
    "vi": "Bài báo khoa học",
    "en": "Scientific Articles"
  },
  "maDanhMuc": "BAI_BAO_001",
  "moTa": {
    "vi": "Danh mục các bài báo khoa học",
    "en": "Category for scientific articles"
  },
  "danhMucCha": null,
  "thuTu": 1,
  "kichHoat": true,
  "searchKeywords": {
    "vi": ["bài báo", "khoa học", "nghiên cứu"],
    "en": ["article", "scientific", "research"]
  },
  "customFieldsConfig": {
    "required": ["tacGia", "namXuatBan", "tapChi"],
    "optional": ["soTrang", "doi", "issn", "capDo"],
    "fieldTypes": {
      "tacGia": {
        "type": "string",
        "label": {
          "vi": "Tác giả",
          "en": "Author"
        },
        "validation": {
          "required": true
        }
      },
      "namXuatBan": {
        "type": "number",
        "label": {
          "vi": "Năm xuất bản",
          "en": "Publication Year"
        },
        "validation": {
          "required": true,
          "min": 1900,
          "max": 2030
        }
      },
      "tapChi": {
        "type": "string",
        "label": {
          "vi": "Tạp chí",
          "en": "Journal"
        },
        "validation": {
          "required": true
        }
      },
      "capDo": {
        "type": "string",
        "label": {
          "vi": "Cấp độ",
          "en": "Level"
        },
        "validation": {
          "required": false,
          "enum": ["co_ban", "trung_binh", "nang_cao"]
        }
      }
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "tenDanhMuc": {
      "vi": "Bài báo khoa học",
      "en": "Scientific Articles"
    },
    "maDanhMuc": "BAI_BAO_001",
    "moTa": {
      "vi": "Danh mục các bài báo khoa học",
      "en": "Category for scientific articles"
    },
    "danhMucCha": null,
    "thuTu": 1,
    "kichHoat": true,
    "searchKeywords": {
      "vi": ["bài báo", "khoa học", "nghiên cứu"],
      "en": ["article", "scientific", "research"]
    },
    "customFieldsConfig": {
      "required": ["tacGia", "namXuatBan", "tapChi"],
      "optional": ["soTrang", "doi", "issn", "capDo"],
      "fieldTypes": {
        "tacGia": {
          "type": "string",
          "label": {
            "vi": "Tác giả",
            "en": "Author"
          },
          "validation": {
            "required": true
          }
        }
      }
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 1.6 Update Category (Admin Only)

```http
PUT {{base_url}}/categories/{{category_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "tenDanhMuc": {
    "vi": "Bài báo khoa học cập nhật",
    "en": "Updated Scientific Articles"
  },
  "customFieldsConfig": {
    "required": ["tacGia", "namXuatBan", "tapChi", "soTrang"],
    "optional": ["doi", "issn", "capDo"],
    "fieldTypes": {
      "tacGia": {
        "type": "string",
        "label": {
          "vi": "Tác giả",
          "en": "Author"
        },
        "validation": {
          "required": true
        }
      },
      "capDo": {
        "type": "string",
        "label": {
          "vi": "Cấp độ",
          "en": "Level"
        },
        "validation": {
          "required": false,
          "enum": ["co_ban", "trung_binh", "nang_cao", "chuyen_sau"]
        }
      }
    }
  }
}
```

---

### 1.7 Delete Category (Admin Only)

```http
DELETE {{base_url}}/categories/{{category_id}}
Authorization: Bearer {{admin_token}}
```

**Response:**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 1.8 Get Category Statistics (Public)

```http
GET {{base_url}}/categories/statistics
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "tenDanhMuc": {
        "vi": "Công nghệ thông tin",
        "en": "Information Technology"
      },
      "maDanhMuc": "CNTT_001",
      "kichHoat": true,
      "documentsCount": 25,
      "activeDocuments": 20
    }
  ]
}
```

---

## 2. Document Management APIs

### 2.1 Get All Documents (Public)

```http
GET {{base_url}}/documents
```

**Query Parameters:**

- `q`: Search query
- `language`: vi/en/both (default: both)
- `category`: Category ID
- `author`: Author name
- `yearFrom`: Start year
- `yearTo`: End year
- `status`: cong_khai/gioi_han/rieng_tu
- `pricing`: mien_phi/tra_phi
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: createdAt/updatedAt/luotXem/luotTaiXuong (default: createdAt)
- `sortOrder`: asc/desc (default: desc)

**Example Requests:**

```http
GET {{base_url}}/documents?q=javascript&category={{category_id}}&page=1&limit=10
GET {{base_url}}/documents?author=Nguyễn&yearFrom=2020&yearTo=2024
GET {{base_url}}/documents?pricing=mien_phi&sortBy=luotXem&sortOrder=desc
```

**Response:**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "thongTinDaNgonNgu": {
          "tieuDe": {
            "vi": "Tài liệu mẫu",
            "en": "Sample Document"
          },
          "tomTat": {
            "vi": "Tóm tắt tài liệu",
            "en": "Document summary"
          },
          "tuKhoa": {
            "vi": ["từ khóa 1", "từ khóa 2"],
            "en": ["keyword1", "keyword2"]
          },
          "ngonNguChinh": "vi"
        },
        "tacGia": [
          {
            "hoTen": {
              "vi": "Nguyễn Văn A",
              "en": "Nguyen Van A"
            },
            "email": "author@example.com",
            "donViCongTac": {
              "vi": "Đại học ABC",
              "en": "ABC University"
            },
            "vaiTro": "tac_gia_chinh"
          }
        ],
        "danhMuc": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "tenDanhMuc": {
            "vi": "Công nghệ thông tin",
            "en": "Information Technology"
          }
        },
        "customFields": {
          "tacGia": "Nguyễn Văn A",
          "namXuatBan": 2024,
          "tapChi": "Tạp chí Khoa học Công nghệ",
          "capDo": "trung_binh"
        },
        "files": [
          {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "tenFile": {
              "vi": "document.pdf",
              "en": "document.pdf"
            },
            "tenFileGoc": "document.pdf",
            "loaiFile": "application/pdf",
            "kichThuocFile": 1024000,
            "ngayUpload": "2024-01-15T10:30:00.000Z"
          }
        ],
        "gia": {
          "mienPhi": true,
          "giaXem": 0,
          "giaTaiXuong": 0
        },
        "thongKe": {
          "luotXem": 150,
          "luotTaiXuong": 25,
          "danhGia": {
            "diemTrungBinh": 4.5,
            "soLuotDanhGia": 10
          }
        },
        "trangThaiDuyet": "da_duyet",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2.2 Get Document by ID (Public)

```http
GET {{base_url}}/documents/{{document_id}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "thongTinDaNgonNgu": {
      "tieuDe": {
        "vi": "Tài liệu mẫu",
        "en": "Sample Document"
      },
      "tomTat": {
        "vi": "Tóm tắt tài liệu",
        "en": "Document summary"
      },
      "tuKhoa": {
        "vi": ["từ khóa 1", "từ khóa 2"],
        "en": ["keyword1", "keyword2"]
      },
      "ngonNguChinh": "vi"
    },
    "tacGia": [
      {
        "hoTen": {
          "vi": "Nguyễn Văn A",
          "en": "Nguyen Van A"
        },
        "email": "author@example.com",
        "donViCongTac": {
          "vi": "Đại học ABC",
          "en": "ABC University"
        },
        "vaiTro": "tac_gia_chinh"
      }
    ],
    "danhMuc": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "tenDanhMuc": {
        "vi": "Công nghệ thông tin",
        "en": "Information Technology"
      }
    },
    "customFields": {
      "tacGia": "Nguyễn Văn A",
      "namXuatBan": 2024,
      "tapChi": "Tạp chí Khoa học Công nghệ",
      "capDo": "trung_binh"
    },
    "files": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "tenFile": {
          "vi": "document.pdf",
          "en": "document.pdf"
        },
        "tenFileGoc": "document.pdf",
        "loaiFile": "application/pdf",
        "kichThuocFile": 1024000,
        "ngayUpload": "2024-01-15T10:30:00.000Z"
      }
    ],
    "gia": {
      "mienPhi": true,
      "giaXem": 0,
      "giaTaiXuong": 0
    },
    "thongKe": {
      "luotXem": 150,
      "luotTaiXuong": 25,
      "danhGia": {
        "diemTrungBinh": 4.5,
        "soLuotDanhGia": 10
      }
    },
    "trangThaiDuyet": "da_duyet",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2.3 Create Document (Protected)

```http
POST {{base_url}}/documents
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data

// Form Data:
thongTinDaNgonNgu: {
  "tieuDe": {
    "vi": "Tài liệu mẫu",
    "en": "Sample Document"
  },
  "tomTat": {
    "vi": "Tóm tắt tài liệu",
    "en": "Document summary"
  },
  "tuKhoa": {
    "vi": ["từ khóa 1", "từ khóa 2"],
    "en": ["keyword1", "keyword2"]
  },
  "ngonNguChinh": "vi"
}
tacGia: [
  {
    "hoTen": {
      "vi": "Nguyễn Văn A",
      "en": "Nguyen Van A"
    },
    "email": "author@example.com",
    "donViCongTac": {
      "vi": "Đại học ABC",
      "en": "ABC University"
    },
    "vaiTro": "tac_gia_chinh"
  }
]
danhMuc: "{{category_id}}"
customFields: {
  "tacGia": "Nguyễn Văn A",
  "namXuatBan": 2024,
  "tapChi": "Tạp chí Khoa học Công nghệ",
  "capDo": "trung_binh"
}
searchMetadata: {
  "filterTags": {
    "namXuatBan": 2024,
    "capDo": "trung_binh",
    "tinhTrang": "cong_khai",
    "coTinhPhi": false
  }
}
gia: {
  "mienPhi": true,
  "giaXem": 0,
  "giaTaiXuong": 0
}
files: [file1, file2, ...] // Up to 10 files
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "thongTinDaNgonNgu": {
      "tieuDe": {
        "vi": "Tài liệu mẫu",
        "en": "Sample Document"
      },
      "tomTat": {
        "vi": "Tóm tắt tài liệu",
        "en": "Document summary"
      },
      "tuKhoa": {
        "vi": ["từ khóa 1", "từ khóa 2"],
        "en": ["keyword1", "keyword2"]
      },
      "ngonNguChinh": "vi"
    },
    "tacGia": [
      {
        "hoTen": {
          "vi": "Nguyễn Văn A",
          "en": "Nguyen Van A"
        },
        "email": "author@example.com",
        "donViCongTac": {
          "vi": "Đại học ABC",
          "en": "ABC University"
        },
        "vaiTro": "tac_gia_chinh"
      }
    ],
    "danhMuc": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "tenDanhMuc": {
        "vi": "Công nghệ thông tin",
        "en": "Information Technology"
      }
    },
    "customFields": {
      "tacGia": "Nguyễn Văn A",
      "namXuatBan": 2024,
      "tapChi": "Tạp chí Khoa học Công nghệ",
      "capDo": "trung_binh"
    },
    "files": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "tenFile": {
          "vi": "document.pdf",
          "en": "document.pdf"
        },
        "tenFileGoc": "document.pdf",
        "loaiFile": "application/pdf",
        "kichThuocFile": 1024000,
        "ngayUpload": "2024-01-15T10:30:00.000Z"
      }
    ],
    "gia": {
      "mienPhi": true,
      "giaXem": 0,
      "giaTaiXuong": 0
    },
    "thongKe": {
      "luotXem": 0,
      "luotTaiXuong": 0,
      "danhGia": {
        "diemTrungBinh": 0,
        "soLuotDanhGia": 0
      }
    },
    "trangThaiDuyet": "cho_duyet",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2.4 Update Document (Protected)

```http
PUT {{base_url}}/documents/{{document_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "thongTinDaNgonNgu": {
    "tieuDe": {
      "vi": "Tài liệu đã cập nhật",
      "en": "Updated Document"
    },
    "tomTat": {
      "vi": "Tóm tắt đã cập nhật",
      "en": "Updated summary"
    }
  },
  "customFields": {
    "tacGia": "Nguyễn Văn A",
    "namXuatBan": 2024,
    "tapChi": "Tạp chí Khoa học Công nghệ",
    "capDo": "nang_cao"
  },
  "gia": {
    "mienPhi": false,
    "giaXem": 5,
    "giaTaiXuong": 10
  }
}
```

---

### 2.5 Delete Document (Protected)

```http
DELETE {{base_url}}/documents/{{document_id}}
Authorization: Bearer {{auth_token}}
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### 2.6 Download File (Public)

```http
GET {{base_url}}/documents/{{document_id}}/files/{{file_id}}/download
```

---

### 2.7 Purchase File (Protected)

```http
POST {{base_url}}/documents/{{document_id}}/files/{{file_id}}/purchase
Authorization: Bearer {{auth_token}}
```

---

### 2.8 Approve Document (Admin Only)

```http
PUT {{base_url}}/documents/{{document_id}}/approve
Authorization: Bearer {{admin_token}}
```

**Response:**

```json
{
  "success": true,
  "message": "Document approved successfully"
}
```

---

### 2.9 Reject Document (Admin Only)

```http
PUT {{base_url}}/documents/{{document_id}}/reject
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "reason": "Tài liệu không đạt tiêu chuẩn chất lượng"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Document rejected successfully"
}
```

---

### 2.10 Search Documents (Public)

```http
GET {{base_url}}/documents/search?q=javascript&page=1&limit=10
```

---

### 2.11 Get Documents by Category (Public)

```http
GET {{base_url}}/documents/category/{{category_id}}?page=1&limit=10
```

---

### 2.12 Get Documents by User (Public)

```http
GET {{base_url}}/documents/user/{{user_id}}?page=1&limit=10
```

---

### 2.13 Get Pending Documents (Admin Only)

```http
GET {{base_url}}/documents/pending?page=1&limit=10
Authorization: Bearer {{admin_token}}
```

---

### 2.14 Get Document Statistics (Admin Only)

```http
GET {{base_url}}/documents/stats
Authorization: Bearer {{admin_token}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "byStatus": [
      {
        "_id": "da_duyet",
        "count": 150,
        "totalViews": 5000,
        "totalDownloads": 800,
        "totalRevenue": 50000
      },
      {
        "_id": "cho_duyet",
        "count": 25,
        "totalViews": 0,
        "totalDownloads": 0,
        "totalRevenue": 0
      }
    ],
    "byCategory": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "categoryName": "Công nghệ thông tin",
        "count": 50,
        "totalViews": 2000,
        "totalDownloads": 300,
        "totalRevenue": 20000
      }
    ]
  }
}
```

---

### 2.15 Get Popular Documents (Public)

```http
GET {{base_url}}/documents/popular?limit=10&timeRange=week
```

**Query Parameters:**

- `limit`: Number of documents (default: 10)
- `timeRange`: day/week/month/year (default: week)

---

### 2.16 Get Latest Documents (Public)

```http
GET {{base_url}}/documents/latest?limit=10
```

---

## 3. Error Responses

### 3.1 Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "thongTinDaNgonNgu.tieuDe.vi",
      "message": "Tiêu đề tiếng Việt là bắt buộc"
    },
    {
      "field": "customFields.tacGia",
      "message": "Tác giả là bắt buộc cho loại tài liệu này"
    }
  ]
}
```

### 3.2 Missing Custom Fields (400 Bad Request)

```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc cho danh mục này",
  "requiredFields": ["tacGia", "namXuatBan", "tapChi"]
}
```

### 3.3 Category Not Found (400 Bad Request)

```json
{
  "success": false,
  "message": "Category not found"
}
```

### 3.4 Unauthorized (401 Unauthorized)

```json
{
  "success": false,
  "message": "Yêu cầu xác thực"
}
```

### 3.5 Forbidden (403 Forbidden)

```json
{
  "success": false,
  "message": "Chỉ admin mới có thể thực hiện hành động này"
}
```

### 3.6 Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Không tìm thấy tài liệu"
}
```

### 3.7 File Upload Failed (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to upload file: document.pdf"
}
```

---

## 4. Test Flow

### 4.1 Setup Environment

1. Create environment variables in Postman
2. Set `base_url` to your API endpoint
3. Login to get `auth_token` and `admin_token`

### 4.2 Test Category APIs

1. Create a category with custom fields configuration
2. Get category details and custom fields config
3. Update category
4. Test category tree and statistics

### 4.3 Test Document APIs

1. Create a document with custom fields
2. Get document details
3. Update document
4. Test search and filtering
5. Test file upload and download
6. Test admin functions (approve/reject)

### 4.4 Test Error Cases

1. Try creating document without required custom fields
2. Try accessing admin endpoints without admin token
3. Test validation errors

---

## 5. Notes

- **Custom Fields**: Mỗi category có thể có cấu hình custom fields riêng
- **Validation**: Custom fields validation thay đổi theo category được chọn
- **File Upload**: Hỗ trợ tối đa 10 files, upload lên Google Drive
- **Multilingual**: Hỗ trợ tiếng Việt và tiếng Anh
- **Pagination**: Tất cả list APIs đều hỗ trợ phân trang
- **Authentication**: Admin endpoints yêu cầu admin token
- **File Types**: Hỗ trợ nhiều loại file (PDF, DOC, DOCX, etc.)

## Ví dụ: Tạo Category "Bài báo khoa học" với nhiều custom fields

### Endpoint

```
POST /api/categories
```

### Headers

```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

### Request Body

```json
{
  "tenDanhMuc": {
    "vi": "Bài báo khoa học",
    "en": "Scientific Article"
  },
  "maDanhMuc": "BAI_BAO_KHOA_HOC",
  "moTa": {
    "vi": "Danh mục các bài báo khoa học",
    "en": "Category for scientific articles"
  },
  "thuTu": 1,
  "kichHoat": true,
  "customFieldsConfig": {
    "required": [
      "tenBaiBao",
      "namCongBo",
      "quocTeTrongNuoc",
      "tapChiThuoc",
      "phanLoaiQ",
      "nguonKinhPhi",
      "tenDeTai",
      "maSo",
      "fileTomTat"
    ],
    "optional": ["link"],
    "fieldTypes": {
      "tenBaiBao": {
        "type": "string",
        "label": { "vi": "Tên bài báo", "en": "Article Title" },
        "validation": { "required": true }
      },
      "namCongBo": {
        "type": "number",
        "label": { "vi": "Năm công bố", "en": "Publication Year" },
        "validation": { "required": true, "min": 1900, "max": 2100 }
      },
      "quocTeTrongNuoc": {
        "type": "string",
        "label": { "vi": "Quốc tế/trong nước", "en": "International/Domestic" },
        "validation": { "required": true, "enum": ["quoc_te", "trong_nuoc"] }
      },
      "tapChiThuoc": {
        "type": "string",
        "label": { "vi": "Tạp chí thuộc", "en": "Journal Type" },
        "validation": {
          "required": true,
          "enum": ["wos", "scopus", "hoi_dong_gs_nha_nuoc", "khong_danh_muc"]
        }
      },
      "phanLoaiQ": {
        "type": "string",
        "label": { "vi": "Q", "en": "Q Classification" },
        "validation": {
          "required": true,
          "enum": ["Q1", "Q2", "Q3", "Q4", "khong"]
        }
      },
      "nguonKinhPhi": {
        "type": "string",
        "label": { "vi": "Nguồn kinh phí", "en": "Funding Source" },
        "validation": {
          "required": true,
          "enum": [
            "cap_bo",
            "cap_tinh",
            "cap_huyen_quan",
            "cap_truong",
            "hop_tac_doanh_nghiep",
            "hop_tac_quoc_te"
          ]
        }
      },
      "tenDeTai": {
        "type": "string",
        "label": { "vi": "Tên đề tài", "en": "Project Title" },
        "validation": { "required": true }
      },
      "maSo": {
        "type": "string",
        "label": { "vi": "Mã số", "en": "Code" },
        "validation": { "required": true }
      },
      "fileTomTat": {
        "type": "file",
        "label": { "vi": "Upload file tóm tắt", "en": "Upload summary file" },
        "validation": { "required": true }
      },
      "link": {
        "type": "string",
        "label": { "vi": "Link", "en": "Link" },
        "validation": { "required": false }
      }
    }
  }
}
```

### Response Body (Success)

```json
{
  "success": true,
  "data": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "tenDanhMuc": {
      "vi": "Bài báo khoa học",
      "en": "Scientific Article"
    },
    "maDanhMuc": "BAI_BAO_KHOA_HOC",
    "moTa": {
      "vi": "Danh mục các bài báo khoa học",
      "en": "Category for scientific articles"
    },
    "thuTu": 1,
    "kichHoat": true,
    "customFieldsConfig": {
      "required": [
        "tenBaiBao",
        "namCongBo",
        "quocTeTrongNuoc",
        "tapChiThuoc",
        "phanLoaiQ",
        "nguonKinhPhi",
        "tenDeTai",
        "maSo",
        "fileTomTat"
      ],
      "optional": ["link"],
      "fieldTypes": {
        "tenBaiBao": {
          "type": "string",
          "label": { "vi": "Tên bài báo", "en": "Article Title" },
          "validation": { "required": true }
        },
        "namCongBo": {
          "type": "number",
          "label": { "vi": "Năm công bố", "en": "Publication Year" },
          "validation": { "required": true, "min": 1900, "max": 2100 }
        },
        "quocTeTrongNuoc": {
          "type": "string",
          "label": {
            "vi": "Quốc tế/trong nước",
            "en": "International/Domestic"
          },
          "validation": { "required": true, "enum": ["quoc_te", "trong_nuoc"] }
        },
        "tapChiThuoc": {
          "type": "string",
          "label": { "vi": "Tạp chí thuộc", "en": "Journal Type" },
          "validation": {
            "required": true,
            "enum": ["wos", "scopus", "hoi_dong_gs_nha_nuoc", "khong_danh_muc"]
          }
        },
        "phanLoaiQ": {
          "type": "string",
          "label": { "vi": "Q", "en": "Q Classification" },
          "validation": {
            "required": true,
            "enum": ["Q1", "Q2", "Q3", "Q4", "khong"]
          }
        },
        "nguonKinhPhi": {
          "type": "string",
          "label": { "vi": "Nguồn kinh phí", "en": "Funding Source" },
          "validation": {
            "required": true,
            "enum": [
              "cap_bo",
              "cap_tinh",
              "cap_huyen_quan",
              "cap_truong",
              "hop_tac_doanh_nghiep",
              "hop_tac_quoc_te"
            ]
          }
        },
        "tenDeTai": {
          "type": "string",
          "label": { "vi": "Tên đề tài", "en": "Project Title" },
          "validation": { "required": true }
        },
        "maSo": {
          "type": "string",
          "label": { "vi": "Mã số", "en": "Code" },
          "validation": { "required": true }
        },
        "fileTomTat": {
          "type": "file",
          "label": { "vi": "Upload file tóm tắt", "en": "Upload summary file" },
          "validation": { "required": true }
        },
        "link": {
          "type": "string",
          "label": { "vi": "Link", "en": "Link" },
          "validation": { "required": false }
        }
      }
    },
    "createdAt": "2024-04-27T10:30:00.000Z",
    "updatedAt": "2024-04-27T10:30:00.000Z"
  }
}
```
