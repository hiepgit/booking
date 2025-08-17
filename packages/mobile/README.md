# Mobile App - Healthcare Booking

## 📱 Test bằng Expo Go trên Android (không cần Android SDK)

> **💡 Lý do**: Lệnh `yarn workspace mobile android` cần Android SDK (dành cho emulator). Với Expo Go trên điện thoại thật, bạn chỉ cần chạy "start" và quét QR.

## 🚀 Workflow đề xuất (ổn định trên WSL2)

### Bước 1: Khởi động Backend
Mở terminal đầu tiên, đảm bảo backend đang chạy:
```bash
# Backend phải chạy ở http://localhost:3001
cd packages/backend
yarn dev
```

### Bước 2: Tạo Tunnel cho Backend
Để điện thoại truy cập được backend từ WSL2:
```bash
npx localtunnel@latest --port 3001
```
**Ghi lại URL public nhận được**, ví dụ: `https://abcde.loca.lt`

### Bước 3: Khởi động Mobile với Tunnel
Mở terminal khác, chạy Expo với API endpoint từ tunnel:
```bash
EXPO_PUBLIC_API_BASE=https://eighty-bats-talk.loca.lt yarn workspace mobile start --tunnel
```

### Bước 4: Kết nối Expo Go
1. Mở app **"Expo Go"** trên Android
2. Quét QR code từ terminal (hoặc từ giao diện web)
3. App sẽ tự động tải và chạy

## 🌐 Alternative: Không dùng Tunnel

Chỉ khi bạn rành mạng LAN/WSL2:
```bash
EXPO_PUBLIC_API_BASE=http://192.168.x.x:3001 yarn workspace mobile start --lan
```

> **⚠️ Lưu ý**: WSL2 NAT khiến điện thoại khó truy cập backend port 3001; tunnel là phương án dễ nhất.

## 🔧 Tips & Tricks

### Đồng bộ phiên bản để giảm warning:
```bash
yarn workspace mobile add expo-secure-store@~14.2.3
```

### Mẹo test nhanh (không cần điện thoại):
```bash
EXPO_PUBLIC_API_BASE=http://localhost:3001 yarn workspace mobile web
```

## 🚨 Troubleshooting

- **Backend không accessible**: Dùng tunnel thay vì direct IP
- **QR code không quét được**: Thử refresh terminal hoặc web interface
- **App crash khi load**: Kiểm tra backend có response không tại tunnel URL