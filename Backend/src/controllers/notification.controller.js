import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getIO } from "../libs/socket.js";

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
export const checkBirthdaysAndNotify = async (ioParam) => {
  try {
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();

    // Find users whose dob shares same month/day
    const users = await User.find({ dob: { $ne: null } }, { _id: 1, fullName: 1, dob: 1 });
    const birthdayUsers = users.filter(u => {
      const d = new Date(u.dob);
      return d.getMonth() === month && d.getDate() === date;
    });

    if (birthdayUsers.length === 0) return { count: 0 };

    // Create system notifications for all users (broadcast style)
    const allUsers = await User.find({}, { _id: 1 });
    const notifs = [];
    const title = "Sinh nhật hôm nay";
    const names = birthdayUsers.map(u => u.fullName).join(", ");
    const body = `Chúc mừng sinh nhật: ${names}! 🎉`;
    for (const u of allUsers) {
      notifs.push({ userId: u._id, type: "system", title, body, icon: "", link: "/", meta: { kind: "birthday", users: birthdayUsers.map(b => b._id) } });
    }
    if (notifs.length > 0) await Notification.insertMany(notifs);

    // Emit socket event
    const io = ioParam || (getIO && getIO());
    if (io) {
      io.emit("notification:new", { type: "system", title, body, meta: { kind: "birthday" } });
    }
    return { count: birthdayUsers.length };
  } catch (e) { return { error: true }; }
};


