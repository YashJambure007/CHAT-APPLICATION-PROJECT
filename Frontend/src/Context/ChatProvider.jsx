import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const ChatContext = createContext(null);
const ENDPOINT = "http://localhost:5000";

let socket;

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  // ✅ ONLINE USERS STATE
  const [onlineUsers, setOnlineUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
      return;
    }

    // ✅ CREATE SOCKET ONLY ONCE
    socket = io(ENDPOINT, { transports: ["websocket"] });

    socket.emit("setup", userInfo);

    socket.on("online users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online users");
    };
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        onlineUsers,
        socket, // ✅ SHARE SAME SOCKET
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("ChatState must be used within ChatProvider");
  }
  return context;
};

export default ChatProvider;
