### 3. LỰA CHỌN CÔNG NGHỆ

### 3.1. Kiến trúc tổng quan
- **Monorepo (Yarn Workspaces)**: `packages/backend`, `packages/web`, `packages/shared`, `packages/mobile` (tùy chọn).
- **Mục tiêu**: Nhanh, type-safe, dễ mở rộng, phù hợp demo học thuật và có thể triển khai thực tế sau.

### 3.2. Backend
- **Runtime/Framework**: Node.js 20 LTS + Express 5 + TypeScript strict.
- **Validation & Type-safety**: Zod cho mọi input/output; viết type guard cho middleware/handler (bắt buộc).
- **Auth**: JWT access ngắn hạn + refresh token qua HttpOnly cookie; CORS `origin: http://localhost:3001`, `credentials: true`.
- **Bảo mật**: `helmet`, rate limit, `bcrypt` cho password, sanitize input, audit log.
- **API docs**: Swagger (swagger-jsdoc + swagger-ui) cho endpoints chính.
- **Scheduler**: `node-cron` cho nhắc lịch email.
- **Dev UX**: `tsx` watch, `.env` với `dotenv`.

### 3.3. Frontend Web
- **Framework**: Next.js 14 (App Router, React 18), TypeScript.
- **UI**: Tailwind CSS + shadcn/ui (dựa trên Radix) cho các thành phần cơ bản (Button, Input, Card, Dialog, Tabs).
- **State/Data**: TanStack React Query; form với `react-hook-form` + Zod resolver; xử lý lỗi tập trung.
- **HTTP**: `axios` hoặc `fetch` có interceptor, quản lý cookie HttpOnly + refresh flow.
- **Port dev**: Web chạy `http://localhost:3001`.

### 3.4. Cơ sở dữ liệu & ORM
- **CSDL**: PostgreSQL 16 (Docker Compose).
- **ORM**: Prisma Client; migrate/schema versioning; seed dữ liệu mẫu.
- **Lý do**: Quan hệ phong phú (User-Doctor/Patient, Schedule, Appointment, Payment, Record) phù hợp hệ quản trị quan hệ + Prisma an toàn kiểu.

### 3.5. Tích hợp & Dịch vụ ngoài
- **Thanh toán**: VNPay (sandbox) là chính; phương án dự phòng `mark-paid` cho demo; MoMo cân nhắc giai đoạn sau.
- **Email**: Nodemailer (Ethereal/Gmail SMTP) gửi OTP/nhắc lịch.
- **Telemedicine**: Link Zoom/Google Meet nhúng (không tự xây WebRTC trong MVP).
- **Lưu trữ**: Cloudinary cho ảnh/file/PDF (đơn thuốc, kết quả xét nghiệm).

### 3.6. Bảo mật & Quy tắc
- **Cookie**: Refresh token ở HttpOnly cookie, `SameSite=Lax`, `Secure` khi HTTPS, có `Path=/auth/refresh` riêng.
- **CORS**: Backend chấp nhận `http://localhost:3001`, bật `credentials`.
- **RBAC**: Guard theo vai trò (Patient/Doctor/Admin) bằng type guard.
- **Mã hóa**: `bcrypt` cho mật khẩu; không lưu trữ thông tin thẻ.
- **Logging/Audit**: Ghi audit cho hành động quan trọng (đặt/hủy/dời, thanh toán).

### 3.7. Kiểm thử
- **Unit**: Vitest/Jest cho services/guards.
- **API**: Supertest cho một số flow chính (đăng ký/OTP/login, đặt lịch, chống trùng, thanh toán callback giả lập).
- **E2E (tùy chọn)**: Playwright/Cypress cho kịch bản đặt lịch hoàn chỉnh.

### 3.8. Môi trường phát triển
- **Docker Compose**: PostgreSQL 16, volume dữ liệu; healthcheck.
- **Env mẫu**: `packages/backend/.env.example` (DATABASE_URL, SMTP, VNPAY_*). Dev chạy backend 3000, web 3001.

### 3.9. Phương án thay thế & lý do chọn
- **Express vs NestJS**: Chọn Express để nhẹ, linh hoạt, phù hợp tiến độ; có thể nâng cấp lên NestJS sau.
- **PostgreSQL vs MySQL**: Chọn Postgres cho JSONB, constraint mạnh, decimal chuẩn cho thanh toán.
- **Next.js vs CRA/Vite**: Chọn Next.js 14 để tận dụng App Router, RSC, SEO, file-based routing nhanh.
- **VNPay vs MoMo**: VNPay phổ biến, sandbox rõ ràng; có thể bổ sung MoMo khi cần.


