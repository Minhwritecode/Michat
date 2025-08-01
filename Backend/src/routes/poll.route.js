import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    createPoll,
    getGroupPolls,
    getPollDetails,
    voteOnPoll,
    closePoll,
    deletePoll
} from "../controllers/poll.controller.js";

const router = express.Router();

// Poll routes
router.post("/create", protectRoute, createPoll);
router.get("/group/:groupId", protectRoute, getGroupPolls);
router.get("/:pollId", protectRoute, getPollDetails);
router.post("/:pollId/vote", protectRoute, voteOnPoll);
router.put("/:pollId/close", protectRoute, closePoll);
router.delete("/:pollId", protectRoute, deletePoll);

export default router; 