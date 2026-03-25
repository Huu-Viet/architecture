# Database Partitioning (Phân vùng cơ sở dữ liệu)

## 1. Database Partitioning là gì?

Database Partitioning là kỹ thuật chia nhỏ dữ liệu của một bảng lớn thành nhiều phần nhỏ hơn (gọi là partition) để:
- Tăng hiệu năng truy vấn
- Dễ quản lý dữ liệu
- Scale hệ thống tốt hơn

---

## 2. Vertical Partitioning (Phân vùng theo chiều dọc)

### Khái niệm
Vertical Partitioning là chia bảng theo **cột (columns)**.

Mỗi partition sẽ chứa một nhóm cột của bảng gốc.

### Ví dụ

Bảng `Users` ban đầu:

| id | name | email | address | avatar | bio |
|----|------|-------|--------|--------|-----|

Chia thành 2 bảng:

**Users_basic**
| id | name | email |
|----|------|-------|

**Users_profile**
| id | address | avatar | bio |
|----|----------|--------|-----|

### Khi nào dùng?
- Một số cột ít khi sử dụng (VD: avatar, bio)
- Muốn giảm lượng dữ liệu khi query

### Ưu điểm
- Tăng tốc truy vấn (chỉ lấy cột cần thiết)
- Giảm I/O

### Nhược điểm
- Phải JOIN lại khi cần đầy đủ dữ liệu

---

## 3. Horizontal Partitioning (Phân vùng theo chiều ngang)

### Khái niệm
Horizontal Partitioning là chia bảng theo **dòng (rows)**.

Mỗi partition chứa một tập con các bản ghi.

### Ví dụ

Bảng `Orders`:

| id | user_id | amount | created_at |
|----|---------|--------|------------|

Chia theo năm:

**Orders_2023**
| id | user_id | amount | created_at |
|----|---------|--------|------------|

**Orders_2024**
| id | user_id | amount | created_at |

### Hoặc theo user_id:

- Server 1: user_id từ 1–1000
- Server 2: user_id từ 1001–2000

### Khi nào dùng?
- Dữ liệu rất lớn (big data)
- Cần scale ngang (sharding)

### Ưu điểm
- Tăng hiệu năng query
- Scale dễ dàng (có thể đặt ở nhiều server)

### Nhược điểm
- Query phức tạp hơn (phải biết partition nào chứa data)
- Khó JOIN giữa partitions

---

## 4. Functional Partitioning (Phân vùng theo chức năng)

### Khái niệm
Functional Partitioning là chia hệ thống database theo **chức năng nghiệp vụ (business logic)**.

Mỗi service/module có database riêng.

### Ví dụ

Hệ thống e-commerce:

- **User Service DB**
  - users
  - profiles

- **Order Service DB**
  - orders
  - order_items

- **Product Service DB**
  - products
  - categories

### Khi nào dùng?
- Kiến trúc Microservices
- Hệ thống lớn, nhiều module

### Ưu điểm
- Tách biệt rõ ràng
- Dễ scale từng phần
- Giảm phụ thuộc giữa các module

### Nhược điểm
- Khó query cross-service
- Phải dùng API hoặc message queue để giao tiếp

---

## 5. So sánh nhanh

| Loại | Chia theo | Mục đích chính | Ví dụ |
|------|----------|----------------|-------|
| Vertical | Cột | Tối ưu truy vấn | Tách profile |
| Horizontal | Dòng | Scale dữ liệu | Sharding |
| Functional | Chức năng | Microservices | User / Order DB |

---

## 6. Tổng kết

- **Vertical Partitioning** → tối ưu hiệu năng truy vấn theo cột  
- **Horizontal Partitioning** → xử lý dữ liệu lớn, scale hệ thống  
- **Functional Partitioning** → tổ chức hệ thống theo nghiệp vụ  

Trong thực tế, hệ thống lớn thường **kết hợp cả 3 loại** để đạt hiệu quả tốt nhất.