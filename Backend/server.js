import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ================= CONFIG =================
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ================= CORS (PRODUCTION SAFE) =================
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Vercel URL
    credentials: true,
  })
);

// ================= ROUTES =================
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ================= ERROR HANDLING =================
app.use(notFound);
app.use(errorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// ================= SOCKET.IO =================
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL, // Vercel URL
    methods: ["GET", "POST"],
  },
});

/**
 * ONLINE USERS MAP
 * key   -> userId
 * value -> socketId
 */
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ========== USER SETUP ==========
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    onlineUsers.set(userData._id, socket.id);

    io.emit("online users", Array.from(onlineUsers.keys()));
    socket.emit("connected");
  });

  // ========== JOIN CHAT ==========
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  // ========== TYPING ==========
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // ========== NEW MESSAGE ==========
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat?.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // ========== DISCONNECT ==========
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online users", Array.from(onlineUsers.keys()));
    console.log("Socket disconnected:", socket.id);
  });
});
