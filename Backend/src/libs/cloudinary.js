import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm upload ảnh lên Cloudinary
export const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            resource_type: "auto" // Tự động phát hiện loại file (ảnh/video)
        });
        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload file to Cloudinary");
    }
};

// Hàm xóa ảnh từ Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error("Failed to delete file from Cloudinary");
    }
};

// Export cả cloudinary object nếu cần sử dụng trực tiếp
export default cloudinary;