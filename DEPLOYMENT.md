# Michat Deployment Guide

## Backend Deployment trên Render

### Các bước cần thiết:

1. **Cấu hình Environment Variables trên Render:**
   - `NODE_ENV`: production
   - `PORT`: 10000 (hoặc port mà Render cung cấp)
   - `MONGODB_URI`: URI của MongoDB database
   - `JWT_SECRET`: Secret key cho JWT
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `FRONTEND_URL`: URL của frontend

2. **Build Command:**
   ```
   cd Backend && npm install
   ```

3. **Start Command:**
   ```
   cd Backend && npm start
   ```

## Frontend Deployment trên Render

### Các bước cần thiết:

1. **Cấu hình Environment Variables trên Render:**
   - `VITE_API_URL`: URL của backend (ví dụ: https://michat-backend.onrender.com)

2. **Build Command:**
   ```
   cd Frontend && npm install && npm run build
   ```

3. **Static Publish Path:**
   ```
   Frontend/dist
   ```

### Các thay đổi đã thực hiện:

1. **Sửa start script** trong `package.json` về `node src/index.js`
2. **Sửa socket.js** để không tạo app mới, chỉ tạo server
3. **Sửa index.js** để attach app vào server từ socket.js
4. **Thêm CSP headers** để fix lỗi Content Security Policy
5. **Cấu hình render.yaml** cho cả Frontend và Backend

### Lưu ý:
- Sử dụng Node.js version 18+ 
- Đảm bảo tất cả environment variables đã được cấu hình
- Kiểm tra MongoDB connection
- CSP headers đã được thêm để fix lỗi blob và data URLs 