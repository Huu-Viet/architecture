# Buổi 3 — Architecture Styles (Layered, Microkernel)

## Với hệ thống “Plugin-based CMS”:

# 1. Vẽ sơ đồ Layered Architecture.

![PluginBase_CMS_Layered_Arch.png](PluginBase_CMS_Layered_Arch.png)

# 2. Vẽ sơ đồ Microkernel Architecture.

![PluginBase_CMS_Microkernel_Arch.png](PluginBase_CMS_Microkernel_Arch.png)

# 3. So sánh ưu/nhược điểm dựa trên sách.Ưu điểm

## Layered Architecture

**1. Dễ hiểu và dễ thiết kế**

Layered là kiến trúc **đơn giản và phổ biến nhất**.

Structure:

```
Presentation
Application
Domain
Infrastructure
```

Mỗi layer có **responsibility rõ ràng** nên:

- dễ đọc code
- dễ onboarding dev mới
- dễ maintain

---

**2. Phù hợp với business application**

Các hệ thống như:

- CRUD system
- enterprise app
- REST API

thường rất phù hợp với layered architecture.

---

**3. Separation of concerns tốt**

Ví dụ:

```
UI → không chứa business logic
Domain → không phụ thuộc database
Data layer → xử lý persistence
```

---

**4. Testing dễ**

Bạn có thể test từng layer riêng:

```
Controller test
Service test
Repository test
```

---

## Nhược điểm

**1. Khó mở rộng module lớn**

Layered thường **không modular theo feature**, nên khi hệ thống lớn:

```
controller/
service/
repository/
```

có thể có **hàng trăm file**.

---

**2. Coupling theo chiều dọc**

Dependency chain dài:

```
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

Một thay đổi nhỏ ở dưới có thể ảnh hưởng nhiều layer.

---

## Microkernel Architecture

### **Ưu điểm**

**1. Extensibility rất cao**

Đây là **điểm mạnh nhất** của microkernel.

Core system:

```
Plugin manager
Plugin API
Extension points
```

Feature nằm ở plugin:

```
SEO Plugin
Payment Plugin
Analytics Plugin
```

Bạn có thể:

- thêm plugin
- remove plugin
- upgrade plugin

mà **không sửa core**.

---

**2. Phù hợp với plugin-based system**

Microkernel thường dùng cho:

- CMS
- IDE
- automation tools

Ví dụ thực tế:

- WordPress
- Eclipse IDE
- Jenkins

---

**3. Hỗ trợ ecosystem**

Third-party dev có thể viết plugin.

Ví dụ:

```
WordPress plugin marketplace
Jenkins plugin ecosystem
```

---

**4. Core system nhỏ và ổn định**

Microkernel giữ:

```
minimal logic
plugin lifecycle
extension point
```

Core ít thay đổi → **system ổn định hơn**.

---

## Nhược điểm

**1. Thiết kế phức tạp hơn**

Bạn phải thiết kế:

```
plugin interface
plugin loader
dependency management
lifecycle
```

Điều này **khó hơn layered architecture**.

---

**2. Debug khó hơn**

Flow của system có thể như sau:

```
Core
  ↓
Plugin API
  ↓
Plugin A
  ↓
Plugin B
```

Nếu lỗi xảy ra, việc debug **phức tạp hơn**.

---

**3. Plugin dependency problem**

Plugin có thể phụ thuộc nhau:

```
Plugin A cần Plugin B
Plugin B cần Plugin C
```

Nếu không quản lý tốt sẽ gây:

```
version conflict
dependency hell
```

---

**4. Performance overhead**

Vì request phải đi qua:

```
Core → Plugin → Plugin API
```

nên có thể chậm hơn so với kiến trúc đơn giản.

---

## Áp dụng cho Plugin-based CMS

### Nếu dùng Layered

```
Controller
Service
Repository
```

Plugin sẽ **khó integrate**.

---

### Nếu dùng Microkernel

```
Core CMS
   ↓
Plugin API
   ↓
Plugins
```

Plugin có thể thêm:

```
SEO
Comment
Ecommerce
Analytics
```

mà **không sửa core CMS**.

---

Vì vậy thường kết luận:

```
Layered → general business systems
Microkernel → extensible product platforms
```

# 4. Chọn style thích hợp nhất

**Style chọn: Microkernel Architecture**

**Giải thích:**

Microkernel Architecture là lựa chọn phù hợp nhất cho CMS vì hệ thống quản lý nội dung thường cần **mở rộng chức năng linh hoạt**. Trong kiến trúc này, **core system (microkernel)** chỉ chứa các chức năng cơ bản như quản lý nội dung, user và plugin manager, trong khi các chức năng bổ sung được triển khai dưới dạng **plugins**. Điều này cho phép thêm, cập nhật hoặc gỡ bỏ tính năng (ví dụ: SEO, comment, analytics) mà **không cần thay đổi core system**, giúp hệ thống dễ mở rộng và dễ bảo trì.