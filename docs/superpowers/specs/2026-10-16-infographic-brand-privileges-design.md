# 05 Đặc Quyền Chuyển Giao Toàn Diện - Infographic Brand Cards Design

## Mục Tiêu
Nâng cấp khu vực 05 thẻ đặc quyền chuyển giao (dòng 852 - 940 trong `index.html`) từ dạng text-only thành hệ thống thẻ Infographic cao cấp kết hợp hình ảnh thực tế thương hiệu (`brand1.webp` đến `brand5.jpg`).

## Bố Cục & Thành Phần

### 1. Infographic Pipeline (Thanh tiến trình 5 bước khép kín)
Thanh kết nối quy trình chuyển giao toàn diện:
- Bước 01: Nhận diện Thương hiệu
- Bước 02: Chuyển giao Giáo trình
- Bước 03: Đào tạo Nhân sự
- Bước 04: Vận hành & Tuyển sinh
- Bước 05: Giám sát Chất lượng

### 2. Chi Tiết 5 Thẻ Infographic
- **Grid Layout**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5`
- **Khung thẻ**: Nền trắng, viền mảnh `#E8E2D5`, đổ bóng `shadow-sm hover:shadow-xl transition-all duration-300`, đường viền nóc xen kẽ Đỏ `#8C1823` & Vàng đồng `#C89D35`.
- **Khu vực ảnh (`h-44`)**:
  - Tỉ lệ khung hình đồng nhất, hiệu ứng zoom `group-hover:scale-105 duration-500`.
  - Badge số thứ tự dập nổi góc trên bên trái (`01` đến `05`).
  - Dải gradient đổ bóng tối nhẹ phía chân ảnh giúp tăng tương phản.
- **Nội dung thẻ**:
  - `Đặc Quyền 01 - Brand & Identity`: Ảnh `assets/img/brand1.webp`, Tag `BẢO TRỢ DANH TIẾNG`
  - `Đặc Quyền 02 - Curriculum & PEAK`: Ảnh `assets/img/brand2.webp`, Tag `GIÁO TRÌNH BẢN QUYỀN`
  - `Đặc Quyền 03 - Teacher Academy`: Ảnh `assets/img/brand3.jpg`, Tag `CHUẨN HÓA NHÂN SỰ`
  - `Đặc Quyền 04 - 360° Ops & Marketing`: Ảnh `assets/img/brand4.jpg`, Tag `TỐI ƯU VẬN HÀNH`
  - `Đặc Quyền 05 - Quality Assurance`: Ảnh `assets/img/brand5.jpg`, Tag `TIÊU CHUẨN VÀNG LÂU DÀI`
