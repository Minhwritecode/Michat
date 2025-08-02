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
   - `FRONTEND_URL`: URL của frontend (sau khi deploy)

2. **Build Command:**
   ```
   cd Backend && npm install
   ```

3. **Start Command:**
   ```
   cd Backend && npm start
   ```

### Các thay đổi đã thực hiện:

1. **Cải thiện logging** với emoji và thông tin chi tiết
2. **Thêm health check endpoint** tại `/health`
3. **Thêm root route** tại `/` để test API
4. **Thêm favicon route** để fix lỗi 404 favicon
5. **Thêm 404 handler** cho routes không tồn tại
6. **Cải thiện error handling** với stack trace trong development
7. **Cấu hình FRONTEND_URL** trong render.yaml
8. **Log environment variables** để debug

### Kiểm tra deployment:

1. **Health check:** `https://your-backend.onrender.com/health`
2. **Root endpoint:** `https://your-backend.onrender.com/`
3. **API endpoints:** `https://your-backend.onrender.com/api/auth`

### Debug Environment Variables:

Logs sẽ hiển thị:
- NODE_ENV
- PORT  
- FRONTEND_URL

Nếu FRONTEND_URL vẫn là localhost, hãy kiểm tra:
1. Environment variables trong Render dashboard
2. Cấu hình trong render.yaml
3. Redeploy sau khi thay đổi environment variables

### Lưu ý:
- Sử dụng Node.js version 18+ 
- Đảm bảo tất cả environment variables đã được cấu hình
- Kiểm tra MongoDB connection
- Deploy Backend trước, sau đó deploy Frontend
- Logs sẽ hiển thị thông tin chi tiết hơn
- Favicon 404 error đã được fix 