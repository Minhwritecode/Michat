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
   - `FRONTEND_URL`: URL của frontend (sau khi deploy)

2. **Build Command:**
   ```
   cd Backend && npm install
   ```

3. **Start Command:**
   ```
   cd Backend && npm start
   ```

### API Endpoints:

- **Health Check:** `GET /health`
- **Root:** `GET /`
- **Auth:** `POST /api/auth/signup`, `POST /api/auth/login`
- **Messages:** `GET /api/messages/:id`, `POST /api/messages/send/:id`
- **Groups:** `GET /api/groups`, `POST /api/groups/create`
- **Stories:** `GET /api/story`, `POST /api/story/create`
- **Polls:** `GET /api/polls/:groupId`, `POST /api/polls/create`
- **Location:** `POST /api/location/share`, `GET /api/location/history`
- **Trello:** `GET /api/trello/boards`, `POST /api/trello/card`

### Features:

- ✅ Real-time messaging với Socket.IO
- ✅ Authentication với JWT
- ✅ File upload với Cloudinary
- ✅ Rate limiting
- ✅ Security headers với Helmet
- ✅ CORS configuration
- ✅ Error handling
- ✅ Health check endpoint
- ✅ MongoDB integration

### Lưu ý:
- Sử dụng Node.js version 18+ 
- Đảm bảo tất cả environment variables đã được cấu hình
- Kiểm tra MongoDB connection
- Logs sẽ hiển thị thông tin chi tiết với emoji 