# Kế Hoạch Triển Khai Landing Page Princeton Academy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng Landing Page hoàn chỉnh, tối ưu và chuẩn nhận diện thương hiệu cho Princeton Academy kết hợp tuyển sinh (Phụ huynh) và nhượng quyền chiến lược (Nhà đầu tư), bám sát 100% hình ảnh thực tế và layout tham chiếu.

**Architecture:** Trang web tĩnh Standalone HTML5 + Tailwind CSS + Lucide Icons + Google Fonts + Vanilla ES6 JS. Toàn bộ hình ảnh thực tế từ thư mục dự án được tối ưu hóa chuẩn web để đảm bảo tốc độ tải dưới 1.5 giây. Tích hợp bản đồ Google Maps động chuyển đổi theo 10 cơ sở và form đăng ký 2 tab có xác thực dữ liệu.

**Tech Stack:** HTML5, Tailwind CSS (CDN/Custom config), Vanilla JavaScript (ES6+), PowerShell System.Drawing (Tối ưu hóa ảnh), Leaflet/Google Maps Embed API.

## Global Constraints
- Hệ thống màu chủ đạo: Primary Bordeaux `#8C1823`, Accent Gold `#C89D35`, Dark Footer `#46080F`, Warm Cream Background `#FAF7F2`.
- Sử dụng đầy đủ nội dung từ 7 phần đã cung cấp trong yêu cầu.
- Giữ nguyên ảnh gốc tại `image/`, tạo các ảnh web tối ưu tại `assets/img/`.
- Hỗ trợ responsive hoàn hảo trên Desktop (1440px+), Tablet (768px-1024px), Mobile (375px-480px).
- Tất cả chức năng tương tác (chọn cơ sở cập nhật bản đồ, chuyển tab form, menu mobile, scroll mượt) chạy độc lập không phụ thuộc backend.

---

### Task 1: Tối Ưu Hóa Tài Nguyên Ảnh Thực Tế & Thiết Lập Cấu Trúc Thư Mục

**Files:**
- Create: `scripts/optimize-images.ps1`
- Produces: `assets/img/*.jpg`, `assets/css/styles.css`, `assets/js/main.js`

**Interfaces:**
- Consumes: `image/*.JPG`, `image/*.jpg`, `logo/*.png`
- Produces: Web-ready optimized images in `assets/img/` with high visual quality and < 400KB size.

- [ ] **Step 1: Viết script PowerShell tối ưu hóa toàn bộ ảnh thực tế**
Tạo script `scripts/optimize-images.ps1` duyệt qua các file trong `image/` và resize về max-width 1600px với JPEG quality 85%, lưu vào `assets/img/`.

- [ ] **Step 2: Thực thi script tối ưu hóa ảnh**
Chạy: `powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1`  
Kiểm tra: Thư mục `assets/img/` được tạo với các file tối ưu kích thước hợp lý (< 500KB).

- [ ] **Step 3: Commit tài nguyên ban đầu**
```bash
git add assets/ scripts/
git commit -m "feat(assets): optimize real project images for web performance"
```

---

### Task 2: Xây Dựng Khung Giao Diện, Header & Khối 1 (Tổng Quát Thương Hiệu)

**Files:**
- Create: `index.html` (Phần Header, Topbar, Hero và Section 1)
- Modify: `assets/css/styles.css`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: `assets/img/student.jpg`, `assets/img/teaching1.jpg`, `assets/img/campus1.jpg`, `logo/logo1.png`, `logo/LOGO PRINCETON PNG-01.png`
- Produces: Responsive Header, Sticky Topbar, Hero Section, và Khối 1 Về chúng tôi (Triết lý 3 Trụ cột Healthy Body - Bright Mind - Happy Heart).

- [ ] **Step 1: Xây dựng cấu trúc HTML5 chuẩn với Tailwind CSS và Google Fonts**
Thiết lập thẻ meta, font `Be Vietnam Pro` & `Merriweather`, cấu hình Tailwind màu thương hiệu Princeton.

- [ ] **Step 2: Triển khai Header & Sticky Topbar**
Logo Princeton ngang, thanh menu điều hướng 6 mục, hotline `0988.284.799`, nút chuyển nhanh Đăng ký, menu mobile toggle.

- [ ] **Step 3: Triển khai Hero Section & Khối 1 (Về chúng tôi & 03 Trụ Cột)**
Tiêu đề *"MỘT TUỔI THƠ VỮNG CHÃI CHO CẢ CUỘC ĐỜI"*, quote cảm xúc, 2 ảnh nghệ thuật lồng ghép (`student.jpg`, `teaching1.jpg`), 03 Trụ cột *Healthy Body, Bright Mind, Happy Heart* dạng infographic, thanh huy hiệu thống kê (6+ Năm, 10 Cơ sở, 1000+ Học sinh).

- [ ] **Step 4: Kiểm tra hiển thị cục bộ trên trình duyệt**
Mở file `index.html` và xác minh bố cục, màu sắc, font chữ và hình ảnh hiển thị sắc nét.

- [ ] **Step 5: Commit**
```bash
git add index.html assets/css/styles.css assets/js/main.js
git commit -m "feat: implement header, hero section and brand overview with 3 pillars"
```

---

### Task 3: Triển Khai Mục 2 (Chương Trình Học ECT & PEAK Framework Infographic)

**Files:**
- Modify: `index.html`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `assets/img/teaching2.jpg`, `assets/img/teaching3.jpg`
- Produces: Infographic 4 thẻ PEAK Framework và Bento grid 5 môn học cốt lõi ECT.

- [ ] **Step 1: Xây dựng Khung Phương Pháp PEAK Learning Framework™**
4 thẻ tương tác: *P - Purposeful Play, E - Experiential Learning, A - Active Thinking (mô hình WAT), K - Kinesthetic Learning* với icon trực quan và giải nghĩa chi tiết.

- [ ] **Step 2: Xây dựng Chương Trình Tư Duy Phản Biện Sớm ECT (Early Critical Thinker)**
5 thẻ môn học cốt lõi: *ELA, Math, Science/STEM, Character Building, Arts & Crafts* với nhãn cấp học, ảnh lớp học thực tế và hiệu ứng hover sang trọng.

- [ ] **Step 3: Kiểm tra hiển thị và responsive**
Đảm bảo trên Mobile hiển thị dạng danh sách thẻ cuộn mượt mà, trên Desktop hiển thị grid cân đối.

- [ ] **Step 4: Commit**
```bash
git add index.html assets/css/styles.css
git commit -m "feat: implement PEAK framework and ECT early critical thinker infographic"
```

---

### Task 4: Triển Khai Mục 3 (Đối Tác Nói Gì) & Mục 4 (05 Đặc Quyền Chuyển Giao)

**Files:**
- Modify: `index.html`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: `assets/img/partner.jpg`, `assets/img/teachers.jpg`, `assets/img/campus2.jpg`
- Produces: Carousel/Grid đánh giá đối tác và Infographic 05 đặc quyền hợp tác chiến lược nhượng quyền.

- [ ] **Step 1: Triển khai Khối 3 (Đối tác nói gì về chúng tôi)**
Khung thẻ nhận xét sang trọng với đánh giá 5 sao, avatar đối tác, tên và chức vụ đại diện cơ sở, ghi chú mã nguồn rõ ràng để cập nhật nội dung chính thức bất cứ lúc nào.

- [ ] **Step 2: Triển khai Khối 4 (Đối tác nhận gì khi hợp tác chiến lược cùng Princeton)**
Tiêu đề *"BẠN LÀM CHỦ NGÔI TRƯỜNG. PRINCETON MANG ĐẾN HỆ THỐNG ĐỂ CÙNG PHÁT TRIỂN"*. 05 Đặc quyền chuyển giao dạng Infographic tiến trình: *Brand & Identity, Curriculum & PEAK, Teacher Academy, 360° Operations & Marketing, Quality Assurance*.

- [ ] **Step 3: Tích hợp hình ảnh thực tế đối tác**
Lồng ghép ảnh ký kết đối tác `partner.jpg` và ảnh đào tạo giáo viên `teachers.jpg`.

- [ ] **Step 4: Commit**
```bash
git add index.html assets/js/main.js
git commit -m "feat: add partner testimonials and franchise strategic privileges infographic"
```

---

### Task 5: Triển Khai Mục 5 & 6 (Hệ Thống 10 Cơ Sở, Google Maps Động & Form Đăng Ký 2 Tab)

**Files:**
- Modify: `index.html`
- Modify: `assets/js/main.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: Danh sách 10 địa chỉ cơ sở toàn quốc.
- Produces: Bộ chọn cơ sở liên kết Google Maps tương tác và Form đăng ký 2 Tab có xác thực dữ liệu.

- [ ] **Step 1: Triển khai danh sách 10 cơ sở kèm icon định vị**
Danh sách các cơ sở tại Hải Phòng (3), Đà Nẵng (3), Hà Nội (1), Hưng Yên (1), TP.HCM (2) dạng thẻ chọn active.

- [ ] **Step 2: Tích hợp Google Maps iframe động tương tác**
Viết hàm JS `selectCampus(index)` cập nhật vị trí Google Maps tương ứng với cơ sở được bấm chọn.

- [ ] **Step 3: Triển khai Form Đăng Ký 2 Tab**
Tab 1: *Dành cho Phụ Huynh* (Đăng ký tham quan/tư vấn).  
Tab 2: *Dành cho Đối Tác & Nhà Đầu Tư* (Đăng ký hợp tác nhượng quyền).  
Tự động đồng bộ cơ sở đang chọn vào trường `select` của form.

- [ ] **Step 4: Viết bộ kiểm tra dữ liệu Form và Modal thông báo thành công**
Validate SĐT (10 số), email hợp lệ; hiển thị Toast / Modal cảm ơn sang trọng khi gửi form thành công.

- [ ] **Step 5: Commit**
```bash
git add index.html assets/js/main.js assets/css/styles.css
git commit -m "feat: implement 10 campuses interactive map switcher and 2-tab registration form"
```

---

### Task 6: Triển Khai Mục 7 (Chân Trang), Floating Widgets & Kiểm Thử Toàn Diện

**Files:**
- Modify: `index.html`
- Modify: `assets/css/styles.css`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: Toàn bộ thành phần trang web.
- Produces: Hoàn thiện Footer, Hotline Floating Pill, Zalo/Messenger quick chat, Scroll-to-top, kiểm tra trên các kích thước màn hình.

- [ ] **Step 1: Triển khai Footer chuẩn thương hiệu Princeton**
Nền bordeaux sâu `#46080F`, logo trắng kim, slogan *The Princeton Way*, hotline `0988.284.799`, email `princetonvietnam@gmail.com`, website `https://princetonacademy.vn/`.

- [ ] **Step 2: Triển khai Floating Contact Widgets**
Nút gọi nhanh hotline góc màn hình, nút chat tư vấn Zalo, nút Back-to-top mượt mà.

- [ ] **Step 3: Kiểm thử toàn diện trên trình duyệt (Browser Test)**
Khởi chạy live server hoặc mở file kiểm tra:
1. Độ sắc nét và tốc độ tải ảnh.
2. Bản đồ chuyển đổi đúng 10 cơ sở.
3. Form chuyển tab mượt mà và validate hoạt động tốt.
4. Mobile menu mở đóng chuẩn.
5. Kiểm tra tính toàn vẹn của nội dung theo yêu cầu người dùng.

- [ ] **Step 4: Commit hoàn thiện**
```bash
git add .
git commit -m "feat: complete Princeton Academy landing page with footer, widgets, and verified interactivity"
```
