import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

// @desc    Get all messages
// @route   GET /api/message/:chatId
// @access  Protected
const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat");

  // ✅ MARK MESSAGES AS READ FOR CURRENT USER
  await Message.updateMany(
    {
      chat: req.params.chatId,
      readBy: { $ne: req.user._id },
    },
    {
      $addToSet: { readBy: req.user._id },
      $set: { seenAt: new Date() },
    }
  );

  res.json(messages);
});

// @desc    Send new message
// @route   POST /api/message
// @access  Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).send("Invalid data passed");
  }

  let newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,

    // ✅ SENDER HAS READ THEIR OWN MESSAGE
    readBy: [req.user._id],
  };

  let message = await Message.create(newMessage);

  message = await message.populate("sender", "name pic");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  res.json(message);
});

export { allMessages, sendMessage };
