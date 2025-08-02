# Michat Backend

## Deployment trên Render

### Các bước cần thiết:

1. **Cấu hình Environment Variables trên Render:**
   - `NODE_ENV`: production
   - `PORT`: 10000 (hoặc port mà Render cung cấp)
   - `MONGODB_URI`: URI của MongoDB database
   - `JWT_SECRET`: Secret key cho JWT
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `FRONTEND_URL`: URL của frontend (ví dụ: https://your-frontend.onrender.com)
   - `GOOGLE_API_KEY`: Google API key
   - `GOOGLE_CLIENT_ID`: Google Client ID
   - `TRELLO_API_KEY`: Trello API key
   - `TRELLO_TOKEN`: Trello token
   - `DROPBOX_APP_KEY`: Dropbox app key
   - `DROPBOX_APP_SECRET`: Dropbox app secret

2. **Build Command:**
   ```
   npm install
   ```

3. **Start Command:**
   ```
   npm start
   ```

### Lưu ý:
- Đảm bảo tất cả dependencies đã được thêm vào `package.json`
- Sử dụng Node.js version 18+ 
- Cấu hình CORS đúng với frontend URL
- Đảm bảo MongoDB database đã được tạo và accessible 