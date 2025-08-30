# API Tìm Kiếm Tài Liệu - Người Dùng Thông Thường

## Tổng Quan

Bộ API tìm kiếm tài liệu cho phép người dùng thông thường tìm kiếm, lọc và xem các tài liệu đã được duyệt trong hệ thống BMC CAF Library. Tất cả các API này đều là **Public** - không cần authentication token.

---

## 1. Tìm Kiếm Tài Liệu Cơ Bản (Public)

### Endpoint

```http
GET {{base_url}}/documents
```

### Mô Tả

API này cho phép người dùng thông thường tìm kiếm và lọc tài liệu đã được duyệt (`trangThaiDuyet=da_duyet`). Hỗ trợ tìm kiếm đa ngôn ngữ (Việt-Anh) và nhiều tiêu chí lọc khác nhau.

### Query Parameters

| Parameter | Type | Required | Default | Mô Tả |
|-----------|------|----------|---------|-------|
| `q` | string | ❌ | - | Từ khóa tìm kiếm (tìm theo tiêu đề, mô tả, từ khóa) |
| `language` | string | ❌ | `both` | Ngôn ngữ: `vi`/`en`/`both` |
| `category` | string | ❌ | - | ID của danh mục cần lọc |
| `author` | string | ❌ | - | Tên tác giả cần tìm |
| `yearFrom` | number | ❌ | - | Năm bắt đầu |
| `yearTo` | number | ❌ | - | Năm kết thúc |
| `status` | string | ❌ | - | Trạng thái: `cong_khai`/`gioi_han`/`rieng_tu` |
| `pricing` | string | ❌ | - | Loại giá: `mien_phi`/`tra_phi` |
| `page` | number | ❌ | `1` | Số trang |
| `limit` | number | ❌ | `20` | Số item trên mỗi trang |
| `sortBy` | string | ❌ | `createdAt` | Sắp xếp theo: `createdAt`/`updatedAt`/`luotXem`/`luotTaiXuong` |
| `sortOrder` | string | ❌ | `desc` | Thứ tự sắp xếp: `asc`/`desc` |

### Ví Dụ Request

```http
GET {{base_url}}/documents?q=toan&category=65f1a2b3c4d5e6f7a8b9c0c1&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Response Success

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
        "thongTinDaNgonNgu": {
          "tieuDe": { "vi": "Toán cao cấp", "en": "Advanced Math" },
          "tomTat": { "vi": "Tài liệu toán", "en": "Math doc" },
          "tuKhoa": { "vi": ["toán", "cao cấp"], "en": ["math"] },
          "ngonNguChinh": "vi"
        },
        "tacGia": [
          {
            "hoTen": { "vi": "Nguyễn Văn A", "en": "Nguyen Van A" },
            "email": "author@example.com",
            "donViCongTac": { "vi": "Đại học ABC", "en": "ABC University" },
            "vaiTro": "tac_gia_chinh"
          }
        ],
        "danhMuc": { 
          "_id": "65f1a2b3c4d5e6f7a8b9c0c1", 
          "ten": { "vi": "Khoa học", "en": "Science" } 
        },
        "customFields": {
          "namXuatBan": 2024,
          "tapChi": "Tạp chí Khoa học Công nghệ"
        },
        "gia": {
          "mienPhi": true,
          "giaXem": 0,
          "giaTaiXuong": 0
        },
        "trangThaiDuyet": "da_duyet",
        "files": [
          {
            "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
            "tenFile": { "vi": "toan_cao_cap.pdf", "en": "advanced_math.pdf" },
            "kichThuoc": 2048576,
            "loaiFile": "application/pdf"
          }
        ],
        "createdAt": "2025-06-27T10:00:00.000Z",
        "updatedAt": "2025-06-27T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

## 2. Tìm Kiếm Tài Liệu Theo Từ Khóa (Public)

### Endpoint

```http
GET {{base_url}}/documents/search?q={từ_khóa}
```

### Mô Tả

API chuyên dụng cho tìm kiếm theo từ khóa với kết quả được tối ưu hóa. Tìm kiếm trong tiêu đề, mô tả, từ khóa và nội dung tài liệu.

### Query Parameters

| Parameter | Type | Required | Default | Mô Tả |
|-----------|------|----------|---------|-------|
| `q` | string | ✅ | - | Từ khóa tìm kiếm |
| `page` | number | ❌ | `1` | Số trang |
| `limit` | number | ❌ | `10` | Số item trên mỗi trang |

### Ví Dụ Request

```http
GET {{base_url}}/documents/search?q=javascript&page=1&limit=10
```

### Response Success

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
        "thongTinDaNgonNgu": {
          "tieuDe": { "vi": "JavaScript cơ bản", "en": "Basic JavaScript" },
          "tomTat": { "vi": "Hướng dẫn JavaScript", "en": "JavaScript guide" },
          "tuKhoa": { "vi": ["javascript", "web"], "en": ["javascript", "web"] }
        },
        "trangThaiDuyet": "da_duyet",
        "createdAt": "2025-06-27T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

---

## 3. Lọc Tài Liệu Theo Danh Mục (Public)

### Endpoint

```http
GET {{base_url}}/documents/category/{category_id}
```

### Mô Tả

Lấy tài liệu theo danh mục cụ thể. Hữu ích khi người dùng muốn xem tất cả tài liệu trong một lĩnh vực nhất định.

### Path Parameters

| Parameter | Type | Required | Mô Tả |
|-----------|------|----------|-------|
| `category_id` | string | ✅ | ID của danh mục cần lọc |

### Query Parameters

| Parameter | Type | Required | Default | Mô Tả |
|-----------|------|----------|---------|-------|
| `page` | number | ❌ | `1` | Số trang |
| `limit` | number | ❌ | `10` | Số item trên mỗi trang |
| `sortBy` | string | ❌ | `createdAt` | Sắp xếp theo |
| `sortOrder` | string | ❌ | `desc` | Thứ tự sắp xếp |

### Ví Dụ Request

```http
GET {{base_url}}/documents/category/65f1a2b3c4d5e6f7a8b9c0c1?page=1&limit=10
```

---

## 4. Lấy Tài Liệu Phổ Biến (Public)

### Endpoint

```http
GET {{base_url}}/documents/popular
```

### Mô Tả

Lấy danh sách tài liệu được xem và tải xuống nhiều nhất trong khoảng thời gian nhất định.

### Query Parameters

| Parameter | Type | Required | Default | Mô Tả |
|-----------|------|----------|---------|-------|
| `limit` | number | ❌ | `10` | Số lượng tài liệu |
| `timeRange` | string | ❌ | `week` | Khoảng thời gian: `week`/`month`/`year` |

### Ví Dụ Request

```http
GET {{base_url}}/documents/popular?limit=10&timeRange=week
```

### Response Success

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d4",
        "thongTinDaNgonNgu": {
          "tieuDe": { "vi": "Tài liệu phổ biến", "en": "Popular Document" }
        },
        "luotXem": 1500,
        "luotTaiXuong": 300,
        "trangThaiDuyet": "da_duyet"
      }
    ]
  }
}
```

---

## 5. Lấy Tài Liệu Mới Nhất (Public)

### Endpoint

```http
GET {{base_url}}/documents/latest
```

### Mô Tả

Lấy danh sách tài liệu mới được thêm vào hệ thống, sắp xếp theo thời gian tạo mới nhất.

### Query Parameters

| Parameter | Type | Required | Default | Mô Tả |
|-----------|------|----------|---------|-------|
| `limit` | number | ❌ | `10` | Số lượng tài liệu |

### Ví Dụ Request

```http
GET {{base_url}}/documents/latest?limit=10
```

---

## 6. Xem Chi Tiết Tài Liệu (Public)

### Endpoint

```http
GET {{base_url}}/documents/{document_id}
```

### Mô Tả

Xem thông tin chi tiết về tài liệu, các file đính kèm, metadata, và thông tin tác giả.

### Path Parameters

| Parameter | Type | Required | Mô Tả |
|-----------|------|----------|-------|
| `document_id` | string | ✅ | ID của tài liệu cần xem |

### Ví Dụ Request

```http
GET {{base_url}}/documents/65f1a2b3c4d5e6f7a8b9c0d1
```

### Response Success

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "thongTinDaNgonNgu": {
      "tieuDe": { "vi": "Toán cao cấp", "en": "Advanced Math" },
      "tomTat": { "vi": "Tài liệu toán", "en": "Math doc" },
      "tuKhoa": { "vi": ["toán", "cao cấp"], "en": ["math"] },
      "ngonNguChinh": "vi"
    },
    "tacGia": [
      {
        "hoTen": { "vi": "Nguyễn Văn A", "en": "Nguyen Van A" },
        "email": "author@example.com",
        "donViCongTac": { "vi": "Đại học ABC", "en": "ABC University" },
        "vaiTro": "tac_gia_chinh"
      }
    ],
    "danhMuc": { 
      "_id": "65f1a2b3c4d5e6f7a8b9c0c1", 
      "ten": { "vi": "Khoa học", "en": "Science" } 
    },
    "customFields": {
      "namXuatBan": 2024,
      "tapChi": "Tạp chí Khoa học Công nghệ",
      "soTrang": 150,
      "doi": "10.1234/abc.2024.001"
    },
    "gia": {
      "mienPhi": true,
      "giaXem": 0,
      "giaTaiXuong": 0
    },
    "trangThaiDuyet": "da_duyet",
    "files": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
        "tenFile": { "vi": "toan_cao_cap.pdf", "en": "advanced_math.pdf" },
        "kichThuoc": 2048576,
        "loaiFile": "application/pdf",
        "duongDan": "/uploads/toan_cao_cap.pdf"
      }
    ],
    "luotXem": 1250,
    "luotTaiXuong": 89,
    "createdAt": "2025-06-27T10:00:00.000Z",
    "updatedAt": "2025-06-27T10:00:00.000Z"
  }
}
```

---

## 7. Tìm Kiếm Nâng Cao (Kết Hợp Nhiều Tiêu Chí)

### Ví Dụ Sử Dụng Thực Tế

#### 7.1 Tìm Kiếm Tài Liệu Toán Học Miễn Phí Năm 2024

```http
GET {{base_url}}/documents?q=toan&yearFrom=2024&yearTo=2024&pricing=mien_phi&page=1&limit=20
```

#### 7.2 Lọc Tài Liệu Theo Danh Mục Và Sắp Xếp Theo Lượt Xem

```http
GET {{base_url}}/documents?category=65f1a2b3c4d5e6f7a8b9c0c1&sortBy=luotXem&sortOrder=desc&page=1&limit=15
```

#### 7.3 Tìm Kiếm Tài Liệu Tiếng Anh Về JavaScript

```http
GET {{base_url}}/documents?q=javascript&language=en&page=1&limit=10
```

#### 7.4 Tìm Kiếm Tài Liệu Của Tác Giả Cụ Thể

```http
GET {{base_url}}/documents?author=Nguyễn&yearFrom=2020&yearTo=2024&page=1&limit=20
```

#### 7.5 Tìm Kiếm Tài Liệu Có Phí Trong Danh Mục Cụ Thể

```http
GET {{base_url}}/documents?category=65f1a2b3c4d5e6f7a8b9c0c1&pricing=tra_phi&sortBy=giaXem&sortOrder=asc&page=1&limit=10
```

---

## 8. Lưu Ý Quan Trọng

### 8.1 Quyền Truy Cập
- **Tất cả API tìm kiếm đều là Public** - không cần authentication token
- Người dùng có thể sử dụng mà không cần đăng nhập

### 8.2 Giới Hạn Dữ Liệu
- **Chỉ trả về tài liệu đã được duyệt** (`trangThaiDuyet=da_duyet`)
- Không hiển thị tài liệu đang chờ duyệt hoặc bị từ chối

### 8.3 Phân Trang
- **Mặc định:** 20 items/trang
- **Tùy chỉnh:** Có thể thay đổi từ 1-100 items/trang
- **Giới hạn:** Tối đa 100 items/trang để tránh quá tải

### 8.4 Sắp Xếp
- **Mặc định:** Sắp xếp theo thời gian tạo mới nhất (`createdAt desc`)
- **Tùy chọn:** Có thể sắp xếp theo nhiều tiêu chí khác nhau

### 8.5 Tìm Kiếm Đa Ngôn Ngữ
- **Hỗ trợ:** Tiếng Việt và Tiếng Anh
- **Tìm kiếm:** Trong cả hai ngôn ngữ hoặc chỉ một ngôn ngữ cụ thể
- **Kết quả:** Hiển thị theo ngôn ngữ được chọn

### 8.6 Hiệu Suất
- **Caching:** Kết quả tìm kiếm được cache để tăng tốc độ
- **Indexing:** Dữ liệu được đánh index để tìm kiếm nhanh
- **Pagination:** Hỗ trợ phân trang để tránh load quá nhiều dữ liệu

---

## 9. Error Handling

### 9.1 Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid query parameters",
  "message": "Year range is invalid"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Category not found",
  "message": "Category with ID 65f1a2b3c4d5e6f7a8b9c0c1 does not exist"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```

### 9.2 Validation Rules

- **page:** Phải là số nguyên dương >= 1
- **limit:** Phải là số nguyên từ 1-100
- **yearFrom/yearTo:** Phải là năm hợp lệ (1900-2100)
- **category:** Phải là ObjectId hợp lệ
- **language:** Chỉ chấp nhận `vi`, `en`, `both`
- **status:** Chỉ chấp nhận `cong_khai`, `gioi_han`, `rieng_tu`
- **pricing:** Chỉ chấp nhận `mien_phi`, `tra_phi`
- **sortBy:** Chỉ chấp nhận `createdAt`, `updatedAt`, `luotXem`, `luotTaiXuong`
- **sortOrder:** Chỉ chấp nhận `asc`, `desc`

---

## 10. Rate Limiting

### 10.1 Giới Hạn Tốc Độ
- **Public APIs:** 100 requests/phút
- **Search APIs:** 200 requests/phút
- **Document Detail:** 300 requests/phút

### 10.2 Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 11. Testing với Postman

### 11.1 Environment Variables
```json
{
  "base_url": "http://localhost:3000/api",
  "category_id": "65f1a2b3c4d5e6f7a8b9c0c1",
  "document_id": "65f1a2b3c4d5e6f7a8b9c0d1"
}
```

### 11.2 Test Cases

#### Test Case 1: Tìm Kiếm Cơ Bản
```http
GET {{base_url}}/documents?q=toan&page=1&limit=10
```

#### Test Case 2: Lọc Theo Danh Mục
```http
GET {{base_url}}/documents?category={{category_id}}&page=1&limit=5
```

#### Test Case 3: Tìm Kiếm Nâng Cao
```http
GET {{base_url}}/documents?q=javascript&language=en&yearFrom=2020&pricing=mien_phi&sortBy=luotXem&sortOrder=desc&page=1&limit=15
```

#### Test Case 4: Tài Liệu Phổ Biến
```http
GET {{base_url}}/documents/popular?limit=5&timeRange=month
```

#### Test Case 5: Tài Liệu Mới Nhất
```http
GET {{base_url}}/documents/latest?limit=5
```

---

## 12. Changelog

### Version 1.0.0 (2024-06-27)
- ✅ Tìm kiếm cơ bản với từ khóa
- ✅ Lọc theo danh mục
- ✅ Lọc theo năm, tác giả, trạng thái
- ✅ Sắp xếp theo nhiều tiêu chí
- ✅ Phân trang
- ✅ Tìm kiếm đa ngôn ngữ
- ✅ API tài liệu phổ biến
- ✅ API tài liệu mới nhất

### Version 1.1.0 (Planned)
- 🔄 Tìm kiếm full-text
- 🔄 Tìm kiếm fuzzy
- 🔄 Gợi ý tìm kiếm
- 🔄 Lịch sử tìm kiếm
- �� Bookmark tài liệu
