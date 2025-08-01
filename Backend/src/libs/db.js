import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Thoát ứng dụng nếu kết nối thất bại
    }
};

// Xử lý đóng kết nối khi ứng dụng tắt
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});