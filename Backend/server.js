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

// ================= CORS CONFIGURATION (SIMPLIFIED) =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000", 
  "https://chat-application-project-ecru.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

console.log("🌍 Allowed CORS Origins:", allowedOrigins);

// Simple CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Handle preflight requests properly
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.sendStatus(204);
});

// Additional CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  
  next();
});

// ================= ROUTES =================
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "API is running...",
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      clientUrl: process.env.CLIENT_URL
    }
  });
});

// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ================= ERROR HANDLING =================
app.use(notFound);
app.use(errorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
  console.log(`🌍 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 Client URL from env: ${process.env.CLIENT_URL}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
  console.log(`🔍 CORS test: http://localhost:${PORT}/api/cors-test`);
});

// ================= SOCKET.IO =================
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

/**
 * ONLINE USERS MAP
 */
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
  console.log("🌐 Socket origin:", socket.handshake.headers.origin);

  socket.on("setup", (userData) => {
    if (!userData?._id) {
      console.log("❌ Invalid user data for setup");
      return;
    }
    
    socket.join(userData._id);
    onlineUsers.set(userData._id, socket.id);
    io.emit("online users", Array.from(onlineUsers.keys()));
    socket.emit("connected");
    console.log(`✅ User ${userData._id} set up`);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`📱 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
    console.log(`✍️ Typing in room: ${room}`);
  });
  
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
    console.log(`🛑 Stopped typing in room: ${room}`);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat?.users) {
      console.log("❌ No chat users in new message");
      return;
    }

    console.log(`📨 New message in chat: ${chat._id}`);
    
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
      console.log(`➡️ Message sent to user: ${user._id}`);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
    
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`👋 User ${userId} went offline`);
        break;
      }
    }
    io.emit("online users", Array.from(onlineUsers.keys()));
  });
});

// Handle server errors
server.on("error", (error) => {
  console.error("❌ Server error:", error);
});