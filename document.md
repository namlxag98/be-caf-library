# Document API Collection

## Environment Variables

```json
{
  "base_url": "http://localhost:3000/api",
  "auth_token": "",
  "admin_token": "",
  "document_id": "",
  "category_id": "",
  "file_id": ""
}
```

---

## 1. Tạo tài liệu (Create Document)

### Endpoint

```
POST {{base_url}}/documents
```

### Headers

```
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data
```

### Request Body (Form Data)

- `thongTinDaNgonNgu`: JSON string
- `tacGia`: JSON string
- `danhMuc`: category_id
- `customFields`: JSON string (theo cấu hình category)
- `gia`: JSON string
- `files`: file upload (có thể nhiều file)

#### Ví dụ (dạng form-data):

| Key               | Value (JSON hoặc file)                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| thongTinDaNgonNgu | {"tieuDe":{"vi":"Bài báo A","en":"Article A"},"tomTat":{"vi":"Tóm tắt","en":"Summary"},"tuKhoa":{"vi":["khoa học"],"en":["science"]},"ngonNguChinh":"vi"} |
| tacGia            | [{"hoTen":{"vi":"Nguyễn Văn A","en":"Nguyen Van A"},"email":"a@example.com","donViCongTac":{"vi":"ĐH A","en":"A University"},"vaiTro":"tac_gia_chinh"}]   |
| danhMuc           | {{category_id}}                                                                                                                                           |
| customFields      | {"tenBaiBao":"Bài báo A","namCongBo":2024,"fileTomTat":"file.pdf"}                                                                                        |
| gia               | {"mienPhi":true,"giaXem":0,"giaTaiXuong":0}                                                                                                               |
| files             | file.pdf                                                                                                                                                  |

### Response (Success)

```json
{
  "success": true,
  "data": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "thongTinDaNgonNgu": { ... },
    "tacGia": [ ... ],
    "danhMuc": { ... },
    "customFields": { "tenBaiBao": "Bài báo A", "namCongBo": 2024, "fileTomTat": "file.pdf" },
    "files": [ { "_id": "...", "tenFile": {"vi":"file.pdf","en":"file.pdf"}, ... } ],
    "gia": { "mienPhi": true, "giaXem": 0, "giaTaiXuong": 0 },
    "trangThaiDuyet": "cho_duyet",
    "createdAt": "2024-04-27T10:30:00.000Z",
    "updatedAt": "2024-04-27T10:30:00.000Z"
  }
}
```

---

## 2. Cập nhật tài liệu (Update Document)

### Endpoint

```
PUT {{base_url}}/documents/{{document_id}}
```

### Headers

```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

### Request Body (ví dụ)

```json
{
  "thongTinDaNgonNgu": {
    "tieuDe": { "vi": "Bài báo cập nhật", "en": "Updated Article" }
  },
  "customFields": { "tenBaiBao": "Bài báo cập nhật", "namCongBo": 2024 },
  "gia": { "mienPhi": false, "giaXem": 10, "giaTaiXuong": 20 }
}
```

---

## 3. Lấy danh sách tài liệu (Get All Documents)

### Endpoint

```
GET {{base_url}}/documents
```

### Query Params (tùy chọn)

- `q`: từ khóa
- `category`: category_id
- `author`: tên tác giả
- `yearFrom`, `yearTo`: năm
- `status`: cong_khai/gioi_han/rieng_tu
- `pricing`: mien_phi/tra_phi
- `page`, `limit`, `sortBy`, `sortOrder`

### Response

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "...",
        "thongTinDaNgonNgu": { ... },
        "tacGia": [ ... ],
        "danhMuc": { ... },
        "customFields": { ... },
        "files": [ ... ],
        "gia": { ... },
        "trangThaiDuyet": "da_duyet",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 5, ... }
  }
}
```

---

## 4. Lấy chi tiết tài liệu (Get Document by ID)

### Endpoint

```
GET {{base_url}}/documents/{{document_id}}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "thongTinDaNgonNgu": { ... },
    "tacGia": [ ... ],
    "danhMuc": { ... },
    "customFields": { ... },
    "files": [ ... ],
    "gia": { ... },
    "trangThaiDuyet": "da_duyet",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 5. Xóa tài liệu (Delete Document)

### Endpoint

```
DELETE {{base_url}}/documents/{{document_id}}
```

### Headers

```
Authorization: Bearer {{auth_token}}
```

### Response

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 6. Duyệt tài liệu (Approve Document, Admin)

### Endpoint

```
PUT {{base_url}}/documents/{{document_id}}/approve
```

### Headers

```
Authorization: Bearer {{admin_token}}
```

### Response

```json
{
  "success": true,
  "message": "Document approved successfully"
}
```

---

## 7. Từ chối tài liệu (Reject Document, Admin)

### Endpoint

```
PUT {{base_url}}/documents/{{document_id}}/reject
```

### Headers

```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

### Request Body

```json
{
  "reason": "Tài liệu không đạt tiêu chuẩn"
}
```

### Response

```json
{
  "success": true,
  "message": "Document rejected successfully"
}
```

---

## 8. Download file tài liệu (Download File)

### Endpoint

```
GET {{base_url}}/documents/{{document_id}}/files/{{file_id}}/download
```

---

## 9. Lấy custom fields của category (Get Category Custom Fields)

### Endpoint

```
GET {{base_url}}/categories/{{category_id}}/custom-fields
```

### Response

```json
{
  "success": true,
  "data": {
    "categoryId": "...",
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
