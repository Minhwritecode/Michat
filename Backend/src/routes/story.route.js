import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createStory, getStories, reactStory, replyStory, forwardStory } from "../controllers/story.controller.js";

const router = express.Router();

router.post("/", protectRoute, createStory);
router.get("/", protectRoute, getStories);
router.post("/:storyId/react", protectRoute, reactStory);
router.post("/:storyId/reply", protectRoute, replyStory);
router.post("/:storyId/forward", protectRoute, forwardStory);

export default router;