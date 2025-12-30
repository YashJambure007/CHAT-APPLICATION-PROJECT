import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production deployment (optional)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`.yellow.bold);
});

// ================= SOCKET.IO =================
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // Vite port
  },
});

/**
 * ✅ ONLINE USERS STORE
 * key   → userId
 * value → socketId
 */
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // ================= USER SETUP =================
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    // ✅ ADD USER TO ONLINE LIST
    onlineUsers.set(userData._id, socket.id);

    // 🔥 BROADCAST ONLINE USERS
    io.emit("online users", Array.from(onlineUsers.keys()));

    socket.emit("connected");
  });

  // ================= JOIN CHAT =================
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // ================= TYPING =================
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // ================= NEW MESSAGE =================
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat?.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    // 🔥 REMOVE USER FROM ONLINE LIST
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    // 🔥 BROADCAST UPDATED ONLINE USERS
    io.emit("online users", Array.from(onlineUsers.keys()));

    console.log("User disconnected");
  });

  socket.off("setup", () => {
    socket.leave();
  });
});
