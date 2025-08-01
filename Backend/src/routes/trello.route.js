import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    createTrelloTask,
    getTrelloBoards,
    getTrelloLists
} from "../controllers/trello.controller.js";

const router = express.Router();

// Create Trello task
router.post("/create-task", protectRoute, createTrelloTask);

// Get user's Trello boards
router.get("/boards", protectRoute, getTrelloBoards);

// Get lists in a board
router.get("/boards/:boardId/lists", protectRoute, getTrelloLists);

export default router; 