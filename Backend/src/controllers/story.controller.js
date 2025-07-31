import Story from "../models/story.model.js";
import User from "../models/user.model.js";

// Tạo story mới
export const createStory = async (req, res) => {
    try {
        const { media, text } = req.body;
        const userId = req.user._id;
        const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        const story = await Story.create({ userId, media, text, expiredAt });
        res.status(201).json(story);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo story" });
    }
};

// Lấy tất cả stories còn hiệu lực
export const getStories = async (req, res) => {
    try {
        const now = new Date();
        const stories = await Story.find({ expiredAt: { $gt: now } })
            .populate('userId', 'fullName profilePic');
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy stories" });
    }
};

// Thả cảm xúc story
export const reactStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ message: "Story không tồn tại" });
        // Xoá reaction cũ nếu có
        story.reactions = story.reactions.filter(r => r.userId.toString() !== userId);
        story.reactions.push({ userId, emoji });
        await story.save();
        res.json({ message: "Đã thả cảm xúc" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thả cảm xúc" });
    }
};

// Reply story
export const replyStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ message: "Story không tồn tại" });
        story.replies.push({ userId, text });
        await story.save();
        res.json({ message: "Đã gửi reply" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi reply story" });
    }
};

// Forward story vào chat
export const forwardStory = async (req, res) => {
    try {
        // Giả sử bạn đã có logic gửi message
        // Gọi message controller hoặc logic tương tự
        res.json({ message: "Đã chuyển tiếp story (cần implement thêm logic gửi message)" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi chuyển tiếp story" });
    }
};