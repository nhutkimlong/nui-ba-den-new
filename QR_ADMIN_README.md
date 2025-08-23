# 🎛️ Cài đặt QR Code trong Admin Panel

## 📋 Tổng quan

Tính năng này cho phép admin điều chỉnh thời gian hiệu lực và trang đích của QR code trực tiếp từ giao diện web mà không cần sửa code.

## 🚀 Cách sử dụng

### 1. Truy cập Admin Panel
- Đăng nhập vào admin panel: `/pages/admin-login.html`
- Vào trang quản lý leo núi: `/pages/admin/climb/index.html`

### 2. Tìm section "Cài đặt QR Code"
- Scroll xuống phần "Cài đặt QR Code" (có icon QR code)
- Section này nằm sau phần "Cài đặt GPS"

### 3. Cài đặt thời gian hiệu lực
- **Thời gian hiệu lực (giờ)**: Nhập số giờ từ 1-168 (tối đa 1 tuần)
- **Trang đích**: URL trang sẽ hiển thị khi quét QR code
- Nhấn "Lưu cài đặt" để áp dụng

### 4. Xem thông tin hiện tại
- **URL QR Code**: `https://nuibaden.netlify.app/go`
- **Thời gian hiệu lực hiện tại**: Hiển thị số giờ đã cài đặt
- **Trang đích hiện tại**: URL trang đích
- **Cập nhật lần cuối**: Thời gian cài đặt gần nhất

## ⚙️ Cấu hình

### Thời gian hiệu lực
- **Tối thiểu**: 1 giờ
- **Tối đa**: 168 giờ (1 tuần)
- **Mặc định**: 12 giờ

### Trang đích
- Phải là URL hợp lệ (bắt đầu bằng `http://` hoặc `https://`)
- Mặc định: `https://nuibaden.netlify.app/pages/climb.html`

## 🔧 Kiến trúc kỹ thuật

### Files được tạo/sửa đổi:

#### 1. **Function được cập nhật**
- `netlify/functions/combined-data.mjs` - Tích hợp QR settings vào API chung

#### 2. **Function được cập nhật**
- `netlify/functions/verify.js` - Sử dụng cài đặt từ Blobs

#### 3. **Frontend được cập nhật**
- `pages/admin/climb/index.html` - Thêm section cài đặt QR
- `pages/admin/climb/script.js` - Thêm JavaScript xử lý

#### 4. **Cấu hình**
- `netlify.toml` - Thêm redirect cho API

### Lưu trữ dữ liệu
- Sử dụng **Netlify Blobs** để lưu cài đặt
- Store name: `qr-settings`
- Key: `settings`
- Format: JSON

### API Endpoints
- **GET** `/.netlify/functions/combined-data` - Lấy tất cả dữ liệu (notifications, GPS settings, QR settings)
- **POST** `/.netlify/functions/combined-data` với action `updateQrSettings` - Cập nhật cài đặt QR

## 📊 Dữ liệu lưu trữ

```json
{
  "expirationHours": 12,
  "targetUrl": "https://nuibaden.netlify.app/pages/climb.html",
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Quy trình hoạt động

1. **Admin thay đổi cài đặt** → Form submit
2. **Combined API nhận request** → Validate dữ liệu
3. **Lưu vào Blobs** → Cập nhật timestamp
4. **Function verify.js** → Đọc cài đặt từ Blobs
5. **QR code hoạt động** → Sử dụng cài đặt mới

## ⚡ Tối ưu hóa hiệu suất

- **Giảm số lần gọi API**: Tất cả dữ liệu được load trong 1 request
- **Cache localStorage**: Dữ liệu được cache để tải nhanh hơn
- **Combined function**: Giảm cold start time
- **Parallel loading**: Tất cả dữ liệu được load song song

## 🛡️ Bảo mật

- **Validation**: Kiểm tra thời gian (1-168 giờ)
- **URL validation**: Đảm bảo URL hợp lệ
- **Admin authentication**: Chỉ admin mới truy cập được
- **CORS**: Cấu hình cho API calls

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **"Không thể tải cài đặt QR"**
   - Kiểm tra kết nối mạng
   - Kiểm tra function logs trong Netlify Dashboard

2. **"Thời gian hiệu lực không hợp lệ"**
   - Đảm bảo nhập số từ 1-168
   - Không để trống trường này

3. **"URL trang đích không hợp lệ"**
   - URL phải bắt đầu bằng `http://` hoặc `https://`
   - Không để trống trường này

### Debug:
1. Mở Developer Tools (F12)
2. Kiểm tra Console tab
3. Kiểm tra Network tab khi submit form
4. Xem logs trong Netlify Function logs

## 📝 Ghi chú

- Cài đặt được áp dụng ngay lập tức
- QR code cũ vẫn hoạt động theo thời gian cũ
- QR code mới sẽ sử dụng cài đặt mới
- Không cần restart server
- Dữ liệu được backup tự động bởi Netlify Blobs
