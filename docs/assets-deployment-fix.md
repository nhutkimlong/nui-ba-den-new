# Fix: Assets không hiển thị khi deploy lên Netlify

## Vấn đề
Khi deploy lên Netlify, các hình ảnh trong thư mục `assets/` không hiển thị được, mặc dù chạy local thì bình thường.

## Nguyên nhân
- Vite chỉ copy các file được import trực tiếp hoặc nằm trong thư mục `public/`
- Thư mục `assets/` ở root không được Vite xử lý tự động
- Khi build, các file trong `assets/` không được copy vào `dist/`

## Giải pháp đã áp dụng

### 1. Di chuyển assets vào public/
```bash
# Tạo thư mục public
mkdir public

# Copy assets vào public
xcopy assets public\assets /E /I
```

### 2. Cập nhật cấu hình Vite
Thêm `copyPublicDir: true` vào `vite.config.ts`:
```typescript
build: {
  outDir: 'dist',
  copyPublicDir: true, // Đảm bảo public directory được copy
  // ... other config
}
```

### 3. Tự động hóa với script
Tạo script `scripts/sync-assets.js` để tự động đồng bộ assets trước khi build.

Cập nhật `package.json`:
```json
{
  "scripts": {
    "build": "node scripts/sync-assets.js && vite build"
  }
}
```

## Cách sử dụng

### Build thủ công
```bash
# Đồng bộ assets trước
node scripts/sync-assets.js

# Build
npm run build
```

### Build tự động
```bash
# Script sẽ tự động đồng bộ assets trước khi build
npm run build
```

## Kết quả
- ✅ Assets được copy vào `dist/assets/`
- ✅ Hình ảnh hiển thị đúng trên Netlify
- ✅ Tự động hóa quá trình build
- ✅ Không cần thay đổi code hiện tại

## Lưu ý
- Thư mục `public/` sẽ chứa bản copy của `assets/`
- Khi thêm hình ảnh mới vào `assets/`, chạy lại script sync
- Script tự động detect OS (Windows/Unix) để sử dụng lệnh copy phù hợp
