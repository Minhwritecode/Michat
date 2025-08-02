# Michat Frontend

## Deployment trên Render

### Các bước cần thiết:

1. **Tạo Static Site trên Render:**
   - Chọn "Static Site" khi tạo service mới
   - Connect với GitHub repository

2. **Cấu hình Build Settings:**
   - **Build Command:** `cd Frontend && npm install && npm run build`
   - **Publish Directory:** `Frontend/dist`

3. **Cấu hình Environment Variables:**
   - `VITE_API_URL`: URL của backend (ví dụ: https://michat-backend.onrender.com)

### Lưu ý:
- Deploy Backend trước, sau đó deploy Frontend
- CSP meta tag đã được thêm để fix lỗi blob và data URLs
- Đảm bảo Backend URL đúng trong environment variables
