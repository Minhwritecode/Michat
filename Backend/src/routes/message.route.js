import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getMessages,
    getUsersForSidebar,
    sendMessage,
    addReaction,
    togglePinMessage,
    editMessage,
    forwardMessage,
    deleteMessage,
    markMessageAsRead,
    getReadReceipts,
    markAllMessagesAsRead
} from "../controllers/message.controller.js";
import { getLinkPreview } from "../libs/linkPreview.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/link-preview", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing url" });
    const data = await getLinkPreview(url);
    if (!data) return res.status(500).json({ error: "Failed to fetch preview" });
    res.json(data);
});

router.post("/send/:id", protectRoute, sendMessage);
router.post("/reaction/:messageId", protectRoute, addReaction);
router.put("/pin/:messageId", protectRoute, togglePinMessage);
router.put("/edit/:messageId", protectRoute, editMessage);
router.post("/forward", protectRoute, forwardMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

// Read receipts routes
router.put("/:messageId/read", markMessageAsRead);
router.get("/:messageId/read-receipts", getReadReceipts);
router.put("/:senderId/mark-all-read", markAllMessagesAsRead);

export default router;