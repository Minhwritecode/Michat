import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import StoryForward from "../models/storyForward.model.js";
import { uploadToCloudinary } from "../libs/cloudinary.js";
import Notification from "../models/notification.model.js";
import { getReceiverSocketId, getIO } from "../libs/socket.js";

// Tạo story mới
export const createStory = async (req, res) => {
    try {
        let { media, text, privacy = 'public' } = req.body;
        const userId = req.user._id;

        // Normalize media: allow base64 data URL or remote URL
        if (media && !/^https?:\/\//i.test(media)) {
            try {
                const uploaded = await uploadToCloudinary(media, "michat/stories");
                media = uploaded.secure_url;
            } catch (err) {
                console.error("Upload story media error:", err);
                return res.status(400).json({ message: "Không thể tải media lên" });
            }
        }

        const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        const story = await Story.create({
            userId,
            media,
            text,
            privacy,
            expiredAt
        });

        // Populate user info
        const populatedStory = await Story.findById(story._id)
            .populate('userId', 'fullName profilePic');

        // Notification: story created (public broadcast to all except the creator will also receive)
        try {
            const io = getIO();
            const payload = {
                type: 'story_created',
                title: `${populatedStory.userId.fullName} đăng story mới`,
                body: text?.slice(0, 60) || 'Story mới được đăng',
                link: '/'
            };
            io.emit('notification:new', payload);
            // Optionally persist for users on fetch; skipping massive writes
        } catch {}

        res.status(201).json(populatedStory);
    } catch (error) {
        console.error("Error creating story:", error);
        res.status(500).json({ message: "Lỗi tạo story" });
    }
};

// Lấy tất cả stories còn hiệu lực
export const getStories = async (req, res) => {
    try {
        const now = new Date();
        const userId = req.user._id;

        // Lấy stories public hoặc của bạn bè
        const stories = await Story.find({
            expiredAt: { $gt: now },
            $or: [
                { privacy: 'public' },
                {
                    privacy: 'friends',
                    userId: { $in: req.user.friends || [] }
                },
                { userId } // Story của chính user
            ]
        })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: -1 });

        res.json(stories);
    } catch (error) {
        console.error("Error getting stories:", error);
        res.status(500).json({ message: "Lỗi lấy stories" });
    }
};

// Lấy stories của user hiện tại
export const getMyStories = async (req, res) => {
    try {
        const userId = req.user._id;
        const stories = await Story.find({ userId })
            .populate('userId', 'fullName profilePic')
            .sort({ createdAt: -1 });
        res.json(stories);
    } catch (error) {
        console.error("Error getting user stories:", error);
        res.status(500).json({ message: "Lỗi lấy stories của bạn" });
    }
};

// Xóa story
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story không tồn tại" });
        }

        if (story.userId.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền xóa story này" });
        }

        // Xóa media từ Cloudinary nếu có
        if (story.media) {
            try {
                const publicId = story.media.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
                console.error("Error deleting media from Cloudinary:", cloudinaryError);
            }
        }

        await Story.findByIdAndDelete(storyId);
        res.json({ message: "Đã xóa story" });
    } catch (error) {
        console.error("Error deleting story:", error);
        res.status(500).json({ message: "Lỗi xóa story" });
    }
};

// Thả cảm xúc story
export const reactStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story không tồn tại" });
        }

        // Kiểm tra story đã hết hạn chưa
        if (new Date(story.expiredAt) < new Date()) {
            return res.status(400).json({ message: "Story đã hết hạn" });
        }

        // Xóa reaction cũ nếu có
        story.reactions = story.reactions.filter(r => r.userId.toString() !== userId);

        // Thêm reaction mới
        if (emoji) {
            story.reactions.push({ userId, emoji });
        }

        await story.save();

        // Populate user info trong reactions
        const populatedStory = await Story.findById(storyId)
            .populate('reactions.userId', 'fullName profilePic');

        res.json({
            message: emoji ? "Đã thả cảm xúc" : "Đã bỏ cảm xúc",
            reactions: populatedStory.reactions
        });
    } catch (error) {
        console.error("Error reacting to story:", error);
        res.status(500).json({ message: "Lỗi thả cảm xúc" });
    }
};

// Reply story
export const replyStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Nội dung reply không được để trống" });
        }

        const story = await Story.findById(storyId)
            .populate('userId', 'fullName profilePic');

        if (!story) {
            return res.status(404).json({ message: "Story không tồn tại" });
        }

        // Kiểm tra story đã hết hạn chưa
        if (new Date(story.expiredAt) < new Date()) {
            return res.status(400).json({ message: "Story đã hết hạn" });
        }

        // Thêm reply
        story.replies.push({ userId, text });
        await story.save();

        // (Optional) Thông báo có thể được thực hiện ở client bằng socket hoặc API riêng

        // Populate user info trong replies
        const populatedStory = await Story.findById(storyId)
            .populate('replies.userId', 'fullName profilePic');

        res.json({
            message: "Đã gửi reply",
            replies: populatedStory.replies
        });
    } catch (error) {
        console.error("Error replying to story:", error);
        res.status(500).json({ message: "Lỗi reply story" });
    }
};

// Forward story
export const forwardStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { targetType, targetId } = req.body;
        const senderId = req.user._id;

        // Validate target type
        if (!['user', 'group'].includes(targetType)) {
            return res.status(400).json({ message: "Loại đích không hợp lệ" });
        }

        const story = await Story.findById(storyId)
            .populate('userId', 'fullName profilePic');

        if (!story) {
            return res.status(404).json({ message: "Story không tồn tại" });
        }

        // Kiểm tra quyền chuyển tiếp
        if (story.privacy === 'private' && story.userId._id.toString() !== senderId) {
            return res.status(403).json({ message: "Bạn không có quyền chuyển tiếp story này" });
        }

        // Lưu thông tin chuyển tiếp
        const forwardRecord = new StoryForward({
            storyId,
            senderId,
            targetType,
            targetId,
            forwardedAt: new Date()
        });
        await forwardRecord.save();

        // Cập nhật số lần chuyển tiếp
        story.forwards += 1;
        await story.save();

        // (Optional) Việc gửi message kèm story được client xử lý sau khi gọi API này

        res.json({
            success: true,
            message: "Đã chuyển tiếp story"
        });
    } catch (error) {
        console.error("Error forwarding story:", error);
        res.status(500).json({ message: "Lỗi chuyển tiếp story" });
    }
};

// Lấy danh sách người đã xem story
export const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story không tồn tại" });
        }

        // Chỉ chủ story mới xem được danh sách người xem
        if (story.userId.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền xem danh sách này" });
        }

        // Populate thông tin người xem
        const viewers = await User.find({
            '_id': { $in: story.views.map(v => v.userId) }
        }).select('fullName profilePic lastActive');

        res.json(viewers);
    } catch (error) {
        console.error("Error getting story viewers:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách người xem" });
    }
};