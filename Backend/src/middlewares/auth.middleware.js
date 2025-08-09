import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Story from "../models/story.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Middleware kiểm tra quyền truy cập story
export const checkStoryPermission = async (req, res, next) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        // Validate storyId
        if (!mongoose.Types.ObjectId.isValid(storyId)) {
            return res.status(400).json({ message: "ID story không hợp lệ" });
        }

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Không tìm thấy story" });
        }

        // Kiểm tra quyền theo loại hành động
        const action = req.method;
        let hasPermission = false;

        // DELETE/PUT - Chỉ owner mới được thực hiện
        if (['DELETE', 'PUT'].includes(action)) {
            hasPermission = story.userId.equals(userId);
        }
        // GET - Ai cũng xem được nếu là public hoặc bạn bè
        else if (action === 'GET') {
            if (story.privacy === 'public') {
                hasPermission = true;
            } else if (story.privacy === 'friends') {
                const user = await User.findById(userId);
                hasPermission = user.friends.includes(story.userId);
            } else {
                hasPermission = story.userId.equals(userId);
            }
        }
        // POST (reaction/reply) - Ai cũng được nếu story còn active
        else if (action === 'POST') {
            hasPermission = new Date(story.expiredAt) > new Date();
        }

        if (!hasPermission) {
            return res.status(403).json({
                message: "Bạn không có quyền thực hiện hành động này"
            });
        }

        // Lưu story vào request để sử dụng trong controller
        req.story = story;
        next();
    } catch (error) {
        console.error("Error in checkStoryPermission middleware:", error);
        res.status(500).json({ message: "Lỗi kiểm tra quyền truy cập story" });
    }
};

// Middleware kiểm tra quyền admin
export const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: "Truy cập bị từ chối. Yêu cầu quyền admin"
            });
        }
        next();
    } catch (error) {
        console.error("Error in adminMiddleware:", error);
        res.status(500).json({ message: "Lỗi kiểm tra quyền admin" });
    }
};

// Middleware kiểm tra bạn bè
export const checkFriendship = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID người dùng không hợp lệ" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const isFriend = currentUser.friends.includes(userId) &&
            user.friends.includes(currentUser._id);

        if (!isFriend) {
            return res.status(403).json({
                message: "Chỉ có thể thực hiện với bạn bè"
            });
        }

        req.targetUser = user;
        next();
    } catch (error) {
        console.error("Error in checkFriendship middleware:", error);
        res.status(500).json({ message: "Lỗi kiểm tra mối quan hệ bạn bè" });
    }
};