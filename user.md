# Flow: Người dùng thông thường xem và tải tài liệu

## 0. Đăng ký, Đăng nhập, Đăng xuất, Làm mới token

### 0.1. Đăng ký tài khoản

- **API:** `POST /auth/register`
- **Body:**
  ```json
  {
    "tenDangNhap": "username",
    "email": "user@email.com",
    "matKhau": "password",
    "hoTen": "Họ Tên",
    "soDienThoai": "0123456789",
    "diaChi": "Địa chỉ"
  }
  ```
- **Response thành công:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "...",
        "tenDangNhap": "username",
        "email": "user@email.com",
        "hoTen": "Họ Tên",
        "vaiTro": "user"
      },
      "accessToken": "<jwt>",
      "refreshToken": "<refresh_jwt>"
    },
    "message": "Đăng ký thành công!"
  }
  ```

### 0.2. Đăng nhập

- **API:** `POST /auth/login`
- **Body:**
  ```json
  {
    "tenDangNhap": "username",
    "matKhau": "password"
  }
  ```
- **Response thành công:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "...",
        "tenDangNhap": "username",
        "email": "user@email.com",
        "hoTen": "Họ Tên",
        "vaiTro": "user"
      },
      "accessToken": "<jwt>",
      "refreshToken": "<refresh_jwt>"
    }
  }
  ```
- **Lưu ý:** Lưu `accessToken` để gửi ở header `Authorization: Bearer <token>` cho các API cần xác thực. Lưu `refreshToken` để làm mới token khi hết hạn.

### 0.3. Làm mới access token

- **API:** `POST /auth/refresh-token`
- **Body:**
  ```json
  {
    "refreshToken": "<refresh_jwt>"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "<new_jwt>",
      "refreshToken": "<new_refresh_jwt>"
    }
  }
  ```

### 0.4. Đăng xuất

- **API:** `POST /auth/logout`
- **Header:** `Authorization: Bearer <accessToken>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Đăng xuất thành công"
  }
  ```

---

## Quy trình xác thực

- Các API cần xác thực sẽ yêu cầu header:  
  `Authorization: Bearer <accessToken>`
- Nếu token hết hạn, dùng API `/auth/refresh-token` để lấy token mới.
- Khi logout, refreshToken sẽ bị xóa khỏi server, user cần đăng nhập lại để lấy token mới.

---

## 1. Đăng nhập hệ thống

- Người dùng đăng nhập bằng tài khoản đã đăng ký.
- Nhận token xác thực (Bearer Token) để sử dụng cho các API tiếp theo.

## 2. Xem danh sách tài liệu

- **API:** `GET /documents`
- **Quyền:** Người dùng thông thường (user)
- **Mô tả:**
  - Trả về danh sách các tài liệu đã được duyệt (`trangThaiDuyet=da_duyet`).
  - Có thể lọc, tìm kiếm theo từ khóa, danh mục, tác giả, v.v.
- **Ví dụ:**
  ```http
  GET /documents?page=1&limit=20
  Authorization: Bearer <token>
  ```

## 2.1. Tìm kiếm tài liệu theo tên (từ khóa)

- **API:** `GET /documents?q=<từ_khóa>`
- **Tham số:**
  - `q`: Từ khóa tìm kiếm (tìm theo tiêu đề, mô tả, từ khóa...)
  - Có thể kết hợp với các tham số phân trang, lọc khác
- **Ví dụ request (Postman):**
  ```http
  GET /documents?q=toan&page=1&limit=10
  Authorization: Bearer <token>
  ```
- **Response mẫu:**
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
            "tuKhoa": { "vi": ["toán", "cao cấp"], "en": ["math"] }
          },
          "danhMuc": { "_id": "65f1a2b3c4d5e6f7a8b9c0c1", "ten": "Khoa học" },
          "trangThaiDuyet": "da_duyet",
          "files": [ ... ],
          "createdAt": "2025-06-27T10:00:00.000Z"
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

## 2.2. Lọc tài liệu theo category

- **API:** `GET /documents?category=<category_id>`
- **Tham số:**
  - `category`: ID của danh mục cần lọc
  - Có thể kết hợp với tìm kiếm từ khóa, phân trang
- **Ví dụ request (Postman):**
  ```http
  GET /documents?category=65f1a2b3c4d5e6f7a8b9c0c1&page=1&limit=10
  Authorization: Bearer <token>
  ```
- **Response mẫu:**
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
            "tuKhoa": { "vi": ["toán", "cao cấp"], "en": ["math"] }
          },
          "danhMuc": { "_id": "65f1a2b3c4d5e6f7a8b9c0c1", "ten": "Khoa học" },
          "trangThaiDuyet": "da_duyet",
          "files": [ ... ],
          "createdAt": "2025-06-27T10:00:00.000Z"
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

## 3. Xem chi tiết tài liệu

- **API:** `GET /documents/:id`
- **Quyền:** Người dùng thông thường
- **Mô tả:**
  - Xem thông tin chi tiết về tài liệu, các file đính kèm, metadata, v.v.
- **Ví dụ:**
  ```http
  GET /documents/65f1a2b3c4d5e6f7a8b9c0d1
  Authorization: Bearer <token>
  ```

## 4. Tải file tài liệu

- **API:** `GET /documents/:documentId/files/:fileId/download`
- **Quyền:** Người dùng thông thường
- **Mô tả:**
  - Tải file đính kèm của tài liệu (chỉ với tài liệu đã được duyệt).
  - Nếu tài liệu/file có tính phí, hệ thống sẽ kiểm tra số dư trước khi cho phép tải.
- **Ví dụ:**
  ```http
  GET /documents/65f1a2b3c4d5e6f7a8b9c0d1/files/65f1a2b3c4d5e6f7a8b9c0d2/download
  Authorization: Bearer <token>
  ```

## 5. Xem lịch sử tài liệu đã tải

- **API:** `GET /users/me/downloads`
- **Quyền:** Người dùng thông thường
- **Mô tả:**
  - Xem lại danh sách các tài liệu đã tải về trước đó.
- **Ví dụ:**
  ```http
  GET /users/me/downloads
  Authorization: Bearer <token>
  ```

---

## Lưu ý về quyền hạn

- Người dùng thông thường **không thể**:
  - Tải tài liệu chưa được duyệt hoặc bị từ chối.
  - Xóa, chỉnh sửa tài liệu của người khác.
  - Duyệt hoặc từ chối tài liệu.
- Nếu tài liệu/file có tính phí, người dùng phải có đủ số dư để tải.

## Tóm tắt flow

1. Đăng nhập → 2. Xem danh sách tài liệu → 3. Xem chi tiết → 4. Tải file → 5. Xem lịch sử đã tải

---

Nếu cần ví dụ cụ thể về request/response hoặc muốn bổ sung flow khác, hãy yêu cầu thêm!
