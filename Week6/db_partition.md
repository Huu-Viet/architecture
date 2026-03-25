# Database Partitioning (Phân vùng cơ sở dữ liệu)

## 1. Database Partitioning là gì?

Database Partitioning là phương pháp chia một bảng dữ liệu lớn thành nhiều phần nhỏ hơn (gọi là *partition*). Việc này giúp:

- Cải thiện hiệu năng truy vấn  
- Đơn giản hóa việc quản lý dữ liệu  
- Tăng khả năng mở rộng của hệ thống  

---

## 2. Vertical Partitioning (Phân vùng theo chiều dọc)

### Khái niệm

Vertical Partitioning là cách tách bảng dựa trên **các cột (columns)**.  
Mỗi partition sẽ chứa một tập hợp cột riêng biệt của bảng gốc.

### Ví dụ

Bảng `Users` ban đầu:

| id | name | email | address | avatar | bio |
|----|------|-------|---------|--------|-----|

Sau khi phân vùng:

**Users_basic**

| id | name | email |
|----|------|-------|

**Users_profile**

| id | address | avatar | bio |
|----|---------|--------|-----|

### Khi áp dụng

- Một số cột ít được sử dụng  
- Muốn giảm lượng dữ liệu đọc khi truy vấn  

### Ưu điểm

- Truy vấn nhanh hơn do chỉ lấy dữ liệu cần thiết  
- Giảm chi phí I/O  

### Nhược điểm

- Cần JOIN khi muốn lấy đầy đủ thông tin  

---

## 3. Horizontal Partitioning (Phân vùng theo chiều ngang)

### Khái niệm

Horizontal Partitioning là cách chia bảng theo **các dòng (rows)**.  
Mỗi partition chứa một nhóm bản ghi riêng.

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

Hoặc chia theo `user_id`:

- Server 1: user_id từ 1–1000  
- Server 2: user_id từ 1001–2000  

### Khi áp dụng

- Dữ liệu có kích thước rất lớn  
- Cần mở rộng hệ thống theo chiều ngang (sharding)  

### Ưu điểm

- Tăng hiệu năng truy vấn  
- Dễ dàng phân tán dữ liệu sang nhiều server  

### Nhược điểm

- Truy vấn phức tạp hơn (cần xác định đúng partition)  
- Khó thực hiện JOIN giữa các partition  

---

## 4. Functional Partitioning (Phân vùng theo chức năng)

### Khái niệm

Functional Partitioning là cách tổ chức database dựa trên **chức năng nghiệp vụ (business logic)**.  
Mỗi module hoặc service sẽ có database riêng.

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

### Khi áp dụng

- Kiến trúc Microservices  
- Hệ thống lớn với nhiều module độc lập  

### Ưu điểm

- Phân tách rõ ràng giữa các thành phần  
- Dễ mở rộng từng phần riêng biệt  
- Giảm sự phụ thuộc giữa các module  

### Nhược điểm

- Khó truy vấn dữ liệu giữa các service  
- Cần API hoặc message queue để giao tiếp  

---

## 5. So sánh nhanh

| Loại | Chia theo | Mục đích chính | Ví dụ |
|------|----------|----------------|-------|
| Vertical | Cột | Tối ưu truy vấn | Tách profile |
| Horizontal | Dòng | Mở rộng dữ liệu | Sharding |
| Functional | Chức năng | Tổ chức hệ thống | User / Order DB |

---

## 6. Tổng kết

- **Vertical Partitioning**: tối ưu truy vấn theo cột  
- **Horizontal Partitioning**: xử lý dữ liệu lớn và scale hệ thống  
- **Functional Partitioning**: phân chia theo nghiệp vụ  

Trong thực tế, các hệ thống lớn thường kết hợp cả ba phương pháp để đạt hiệu quả tối ưu.