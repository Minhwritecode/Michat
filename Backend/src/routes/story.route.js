import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createStory, getStories, reactStory, replyStory, forwardStory, getMyStories, deleteStory } from "../controllers/story.controller.js";

const router = express.Router();

router.post("/", protectRoute, createStory);
router.get("/", protectRoute, getStories);
router.get("/my-stories", protectRoute, getMyStories);
router.delete("/:storyId", protectRoute, deleteStory);
router.post("/:storyId/react", protectRoute, reactStory);
router.post("/:storyId/reply", protectRoute, replyStory);
router.post("/:storyId/forward", protectRoute, forwardStory);

export default router;