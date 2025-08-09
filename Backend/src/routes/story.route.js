import express from "express";
import { 
    protectRoute, 
    checkStoryPermission 
} from "../middlewares/auth.middleware.js";
import {
    createStory,
    getStories,
    reactStory,
    replyStory,
    forwardStory,
    getMyStories,
    deleteStory,
    getStoryViewers
} from "../controllers/story.controller.js";

const router = express.Router();

// Story CRUD
router.post("/", protectRoute, createStory);
router.get("/", protectRoute, getStories);
router.get("/my-stories", protectRoute, getMyStories);
router.delete("/:storyId", protectRoute, checkStoryPermission, deleteStory);

// Story interactions
router.post("/:storyId/react", protectRoute, reactStory);
router.post("/:storyId/reply", protectRoute, replyStory);
router.post("/:storyId/forward", protectRoute, forwardStory);

// Story analytics
router.get("/:storyId/viewers", protectRoute, checkStoryPermission, getStoryViewers);

export default router;