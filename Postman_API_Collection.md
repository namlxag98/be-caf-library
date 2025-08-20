# BMC CAF Library - API Collection

## Environment Setup

### 1. Environment Variables

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

## 1. Authentication APIs

### 1.1 Register (Public)

```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "tenDangNhap": "testuser",
  "email": "test@example.com",
  "matKhau": "password123",
  "hoTen": {
    "vi": "Nguyễn Văn Test",
    "en": "Nguyen Van Test"
  },
  "soDienThoai": "0123456789",
  "diaChi": "Hà Nội, Việt Nam"
}
```

### 1.2 Login (Public)

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "tenDangNhap": "testuser",
  "matKhau": "password123"
}
```

### 1.3 Refresh Token (Protected)

```http
POST {{base_url}}/auth/refresh-token
Authorization: Bearer {{auth_token}}
```

### 1.4 Change Password (Protected)

```http
PUT {{base_url}}/auth/change-password
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "matKhauCu": "password123",
  "matKhauMoi": "newpassword123"
}
```

### 1.5 Forgot Password (Public)

```http
POST {{base_url}}/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 1.6 Reset Password (Public)

```http
POST {{base_url}}/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "matKhauMoi": "newpassword123"
}
```

### 1.7 Logout (Protected)

```http
POST {{base_url}}/auth/logout
Authorization: Bearer {{auth_token}}
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

### 2.2 Get Document by ID (Public)

```http
GET {{base_url}}/documents/{{document_id}}
```

### 2.3 Create Document (Protected)

```http
POST {{base_url}}/documents
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data

// Form Data:
thongTinDaNgonNgu[tieuDe][vi]: "Tài liệu mẫu"
thongTinDaNgonNgu[tieuDe][en]: "Sample Document"
thongTinDaNgonNgu[tomTat][vi]: "Tóm tắt tài liệu"
thongTinDaNgonNgu[tomTat][en]: "Document summary"
thongTinDaNgonNgu[tuKhoa][vi]: "từ khóa 1,từ khóa 2"
thongTinDaNgonNgu[tuKhoa][en]: "keyword1,keyword2"
thongTinDaNgonNgu[ngonNguChinh]: "vi"
tacGia[0][hoTen][vi]: "Nguyễn Văn A"
tacGia[0][hoTen][en]: "Nguyen Van A"
tacGia[0][email]: "author@example.com"
tacGia[0][donViCongTac][vi]: "Đại học ABC"
tacGia[0][donViCongTac][en]: "ABC University"
tacGia[0][vaiTro]: "tac_gia_chinh"
danhMuc: "{{category_id}}"
customFields[tacGia]: "Nguyễn Văn A"
customFields[namXuatBan]: 2024
customFields[tapChi]: "Tạp chí Khoa học Công nghệ"
customFields[soTrang]: 15
customFields[doi]: "10.1234/abc.2024.001"
searchMetadata[filterTags][namXuatBan]: 2024
searchMetadata[filterTags][capDo]: "trung_binh"
searchMetadata[filterTags][tinhTrang]: "cong_khai"
searchMetadata[filterTags][coTinhPhi]: false
gia[mienPhi]: true
gia[giaXem]: 0
gia[giaTaiXuong]: 0
files: [file1, file2, ...] // Up to 10 files
```

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
    "tapChi": "Tạp chí Khoa học Công nghệ"
  },
  "gia": {
    "mienPhi": false,
    "giaXem": 5,
    "giaTaiXuong": 10
  }
}
```

### 2.5 Delete Document (Protected)

```http
DELETE {{base_url}}/documents/{{document_id}}
Authorization: Bearer {{auth_token}}
```

### 2.6 Download File (Public)

```http
GET {{base_url}}/documents/{{document_id}}/files/{{file_id}}/download
```

### 2.7 Purchase File (Protected)

```http
POST {{base_url}}/documents/{{document_id}}/files/{{file_id}}/purchase
Authorization: Bearer {{auth_token}}
```

### 2.8 Approve Document (Admin Only)

```http
PUT {{base_url}}/documents/{{document_id}}/approve
Authorization: Bearer {{admin_token}}
```

### 2.9 Reject Document (Admin Only)

```http
PUT {{base_url}}/documents/{{document_id}}/reject
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "reason": "Tài liệu không đạt tiêu chuẩn chất lượng"
}
```

### 2.10 Search Documents (Public)

```http
GET {{base_url}}/documents/search?q=javascript&page=1&limit=10
```

### 2.11 Get Documents by Category (Public)

```http
GET {{base_url}}/documents/category/{{category_id}}?page=1&limit=10
```

### 2.12 Get Documents by User (Public)

```http
GET {{base_url}}/documents/user/{{user_id}}?page=1&limit=10
```

### 2.13 Get Pending Documents (Admin Only)

```http
GET {{base_url}}/documents/pending?page=1&limit=10
Authorization: Bearer {{admin_token}}
```

### 2.14 Get Document Statistics (Admin Only)

```http
GET {{base_url}}/documents/stats
Authorization: Bearer {{admin_token}}
```

### 2.15 Get Popular Documents (Public)

```http
GET {{base_url}}/documents/popular?limit=10&timeRange=week
```

### 2.16 Get Latest Documents (Public)

```http
GET {{base_url}}/documents/latest?limit=10
```

---

## 3. Comment System APIs

### 3.1 Get Comments for Document

```http
GET {{base_url}}/documents/{{document_id}}/comments
```

### 3.2 Get Comment Replies

```http
GET {{base_url}}/documents/{{document_id}}/comments/{{comment_id}}/replies
```

### 3.3 Create Comment (Protected)

```http
POST {{base_url}}/documents/{{document_id}}/comments
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "noiDung": "Đây là một tài liệu rất hay!",
  "binhLuanCha": null // hoặc comment_id cho replies
}
```

### 3.4 Update Comment (Protected)

```http
PUT {{base_url}}/documents/{{document_id}}/comments/{{comment_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "noiDung": "Nội dung bình luận đã cập nhật"
}
```

### 3.5 Delete Comment (Protected)

```http
DELETE {{base_url}}/documents/{{document_id}}/comments/{{comment_id}}
Authorization: Bearer {{auth_token}}
```

### 3.6 Like/Unlike Comment (Protected)

```http
POST {{base_url}}/documents/{{document_id}}/comments/{{comment_id}}/like
Authorization: Bearer {{auth_token}}
```

### 3.7 Report Comment (Protected)

```http
POST {{base_url}}/documents/{{document_id}}/comments/{{comment_id}}/report
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "reason": "Nội dung không phù hợp"
}
```

---

## 4. Rating System APIs

### 4.1 Get Document Ratings

```http
GET {{base_url}}/documents/{{document_id}}/ratings
```

### 4.2 Get User Rating (Protected)

```http
GET {{base_url}}/documents/{{document_id}}/ratings/user
Authorization: Bearer {{auth_token}}
```

### 4.3 Create/Update Rating (Protected)

```http
POST {{base_url}}/documents/{{document_id}}/ratings
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "diemDanhGia": 5,
  "binhLuan": "Tài liệu xuất sắc với nội dung có giá trị"
}
```

### 4.4 Delete Rating (Protected)

```http
DELETE {{base_url}}/documents/{{document_id}}/ratings/{{rating_id}}
Authorization: Bearer {{auth_token}}
```

### 4.5 Toggle Rating Visibility (Admin Only)

```http
PUT {{base_url}}/documents/{{document_id}}/ratings/{{rating_id}}/visibility
Authorization: Bearer {{admin_token}}
```

---

## 5. Category Management APIs

### 5.1 Get All Categories (Public)

```http
GET {{base_url}}/categories
```

**Query Parameters:**

- `language`: vi/en/both (default: both)
- `active`: true/false/all (default: true)
- `parent`: root/all/{ObjectId} (default: all)
- `search`: Search term
- `includeChildren`: true/false (default: false)

### 5.2 Get Category Tree (Public)

```http
GET {{base_url}}/categories/tree?language=vi
```

### 5.3 Get Category Statistics (Public)

```http
GET {{base_url}}/categories/statistics
```

### 5.4 Get Category by ID (Public)

```http
GET {{base_url}}/categories/{{category_id}}
```

### 5.5 Get Category Custom Fields Configuration (Public)

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
      "optional": ["soTrang", "doi", "issn", "impactFactor"],
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
        }
      }
    }
  }
}
```

### 5.6 Create Category (Admin Only)

```http
POST {{base_url}}/categories
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
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
    "vi": ["công nghệ", "thông tin", "IT", "phần mềm"],
    "en": ["technology", "information", "IT", "software"]
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
      }
    }
  }
}
```

### 5.7 Update Category (Admin Only)

```http
PUT {{base_url}}/categories/{{category_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "tenDanhMuc": {
    "vi": "Công nghệ thông tin cập nhật",
    "en": "Updated Information Technology"
  },
  "customFieldsConfig": {
    "required": ["tacGia", "namXuatBan", "tapChi", "soTrang"],
    "optional": ["doi", "issn", "impactFactor"]
  }
}
```

### 5.8 Delete Category (Admin Only)

```http
DELETE {{base_url}}/categories/{{category_id}}
Authorization: Bearer {{admin_token}}
```

---

## 6. User Management APIs

### 6.1 Get All Users (Admin Only)

```http
GET {{base_url}}/users
Authorization: Bearer {{admin_token}}
```

### 6.2 Get User by ID (Protected)

```http
GET {{base_url}}/users/{{user_id}}
Authorization: Bearer {{auth_token}}
```

### 6.3 Get Current User Profile (Protected)

```http
GET {{base_url}}/users/profile
Authorization: Bearer {{auth_token}}
```

### 6.4 Update User Profile (Protected)

```http
PUT {{base_url}}/users/profile
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "hoTen": {
    "vi": "Nguyễn Văn A",
    "en": "Nguyen Van A"
  },
  "soDienThoai": "0123456789",
  "diaChi": "Hà Nội, Việt Nam"
}
```

### 6.5 Update User (Admin Only)

```http
PUT {{base_url}}/users/{{user_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "vaiTro": "teacher",
  "trangThaiHoatDong": true
}
```

### 6.6 Delete User (Admin Only)

```http
DELETE {{base_url}}/users/{{user_id}}
Authorization: Bearer {{admin_token}}
```

### 6.7 Upload Avatar (Protected)

```http
POST {{base_url}}/users/avatar
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data

// Form Data:
avatar: [file]
```

---

## 7. Transaction APIs

### 7.1 Get User Transactions (Protected)

```http
GET {{base_url}}/transactions/my-transactions
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `loaiGiaoDich`: nap_tien/tai_xuong/hoan_tien/thuong
- `trangThai`: pending/completed/failed/cancelled
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

### 7.2 Get All Transactions (Admin Only)

```http
GET {{base_url}}/transactions
Authorization: Bearer {{admin_token}}
```

### 7.3 Create Transaction (Protected)

```http
POST {{base_url}}/transactions
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "loaiGiaoDich": "nap_tien",
  "soTien": 100000,
  "moTa": "Nạp tiền vào tài khoản"
}
```

### 7.4 Update Transaction Status (Admin Only)

```http
PUT {{base_url}}/transactions/{{transaction_id}}/status
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "trangThai": "completed",
  "ghiChu": "Giao dịch thành công"
}
```

---

## 8. Dashboard APIs

### 8.1 Get Dashboard Statistics (Admin Only)

```http
GET {{base_url}}/dashboard/stats
Authorization: Bearer {{admin_token}}
```

### 8.2 Get Recent Activities (Admin Only)

```http
GET {{base_url}}/dashboard/recent-activities
Authorization: Bearer {{admin_token}}
```

### 8.3 Get User Activity Log (Protected)

```http
GET {{base_url}}/user-activities
Authorization: Bearer {{auth_token}}
```

---

## 9. File Management APIs

### 9.1 Upload File (Protected)

```http
POST {{base_url}}/files/upload
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data

// Form Data:
file: [file]
danhMuc: "{{category_id}}"
```

### 9.2 Get Files (Protected)

```http
GET {{base_url}}/files
Authorization: Bearer {{auth_token}}
```

### 9.3 Delete File (Protected)

```http
DELETE {{base_url}}/files/{{file_id}}
Authorization: Bearer {{auth_token}}
```

---

## 10. Health Check

### 10.1 Health Check (Public)

```http
GET {{base_url}}/health
```

---

## Environment Setup Instructions

1. **Create Environment:**

   - Name: `BMC CAF Library - Local`
   - Variables:
     - `base_url`: `http://localhost:3000/api`
     - `auth_token`: (empty initially)
     - `admin_token`: (empty initially)
     - `document_id`: (will be set after creating document)
     - `category_id`: (will be set after creating category)
     - `user_id`: (will be set after creating user)

2. **Import Collection:**

   - Copy all API endpoints above into Postman
   - Organize into folders by functionality
   - Set environment variables as needed

3. **Test Flow:**
   1. Start with authentication (register/login)
   2. Test public endpoints
   3. Test protected endpoints with auth token
   4. Test admin endpoints with admin token

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## Model Field Mapping

### User Model Fields

- `tenDangNhap`: Tên đăng nhập
- `email`: Email
- `matKhau`: Mật khẩu
- `hoTen`: Họ tên
- `soDienThoai`: Số điện thoại
- `diaChi`: Địa chỉ
- `anhDaiDien`: Ảnh đại diện
- `vaiTro`: Vai trò (admin/teacher/user)
- `trangThaiHoatDong`: Trạng thái hoạt động
- `soDuTaiKhoan`: Số dư tài khoản
- `xacThucEmail`: Xác thực email
- `lanDangNhapCuoi`: Lần đăng nhập cuối

### Document Model Fields

- `thongTinDaNgonNgu`: Thông tin đa ngôn ngữ
  - `tieuDe`: Tiêu đề (vi/en)
  - `tomTat`: Tóm tắt (vi/en)
  - `tuKhoa`: Từ khóa (vi/en)
- `tacGia`: Tác giả
- `danhMuc`: Danh mục
- `customFields`: Trường tùy chỉnh theo category
- `files`: Files
- `gia`: Giá (mienPhi, giaXem, giaTaiXuong)
- `thongKe`: Thống kê (luotXem, luotTaiXuong, danhGia)
- `trangThaiDuyet`: Trạng thái duyệt

### Category Model Fields

- `tenDanhMuc`: Tên danh mục (vi/en)
- `maDanhMuc`: Mã danh mục
- `moTa`: Mô tả (vi/en)
- `danhMucCha`: Danh mục cha
- `thuTu`: Thứ tự
- `kichHoat`: Kích hoạt
- `customFieldsConfig`: Cấu hình custom fields

### Comment Model Fields

- `taiLieu`: Tài liệu
- `nguoiDung`: Người dùng
- `noiDung`: Nội dung
- `binhLuanCha`: Bình luận cha
- `trangThai`: Trạng thái
- `luotThich`: Lượt thích

### Rating Model Fields

- `taiLieu`: Tài liệu
- `nguoiDung`: Người dùng
- `diemDanhGia`: Điểm đánh giá
- `binhLuan`: Bình luận
- `trangThai`: Trạng thái

---

## Notes

- Tất cả API protected cần có `Authorization: Bearer {{token}}` header
- File upload APIs sử dụng `multipart/form-data`
- Admin endpoints yêu cầu user có role "admin"
- Teacher endpoints yêu cầu user có role "admin" hoặc "teacher"
- Health check endpoint không cần authentication
- Base URL có thể thay đổi tùy theo environment (development, staging, production)
- Tất cả các trường trong request/response đều sử dụng tên tiếng Việt theo model
- Custom fields validation thay đổi theo category được chọn
- Mỗi category có thể có cấu hình custom fields riêng
