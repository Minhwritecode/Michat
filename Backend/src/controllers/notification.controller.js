import Notification from "../models/notification.model.js";

export const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const userId = req.user._id;
    const [items, total] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments({ userId })
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    res.status(500).json({ message: "Không thể lấy thông báo" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const doc = await Notification.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });
    if (!doc) return res.status(404).json({ message: "Không tìm thấy thông báo" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Không thể cập nhật" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Không thể cập nhật" });
  }
};

// Utility: broadcast birthdays (to be scheduled externally if desired)
export const checkBirthdaysAndNotify = async (io) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // dob only holds month/day; naive scan would require aggregation; omitted for brevity
  } catch {}
};


