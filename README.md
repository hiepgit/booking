### Booking Healthcare

Một hệ thống đặt lịch khám bệnh theo mô hình monorepo (Yarn Workspaces).

### Tính năng chính
- **Người dùng**: Đăng ký/đăng nhập (Bệnh nhân/Bác sĩ/Admin), OTP, quản lý hồ sơ, đổi/quen mật khẩu
- **Bệnh nhân**: Tìm bác sĩ theo chuyên khoa/địa điểm/đánh giá, xem lịch trống, đặt lịch (trực tiếp/online), quản lý lịch, thanh toán (VNPay/MoMo), hồ sơ sức khỏe, đơn thuốc/kết quả xét nghiệm
- **Bác sĩ**: Quản lý lịch làm việc, xem danh sách bệnh nhân, ghi kết quả khám, kê đơn, video call (telemedicine)
- **Admin**: Quản lý người dùng/chuyên khoa/phòng khám, thống kê, phản hồi/feedback, nội dung
- **Bổ sung**: Thông báo, chat/tư vấn, đánh giá, tìm kiếm nâng cao, chỉ đường, xuất PDF

### Kiến trúc & công nghệ
- **Monorepo**: Yarn Workspaces (`packages/*`)
- **Packages**:
  - `packages/backend`: Node.js, Express, TypeScript, Prisma, PostgreSQL
  - `packages/mobile`: (React Native - khởi tạo sau)
  - `packages/shared`: Thư viện dùng chung (TypeScript)
- **Hạ tầng**: PostgreSQL qua `docker-compose.yml`

### Bắt đầu nhanh
1) Cài đặt phụ thuộc
```bash
yarn
```

2) Khởi động PostgreSQL
```bash
docker compose up -d
```

3) Thiết lập môi trường Backend
Tạo file `packages/backend/.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_db"
```

4) Prisma migrate/generate và seed (tùy chọn)
```bash
cd packages/backend
yarn prisma generate
yarn prisma migrate dev
yarn db:seed
```

5) Chạy Backend (dev)
```bash
# từ thư mục gốc
yarn dev:backend

# hoặc trong backend
cd packages/backend && yarn dev
```

### Scripts hữu ích (gốc repo)
- `yarn dev:backend`: chạy backend ở chế độ watch
- `yarn build:all`: build tất cả workspace
- `yarn test:all`: chạy test tất cả workspace
- `yarn lint:all`: lint tất cả workspace
- `yarn clean`: dọn dẹp build outputs

### Ghi chú
- Mặc định Prisma kết nối PostgreSQL theo `docker-compose.yml`. Điều chỉnh `DATABASE_URL` nếu cần.
- Mobile/Realtime/Thanh toán sẽ được tích hợp dần theo yêu cầu.
