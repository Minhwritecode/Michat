# Michat Deployment Guide

## Backend Deployment trên Render

### Các bước cần thiết:

1. **Cấu hình Environment Variables trên Render:**
   - `NODE_ENV`: production
   - `PORT`: 10000 (hoặc port mà Render cung cấp)

2. **Build Command:**
   ```
   cd Backend && npm install
   ```

3. **Start Command:**
   ```
   cd Backend && npm start
   ```

### Các thay đổi đã thực hiện:

1. **Downgrade Express** xuống version 4.18.2 (ổn định hơn)
2. **Cập nhật tất cả dependencies** xuống version ổn định
3. **Tạo file test.js** đơn giản để test trước
4. **Đơn giản hóa cấu hình** render.yaml
5. **Xóa package-lock.json** để cài đặt lại sạch

### Test Deployment:

1. **Deploy với file test.js trước** để đảm bảo Express hoạt động
2. **Nếu test.js hoạt động**, thay đổi start script về `node src/index.js`
3. **Thêm các environment variables** cần thiết cho production

### Lưu ý:
- Sử dụng Node.js version 18+ 
- Đảm bảo tất cả dependencies đã được cài đặt đúng
- Test với file đơn giản trước khi deploy full application 