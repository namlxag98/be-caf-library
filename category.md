# Category API Collection

## Environment Variables

```json
{
  "base_url": "http://localhost:3000/api",
  "admin_token": "",
  "category_id": ""
}
```

---

## 1. Tạo danh mục (Create Category)

### Endpoint

```
POST {{base_url}}/categories
```

### Headers

```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

### Request Body

```json
{
  "tenDanhMuc": { "vi": "Bài báo khoa học", "en": "Scientific Article" },
  "maDanhMuc": "BAI_BAO_KHOA_HOC",
  "moTa": {
    "vi": "Danh mục các bài báo khoa học",
    "en": "Category for scientific articles"
  },
  "thuTu": 1,
  "kichHoat": true,
  "customFieldsConfig": {
    "required": ["tenBaiBao", "namCongBo"],
    "optional": ["link"],
    "fieldTypes": {
      "tenBaiBao": {
        "type": "string",
        "label": { "vi": "Tên bài báo", "en": "Article Title" },
        "description": {
          "vi": "Tên bài báo khoa học",
          "en": "Scientific article title"
        },
        "validation": {
          "required": true,
          "min": 5,
          "max": 255,
          "pattern": "^[A-Za-z0-9s]+$"
        }
      },
      "namCongBo": {
        "type": "number",
        "label": { "vi": "Năm công bố", "en": "Publication Year" },
        "description": {
          "vi": "Năm xuất bản của bài báo",
          "en": "Year the article was published"
        },
        "validation": { "required": true, "min": 1900, "max": 2100 }
      },
      "loaiBaiBao": {
        "type": "string",
        "label": { "vi": "Loại bài báo", "en": "Article Type" },
        "description": {
          "vi": "Phân loại bài báo",
          "en": "Article classification"
        },
        "validation": {
          "required": true,
          "enum": ["nghien_cuu", "tong_quan", "khac"]
        }
      },
      "isOpenAccess": {
        "type": "boolean",
        "label": { "vi": "Truy cập mở", "en": "Open Access" },
        "description": {
          "vi": "Bài báo có truy cập mở không?",
          "en": "Is the article open access?"
        },
        "validation": { "required": false }
      },
      "ngayNop": {
        "type": "date",
        "label": { "vi": "Ngày nộp", "en": "Submission Date" },
        "description": {
          "vi": "Ngày nộp bài báo",
          "en": "Date the article was submitted"
        },
        "validation": { "required": false }
      },
      "fileTomTat": {
        "type": "file",
        "label": { "vi": "File tóm tắt", "en": "Summary File" },
        "description": {
          "vi": "Tệp tóm tắt bài báo (PDF)",
          "en": "Summary file (PDF)"
        },
        "validation": { "required": true, "pattern": ".*\\.pdf$" }
      },
      "tuKhoa": {
        "type": "array",
        "label": { "vi": "Từ khóa", "en": "Keywords" },
        "description": { "vi": "Danh sách từ khóa", "en": "List of keywords" },
        "validation": { "required": false, "min": 1, "max": 10 }
      },
      "thongTinKhac": {
        "type": "object",
        "label": { "vi": "Thông tin khác", "en": "Other Info" },
        "description": {
          "vi": "Thông tin bổ sung",
          "en": "Additional information"
        },
        "validation": { "required": false }
      },
      "link": {
        "type": "string",
        "label": { "vi": "Link", "en": "Link" },
        "description": { "vi": "Đường dẫn tham khảo", "en": "Reference link" },
        "validation": { "required": false, "pattern": "^https?://" }
      }
    }
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "tenDanhMuc": { "vi": "Bài báo khoa học", "en": "Scientific Article" },
    "maDanhMuc": "BAI_BAO_KHOA_HOC",
    "moTa": {
      "vi": "Danh mục các bài báo khoa học",
      "en": "Category for scientific articles"
    },
    "thuTu": 1,
    "kichHoat": true,
    "customFieldsConfig": {
      "required": ["tenBaiBao", "namCongBo"],
      "optional": ["link"],
      "fieldTypes": {
        "tenBaiBao": {
          "type": "string",
          "label": { "vi": "Tên bài báo", "en": "Article Title" },
          "description": {
            "vi": "Tên bài báo khoa học",
            "en": "Scientific article title"
          },
          "validation": {
            "required": true,
            "min": 5,
            "max": 255,
            "pattern": "^[A-Za-z0-9s]+$"
          }
        },
        "namCongBo": {
          "type": "number",
          "label": { "vi": "Năm công bố", "en": "Publication Year" },
          "description": {
            "vi": "Năm xuất bản của bài báo",
            "en": "Year the article was published"
          },
          "validation": { "required": true, "min": 1900, "max": 2100 }
        },
        "loaiBaiBao": {
          "type": "string",
          "label": { "vi": "Loại bài báo", "en": "Article Type" },
          "description": {
            "vi": "Phân loại bài báo",
            "en": "Article classification"
          },
          "validation": {
            "required": true,
            "enum": ["nghien_cuu", "tong_quan", "khac"]
          }
        },
        "isOpenAccess": {
          "type": "boolean",
          "label": { "vi": "Truy cập mở", "en": "Open Access" },
          "description": {
            "vi": "Bài báo có truy cập mở không?",
            "en": "Is the article open access?"
          },
          "validation": { "required": false }
        },
        "ngayNop": {
          "type": "date",
          "label": { "vi": "Ngày nộp", "en": "Submission Date" },
          "description": {
            "vi": "Ngày nộp bài báo",
            "en": "Date the article was submitted"
          },
          "validation": { "required": false }
        },
        "fileTomTat": {
          "type": "file",
          "label": { "vi": "File tóm tắt", "en": "Summary File" },
          "description": {
            "vi": "Tệp tóm tắt bài báo (PDF)",
            "en": "Summary file (PDF)"
          },
          "validation": { "required": true, "pattern": ".*\\.pdf$" }
        },
        "tuKhoa": {
          "type": "array",
          "label": { "vi": "Từ khóa", "en": "Keywords" },
          "description": {
            "vi": "Danh sách từ khóa",
            "en": "List of keywords"
          },
          "validation": { "required": false, "min": 1, "max": 10 }
        },
        "thongTinKhac": {
          "type": "object",
          "label": { "vi": "Thông tin khác", "en": "Other Info" },
          "description": {
            "vi": "Thông tin bổ sung",
            "en": "Additional information"
          },
          "validation": { "required": false }
        },
        "link": {
          "type": "string",
          "label": { "vi": "Link", "en": "Link" },
          "description": {
            "vi": "Đường dẫn tham khảo",
            "en": "Reference link"
          },
          "validation": { "required": false, "pattern": "^https?://" }
        }
      }
    },
    "createdAt": "2024-04-27T10:30:00.000Z",
    "updatedAt": "2024-04-27T10:30:00.000Z"
  }
}
```

---

## 2. Cập nhật danh mục (Update Category)

### Endpoint

```
PUT {{base_url}}/categories/{{category_id}}
```

### Headers

```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

### Request Body (ví dụ cập nhật customFieldsConfig)

```json
{
  "tenDanhMuc": {
    "vi": "Bài báo khoa học cập nhật",
    "en": "Updated Scientific Article"
  },
  "customFieldsConfig": {
    "required": ["tenBaiBao", "namCongBo", "fileTomTat"],
    "optional": ["link"],
    "fieldTypes": {
      "tenBaiBao": {
        "type": "string",
        "label": { "vi": "Tên bài báo", "en": "Article Title" },
        "description": {
          "vi": "Tên bài báo khoa học",
          "en": "Scientific article title"
        },
        "validation": { "required": true }
      },
      "namCongBo": {
        "type": "number",
        "label": { "vi": "Năm công bố", "en": "Publication Year" },
        "description": {
          "vi": "Năm xuất bản của bài báo",
          "en": "Year the article was published"
        },
        "validation": { "required": true, "min": 1900, "max": 2100 }
      },
      "fileTomTat": {
        "type": "file",
        "label": { "vi": "File tóm tắt", "en": "Summary File" },
        "validation": { "required": true }
      },
      "link": {
        "type": "string",
        "label": { "vi": "Link", "en": "Link" },
        "description": { "vi": "Đường dẫn tham khảo", "en": "Reference link" },
        "validation": { "required": false, "pattern": "^https?://" }
      }
    }
  }
}
```

---

## 3. Lấy danh sách danh mục (Get All Categories)

### Endpoint

```
GET {{base_url}}/categories
```

### Query Params (tùy chọn)

- `language`: vi/en/both
- `active`: true/false/all
- `parent`: root/all/{ObjectId}
- `search`: từ khóa
- `includeChildren`: true/false

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
      "tenDanhMuc": { "vi": "Bài báo khoa học", "en": "Scientific Article" },
      "maDanhMuc": "BAI_BAO_KHOA_HOC",
      "moTa": {
        "vi": "Danh mục các bài báo khoa học",
        "en": "Category for scientific articles"
      },
      "thuTu": 1,
      "kichHoat": true,
      "customFieldsConfig": {
        "required": ["tenBaiBao", "namCongBo"],
        "optional": ["link"],
        "fieldTypes": {
          "tenBaiBao": {
            "type": "string",
            "label": { "vi": "Tên bài báo", "en": "Article Title" },
            "description": {
              "vi": "Tên bài báo khoa học",
              "en": "Scientific article title"
            },
            "validation": { "required": true }
          },
          "namCongBo": {
            "type": "number",
            "label": { "vi": "Năm công bố", "en": "Publication Year" },
            "description": {
              "vi": "Năm xuất bản của bài báo",
              "en": "Year the article was published"
            },
            "validation": { "required": true, "min": 1900, "max": 2100 }
          },
          "link": {
            "type": "string",
            "label": { "vi": "Link", "en": "Link" },
            "description": {
              "vi": "Đường dẫn tham khảo",
              "en": "Reference link"
            },
            "validation": { "required": false, "pattern": "^https?://" }
          }
        }
      },
      "createdAt": "2024-04-27T10:30:00.000Z",
      "updatedAt": "2024-04-27T10:30:00.000Z"
    }
  ]
}
```

---

## 4. Lấy chi tiết danh mục (Get Category by ID)

### Endpoint

```
GET {{base_url}}/categories/{{category_id}}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "tenDanhMuc": { "vi": "Bài báo khoa học", "en": "Scientific Article" },
    "maDanhMuc": "BAI_BAO_KHOA_HOC",
    "moTa": {
      "vi": "Danh mục các bài báo khoa học",
      "en": "Category for scientific articles"
    },
    "thuTu": 1,
    "kichHoat": true,
    "customFieldsConfig": {
      "required": ["tenBaiBao", "namCongBo"],
      "optional": ["link"],
      "fieldTypes": {
        "tenBaiBao": {
          "type": "string",
          "label": { "vi": "Tên bài báo", "en": "Article Title" },
          "description": {
            "vi": "Tên bài báo khoa học",
            "en": "Scientific article title"
          },
          "validation": { "required": true }
        },
        "namCongBo": {
          "type": "number",
          "label": { "vi": "Năm công bố", "en": "Publication Year" },
          "description": {
            "vi": "Năm xuất bản của bài báo",
            "en": "Year the article was published"
          },
          "validation": { "required": true, "min": 1900, "max": 2100 }
        },
        "link": {
          "type": "string",
          "label": { "vi": "Link", "en": "Link" },
          "description": {
            "vi": "Đường dẫn tham khảo",
            "en": "Reference link"
          },
          "validation": { "required": false, "pattern": "^https?://" }
        }
      }
    },
    "createdAt": "2024-04-27T10:30:00.000Z",
    "updatedAt": "2024-04-27T10:30:00.000Z"
  }
}
```

---

## 5. Lấy cấu hình custom fields (Get Category Custom Fields)

### Endpoint

```
GET {{base_url}}/categories/{{category_id}}/custom-fields
```

### Response

```json
{
  "success": true,
  "data": {
    "categoryId": "65f8a1b2c3d4e5f6a7b8c9d0",
    "categoryName": { "vi": "Bài báo khoa học", "en": "Scientific Article" },
    "customFieldsConfig": {
      "required": ["tenBaiBao", "namCongBo"],
      "optional": ["link"],
      "fieldTypes": {
        "tenBaiBao": {
          "type": "string",
          "label": { "vi": "Tên bài báo", "en": "Article Title" },
          "description": {
            "vi": "Tên bài báo khoa học",
            "en": "Scientific article title"
          },
          "validation": { "required": true }
        },
        "namCongBo": {
          "type": "number",
          "label": { "vi": "Năm công bố", "en": "Publication Year" },
          "description": {
            "vi": "Năm xuất bản của bài báo",
            "en": "Year the article was published"
          },
          "validation": { "required": true, "min": 1900, "max": 2100 }
        },
        "link": {
          "type": "string",
          "label": { "vi": "Link", "en": "Link" },
          "description": {
            "vi": "Đường dẫn tham khảo",
            "en": "Reference link"
          },
          "validation": { "required": false, "pattern": "^https?://" }
        }
      }
    }
  }
}
```

---

## 6. Xóa danh mục (Delete Category)

### Endpoint

```
DELETE {{base_url}}/categories/{{category_id}}
```

### Headers

```
Authorization: Bearer {{admin_token}}
```

### Response

```json
{
  "success": true,
  "message": "Xóa danh mục thành công"
}
```
