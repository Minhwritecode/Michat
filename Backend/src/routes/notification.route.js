import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMyNotifications);
router.put("/:id/read", protectRoute, markAsRead);
router.put("/read-all", protectRoute, markAllAsRead);

export default router;


