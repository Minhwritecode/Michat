// routes/bot.route.js
import express from 'express';
import { generateSuggestions } from '../controllers/bot.controller.js';

const router = express.Router();

// Mounted at /api/bot in index.js
router.post('/suggest', generateSuggestions);

export default router;