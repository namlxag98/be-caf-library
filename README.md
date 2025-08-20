# BMC CAF Library API - Postman Test Guide

## Base Configuration

**Base URL:** `http://localhost:3005/api`

## 1. Authentication APIs

### 1.1 Register User

```
POST /api/auth/register
Content-Type: application/json

Body (JSON):
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "123456",
  "hoTen": "John Doe",
  "soDienThoai": "0123456789",
  "diaChi": "123 Street, City"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "hoTen": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Đăng ký thành công!"
}
```

### 1.2 Login

```
POST /api/auth/login
Content-Type: application/json

Body (JSON):
{
  "email": "john@example.com",
  "password": "123456"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "hoTen": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Refresh Token

```
POST /api/auth/refresh-token
Content-Type: application/json

Body (JSON):
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.4 Logout

```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### 1.5 Change Password

```
POST /api/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "oldPassword": "123456",
  "newPassword": "newpassword123"
}
```

## 2. Category APIs

### 2.1 Create Category (Admin only)

```
POST /api/categories
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
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
  }
}
```

### 2.2 Get All Categories

```
GET /api/categories
Query Parameters:
- language: vi/en/both (default: both)
- active: true/false/all (default: true)
- parent: root/all/{ObjectId} (default: all)
- search: search term
- includeChildren: true/false (default: false)

Example:
GET /api/categories?language=vi&active=true&includeChildren=true
```

### 2.3 Get Category Tree

```
GET /api/categories/tree?language=vi
```

### 2.4 Get Category by ID

```
GET /api/categories/{categoryId}
```

### 2.5 Update Category

```
PUT /api/categories/{categoryId}
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "tenDanhMuc": {
    "vi": "Công nghệ thông tin cập nhật",
    "en": "Updated Information Technology"
  }
}
```

### 2.6 Delete Category

```
DELETE /api/categories/{categoryId}
Authorization: Bearer {accessToken}
```

## 3. Document APIs

### 3.1 Create Document

```
POST /api/documents
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- thongTinDaNgonNgu: JSON string
  {
    "tieuDe": {
      "vi": "Tài liệu mẫu",
      "en": "Sample Document"
    },
    "tomTat": {
      "vi": "Tóm tắt tài liệu",
      "en": "Document summary"
    }
  }
- tacGia: JSON string
  [
    {
      "hoTen": {
        "vi": "Nguyễn Văn A",
        "en": "Nguyen Van A"
      },
      "email": "author@example.com",
      "vaiTro": "tac_gia_chinh"
    }
  ]
- danhMuc: {categoryId}
- customFields: JSON string (optional, depends on category)
  {
    "tacGia": "Nguyễn Văn A",
    "namXuatBan": 2024,
    "tapChi": "Tạp chí Khoa học Công nghệ"
  }
- files: file uploads (multiple files allowed)
- gia: JSON string
  {
    "mienPhi": false,
    "giaXem": 0,
    "giaTaiXuong": 50000
  }
```

### 3.2 Get All Documents

```
GET /api/documents
Query Parameters:
- q: search query
- language: vi/en/both
- category: {categoryId}
- author: author name
- yearFrom: start year
- yearTo: end year
- status: cong_khai/gioi_han/rieng_tu
- pricing: mien_phi/tra_phi
- page: page number (default: 1)
- limit: items per page (default: 20)
- sortBy: createdAt/updatedAt/luotXem/luotTaiXuong (default: createdAt)
- sortOrder: asc/desc (default: desc)

Example:
GET /api/documents?q=javascript&category=categoryId&page=1&limit=10
```

### 3.3 Get Document by ID

```
GET /api/documents/{documentId}
```

### 3.4 Download File

```
GET /api/documents/{documentId}/files/{fileId}/download
Authorization: Bearer {accessToken} (optional for free documents)
```

### 3.5 Purchase Document

```
POST /api/documents/{documentId}/files/{fileId}/purchase
Authorization: Bearer {accessToken}
```

### 3.6 Update Document

```
PUT /api/documents/{documentId}
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "thongTinDaNgonNgu": {
    "tieuDe": {
      "vi": "Tài liệu đã cập nhật",
      "en": "Updated Document"
    }
  }
}
```

### 3.7 Delete Document

```
DELETE /api/documents/{documentId}
Authorization: Bearer {accessToken}
```

### 3.8 Approve Document (Admin only)

```
PUT /api/documents/{documentId}/approve
Authorization: Bearer {accessToken}
```

### 3.9 Reject Document (Admin only)

```
PUT /api/documents/{documentId}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "lyDoTuChoi": "Document does not meet quality standards"
}
```

## 4. Comment APIs

### 4.1 Get Comments for Document

```
GET /api/documents/{documentId}/comments
Query Parameters:
- page: page number (default: 1)
- limit: items per page (default: 10)
- sort: sorting order (default: -ngayTao)
```

### 4.2 Create Comment

```
POST /api/documents/{documentId}/comments
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "noiDung": "This is a great document!",
  "binhLuanCha": null
}
```

### 4.3 Get Replies

```
GET /api/documents/{documentId}/comments/{commentId}/replies
Query Parameters:
- page: page number
- limit: items per page
```

### 4.4 Update Comment

```
PUT /api/documents/{documentId}/comments/{commentId}
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "noiDung": "Updated comment content"
}
```

### 4.5 Delete Comment

```
DELETE /api/documents/{documentId}/comments/{commentId}
Authorization: Bearer {accessToken}
```

### 4.6 Like/Unlike Comment

```
POST /api/documents/{documentId}/comments/{commentId}/like
Authorization: Bearer {accessToken}
```

## 5. Rating APIs

### 5.1 Get Ratings for Document

```
GET /api/documents/{documentId}/ratings
Query Parameters:
- page: page number (default: 1)
- limit: items per page (default: 20)
- sortBy: createdAt/diemDanhGia (default: createdAt)
- sortOrder: asc/desc (default: desc)
```

### 5.2 Create/Update Rating

```
POST /api/documents/{documentId}/ratings
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "diemDanhGia": 5,
  "binhLuan": "Excellent document, very helpful!"
}
```

### 5.3 Get User's Rating

```
GET /api/documents/{documentId}/ratings/user
Authorization: Bearer {accessToken}
```

## 6. Transaction APIs

### 6.1 Get User Transactions

```
GET /api/transactions/my-transactions
Authorization: Bearer {accessToken}
Query Parameters:
- page: page number (default: 1)
- limit: items per page (default: 10)
- loaiGiaoDich: nap_tien/tai_xuong/hoan_tien/thuong
- trangThai: pending/completed/failed/cancelled
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

### 6.2 Get All Transactions (Admin only)

```
GET /api/transactions
Authorization: Bearer {accessToken}
Query Parameters:
- page: page number
- limit: items per page
- search: search term
- type: transaction type
- status: transaction status
```

### 6.3 Get Transaction by ID (Admin only)

```
GET /api/transactions/{transactionId}
Authorization: Bearer {accessToken}
```

### 6.4 Create Transaction (Admin only)

```
POST /api/transactions
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "userId": "{userId}",
  "type": "deposit",
  "amount": 100000,
  "description": "Manual deposit"
}
```

## 7. User APIs

### 7.1 Get User Profile

```
GET /api/users/profile
Authorization: Bearer {accessToken}
```

### 7.2 Update User Profile

```
PUT /api/users/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

### 7.3 Get All Users (Admin only)

```
GET /api/users
Authorization: Bearer {accessToken}
Query Parameters:
- page: page number
- limit: items per page
- search: search term
- role: admin/teacher/user
```

### 7.4 Get User by ID (Admin only)

```
GET /api/users/{userId}
Authorization: Bearer {accessToken}
```

### 7.5 Update User (Admin only)

```
PUT /api/users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "username": "updated_username",
  "email": "updated@example.com",
  "role": "teacher",
  "isActive": true
}
```

### 7.6 Update User Balance (Admin only)

```
PUT /api/users/{userId}/balance
Authorization: Bearer {accessToken}
Content-Type: application/json

Body (JSON):
{
  "amount": 50000,
  "type": "add"
}
```

## 8. Dashboard APIs (Admin/Teacher only)

### 8.1 Get Dashboard Overview

```
GET /api/dashboard/overview
Authorization: Bearer {accessToken}
```

### 8.2 Get Revenue Statistics

```
GET /api/dashboard/revenue
Authorization: Bearer {accessToken}
Query Parameters:
- period: day/month/year (default: month)
- year: specific year (default: current year)
```

### 8.3 Get User Statistics

```
GET /api/dashboard/users
Authorization: Bearer {accessToken}
Query Parameters:
- period: week/month/year (default: month)
```

### 8.4 Get File Statistics

```
GET /api/dashboard/files
Authorization: Bearer {accessToken}
Query Parameters:
- period: week/month/year (default: month)
```

## 9. Health Check

### 9.1 Health Check

```
GET /health

Response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "services": {
    "mongodb": "connected",
    "googleDrive": "connected"
  }
}
```

## Postman Collection Setup

### Environment Variables

Tạo Postman Environment với các biến sau:

```
baseUrl: http://localhost:3005/api
accessToken: (sẽ được set sau khi login)
refreshToken: (sẽ được set sau khi login)
userId: (sẽ được set sau khi login)
```

### Pre-request Scripts

Để tự động set token sau khi login, thêm script này vào request login:

```javascript
// Trong Tests tab của login request
if (responseCode.code === 200) {
  const responseJson = pm.response.json();
  if (responseJson.success && responseJson.data) {
    pm.environment.set("accessToken", responseJson.data.accessToken);
    pm.environment.set("refreshToken", responseJson.data.refreshToken);
    pm.environment.set("userId", responseJson.data.user._id);
  }
}
```

### Authorization Header

Đối với các request cần authentication, thêm header:

```
Authorization: Bearer {{accessToken}}
```

## Error Responses

Tất cả API có thể trả về các error response sau:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```
