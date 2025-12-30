import express from "express";
import {
  allMessages,
  sendMessage,
} from "../controllers/messageControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/message/:chatId
 * @desc    Get all messages of a chat (also marks as read)
 * @access  Protected
 */
router.route("/:chatId").get(protect, allMessages);

/**
 * @route   POST /api/message
 * @desc    Send new message
 * @access  Protected
 */
router.route("/").post(protect, sendMessage);

export default router;
