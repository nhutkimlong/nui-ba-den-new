# 🎯 Hệ thống QR Code với thời gian hết hạn 12 giờ

## 📋 Tổng quan

Hệ thống này cho phép tạo QR code trỏ đến trang `/pages/climb.html` với thời gian hiệu lực 12 giờ. Sau 12 giờ, link sẽ tự động vô hiệu hóa.

## 🏗️ Kiến trúc hệ thống

```
QR Code → /go → Function go.js → /v/[encoded-timestamp] → Function verify.js → Nội dung hoặc thông báo hết hạn
```

## 📁 Cấu trúc files

### Functions
- `netlify/functions/go.js` - Tạo timestamp và redirect
- `netlify/functions/verify.js` - Xác thực thời gian và hiển thị nội dung

### Configuration
- `netlify.toml` - Cấu hình redirect rules
- `package.json` - Dependencies (node-fetch@2)

### Test
- `qr-test.html` - Trang test hệ thống

## 🚀 Cách sử dụng

### 1. Tạo QR Code
Sử dụng URL sau để tạo QR code:
```
https://nuibaden.netlify.app/go
```

### 2. Quy trình hoạt động
1. **Quét QR code** → truy cập `/go`
2. **Function go.js** tạo timestamp và redirect đến `/v/[encoded-timestamp]`
3. **Function verify.js** kiểm tra thời gian:
   - Nếu < 12 giờ: hiển thị trang `climb.html`
   - Nếu ≥ 12 giờ: hiển thị thông báo hết hiệu lực

### 3. Test hệ thống
Truy cập `qr-test.html` để test các chức năng:
- Test QR code link
- Test trang gốc
- Xem thông tin hệ thống

## ⚙️ Cấu hình

### Thay đổi thời gian hết hạn
Trong file `netlify/functions/verify.js`, thay đổi:
```javascript
const EXPIRATION_TIME_MS = 12 * 60 * 60 * 1000; // 12 giờ
```

### Thay đổi trang đích
Trong file `netlify/functions/verify.js`, thay đổi:
```javascript
const targetUrl = "https://nuibaden.netlify.app/pages/climb.html";
```

## 🔧 Deploy

1. Commit tất cả thay đổi
2. Push lên repository
3. Netlify sẽ tự động deploy
4. Test tại `https://nuibaden.netlify.app/qr-test.html`

## 📊 Monitoring

### Logs
- Kiểm tra Netlify Function logs trong Netlify Dashboard
- Functions: `go` và `verify`

### Status Codes
- `200` - Thành công, hiển thị nội dung
- `302` - Redirect từ `/go`
- `410` - Link hết hiệu lực
- `400` - URL không hợp lệ

## 🛡️ Bảo mật

- Timestamp được mã hóa Base64
- Không lưu trữ thông tin trong database
- Mỗi lần quét tạo URL khác nhau
- Khó đoán được cấu trúc URL

## 🐛 Troubleshooting

### Lỗi thường gặp
1. **Function không hoạt động**: Kiểm tra `netlify.toml` redirect rules
2. **Link hết hạn sớm**: Kiểm tra `EXPIRATION_TIME_MS`
3. **Trang không hiển thị**: Kiểm tra `targetUrl` trong verify.js

### Debug
1. Kiểm tra Netlify Function logs
2. Test từng function riêng lẻ
3. Sử dụng `qr-test.html` để debug

## 📝 Ghi chú

- Hệ thống không cần database
- Tự động hết hạn sau 12 giờ
- Responsive design cho mobile
- SEO friendly với proper meta tags
