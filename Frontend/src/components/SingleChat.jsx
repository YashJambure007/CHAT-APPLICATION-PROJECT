import {
  Box,
  Text,
  FormControl,
  Input,
  IconButton,
  Spinner,
  useToast,
  Avatar,
  AvatarBadge,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  VStack,
  HStack,
  Flex,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  PhoneIcon,
  ViewIcon,
  AttachmentIcon,
  ArrowRightIcon,
  SettingsIcon,
  DeleteIcon,
  CopyIcon,
  InfoIcon,
} from "@chakra-ui/icons";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Lottie from "lottie-react";

import "./styles.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

import animationData from "../animations/typing.json";

let selectedChatCompare;

const SingleChat = ({  setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const toast = useToast();

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    onlineUsers,
    socket,
  } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Failed to load messages",
        description: "Could not fetch messages. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage.trim() && !e.shiftKey) {
      e.preventDefault();
      socket.emit("stop typing", selectedChat._id);

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const messageToSend = newMessage;
        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: messageToSend,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        toast({
          title: "Message not sent",
          description: "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    }
  };

  const sendMessageByClick = async () => {
    if (!newMessage.trim()) return;

    socket.emit("stop typing", selectedChat._id);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const messageToSend = newMessage;
      setNewMessage("");

      const { data } = await axios.post(
        "/api/message",
        {
          content: messageToSend,
          chatId: selectedChat._id,
        },
        config
      );

      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      toast({
        title: "Message not sent",
        description: "Please try again.",
        status: "error",
        position: "bottom-right",
        isClosable: true,
      });
    }
  };

  const sendFileMessage = async (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Only images (JPG, PNG), PDF, DOC, and DOCX are allowed",
        status: "warning",
        position: "bottom-right",
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nexachat-profile");

    try {
      setUploadingFile(true);

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dy6mrm5nr/raw/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploaded = await res.json();

      if (!uploaded.secure_url) {
        throw new Error("Upload failed");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/message",
        {
          content: uploaded.secure_url,
          chatId: selectedChat._id,
        },
        config
      );

      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);

      toast({
        title: "File sent successfully",
        status: "success",
        duration: 2000,
        position: "bottom-right",
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "File upload failed",
        description: "Please try again.",
        status: "error",
        position: "bottom-right",
        isClosable: true,
      });
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMsg) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMsg.chat._id) {
        if (!notification.find((n) => n._id === newMsg._id)) {
          setNotification((prev) => [newMsg, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, notification, setFetchAgain, setNotification]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      if (timeNow - lastTypingTime >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // ✅ MOVE THIS INSIDE THE RETURN - ONLY CALL WHEN selectedChat EXISTS
  const getSenderInfo = () => {
    if (!selectedChat) {
      return null;
    }

    if (selectedChat.isGroupChat) {
      return {
        name: selectedChat.chatName.toUpperCase(),
        isGroup: true,
        userCount: selectedChat.users.length,
      };
    } else {
      const senderFull = getSenderFull(user, selectedChat.users);
      return {
        name: getSender(user, selectedChat.users),
        pic: senderFull.pic,
        isOnline: onlineUsers?.includes(senderFull?._id),
        isGroup: false,
        userData: senderFull,
      };
    }
  };

  // ✅ CALL IT HERE INSIDE THE CONDITIONAL
  const senderInfo = selectedChat ? getSenderInfo() : null;

  return (
    <>
      {selectedChat ? (
        <Flex
          flexDir="column"
          h="100%"
          w="100%"
          overflow="hidden"
          bg="linear-gradient(135deg, #0f172a 0%, #1e4db7 100%)"
          borderRadius={{ base: "lg", md: "2xl" }}
        >
          {/* ============ HEADER ============ */}
          <Box
            p={{ base: 2.5, md: 3.5 }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bg="linear-gradient(120deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))"
            backdropFilter="blur(10px)"
            color="white"
            borderRadius={{ base: "lg", md: "2xl" }}
            flexShrink={0}
            boxShadow="0 8px 32px rgba(0,0,0,0.2)"
            borderBottom="1px solid rgba(255,255,255,0.1)"
            transition="all 0.3s ease"
          >
            {/* LEFT SECTION */}
            <HStack spacing={{ base: 2, md: 3 }} flex={1}>
              <Tooltip label="Back to chats" placement="right">
                <IconButton
                  display={{ base: "flex", md: "none" }}
                  icon={<ArrowBackIcon />}
                  onClick={() => setSelectedChat(null)}
                  aria-label="Back"
                  bg="rgba(255,255,255,0.1)"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  _active={{ bg: "rgba(255,255,255,0.3)" }}
                  transition="all 0.2s ease"
                  size="sm"
                />
              </Tooltip>

              {senderInfo && !senderInfo.isGroup ? (
                <>
                  <ProfileModal user={senderInfo.userData}>
                    <Box position="relative" cursor="pointer">
                      <Avatar
                        size="sm"
                        src={senderInfo.pic}
                        name={senderInfo.name}
                        transition="transform 0.2s ease"
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        <AvatarBadge
                          boxSize="0.7em"
                          bg={senderInfo.isOnline ? "#10b981" : "#6b7280"}
                          transition="all 0.3s ease"
                        />
                      </Avatar>
                    </Box>
                  </ProfileModal>

                  <VStack spacing={0} align="start" flex={1}>
                    <Text
                      fontWeight="700"
                      fontSize={{ base: "sm", md: "md" }}
                      letterSpacing="-0.5px"
                    >
                      {senderInfo.name}
                    </Text>
                    <Text fontSize="xs" color="gray.200" fontWeight="500">
                      {senderInfo.isOnline ? (
                        <HStack spacing={1}>
                          <Box
                            w="2"
                            h="2"
                            bg="#10b981"
                            borderRadius="full"
                            animation="pulse 2s infinite"
                          />
                          <Text>Online</Text>
                        </HStack>
                      ) : (
                        "Offline"
                      )}
                    </Text>
                  </VStack>
                </>
              ) : senderInfo && senderInfo.isGroup ? (
                <VStack spacing={1} align="start" flex={1}>
                  <HStack spacing={2}>
                    <Text
                      fontWeight="700"
                      fontSize={{ base: "sm", md: "md" }}
                      letterSpacing="-0.5px"
                    >
                      {senderInfo.name}
                    </Text>
                  </HStack>
                </VStack>
              ) : null}
            </HStack>

            {/* RIGHT SECTION - ACTION BUTTONS */}
            <HStack spacing={{ base: 1, md: 2 }} display={{ base: "none", md: "flex" }}>
              <Tooltip label="Voice call" placement="bottom">
                <IconButton
                  icon={<PhoneIcon />}
                  aria-label="Call"
                  bg="rgba(255,255,255,0.1)"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  _active={{ bg: "rgba(255,255,255,0.3)" }}
                  transition="all 0.2s ease"
                  size="sm"
                />
              </Tooltip>

              <Tooltip label="Video call" placement="bottom">
                <IconButton
                  icon={<ViewIcon />}
                  aria-label="Video"
                  bg="rgba(255,255,255,0.1)"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  _active={{ bg: "rgba(255,255,255,0.3)" }}
                  transition="all 0.2s ease"
                  size="sm"
                />
              </Tooltip>

              
            </HStack>

           
          </Box>

          {/* ============ MESSAGES SECTION ============ */}
          <Box
            flex={1}
            overflowY="auto"
            mt={2}
            px={{ base: 2, md: 3 }}
            py={3}
            bg="rgba(15,23,42,0.5)"
            borderRadius="xl"
            css={{
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(30,64,175,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(30,64,175,0.4)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(30,64,175,0.6)",
              },
            }}
          >
            {loading ? (
              <Flex
                h="100%"
                alignItems="center"
                justifyContent="center"
                flexDir="column"
                gap={3}
              >
                <Spinner
                  size="xl"
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="rgba(255,255,255,0.1)"
                  color="blue.400"
                />
                <Text color="gray.400" fontSize="sm">
                  Loading messages...
                </Text>
              </Flex>
            ) : messages.length === 0 ? (
              <Flex
                h="100%"
                alignItems="center"
                justifyContent="center"
                flexDir="column"
                gap={2}
              >
                <Box fontSize="3xl">💬</Box>
                <Text color="gray.400" fontSize="sm" fontWeight="500">
                  No messages yet. Start the conversation!
                </Text>
              </Flex>
            ) : (
              <>
                <ScrollableChat messages={messages} />
                <div ref={messagesEndRef} />
              </>
            )}

            {isTyping && (
              <HStack spacing={2} mt={3} mb={1}>
                <Avatar size="xs" name="User" />
                <Box w="50px" h="30px">
                  <Lottie
                    animationData={animationData}
                    loop
                    style={{ height: "100%" }}
                  />
                </Box>
              </HStack>
            )}
          </Box>

          {/* ============ INPUT SECTION ============ */}
          <Box mt={2} flexShrink={0} px={{ base: 2, md: 3 }} pb={{ base: 2, md: 3 }}>
            <FormControl onKeyDown={sendMessage}>
              <Flex
                gap={{ base: 1.5, md: 2 }}
                alignItems="flex-end"
                bg="rgba(15,23,42,0.7)"
                backdropFilter="blur(10px)"
                p={{ base: 2, md: 2.5 }}
                borderRadius="2xl"
                border="1px solid rgba(255,255,255,0.1)"
                transition="all 0.3s ease"
                _focus-within={{
                  border: "1px solid rgba(30,64,175,0.5)",
                  boxShadow: "0 0 0 3px rgba(30,64,175,0.1)",
                }}
              >
                {/* FILE UPLOAD BUTTON */}
                <Tooltip label="Attach file" placement="top">
                  <IconButton
                    icon={<AttachmentIcon />}
                    aria-label="Upload file"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploadingFile}
                    bg="rgba(255,255,255,0.05)"
                    color="white"
                    _hover={{
                      bg: "rgba(30,64,175,0.3)",
                      transform: "scale(1.05)",
                    }}
                    _active={{
                      bg: "rgba(30,64,175,0.5)",
                      transform: "scale(0.95)",
                    }}
                    transition="all 0.2s ease"
                    size={{ base: "sm", md: "md" }}
                    disabled={uploadingFile}
                  />
                </Tooltip>

                {/* HIDDEN FILE INPUT */}
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => sendFileMessage(e.target.files[0])}
                />

                {/* MESSAGE INPUT */}
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={typingHandler}
                  bg="transparent"
                  color="white"
                  border="none"
                  _placeholder={{
                    color: "gray.500",
                  }}
                  _focus={{
                    outline: "none",
                    boxShadow: "none",
                  }}
                  fontSize={{ base: "sm", md: "md" }}
                  py={{ base: 2, md: 2.5 }}
                  px={0}
                  flex={1}
                  resize="none"
                  maxH="100px"
                />

                {/* SEND BUTTON */}
                <Tooltip label="Send message (Enter)" placement="top">
                  <IconButton
                    icon={<ArrowRightIcon />}
                    aria-label="Send message"
                    onClick={sendMessageByClick}
                    isDisabled={!newMessage.trim()}
                    bg="linear-gradient(135deg, #3182ce 0%, #2c5282 100%)"
                    color="white"
                    _hover={{
                      bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                      transform: "translateX(2px)",
                      boxShadow: "0 4px 12px rgba(30,64,175,0.4)",
                    }}
                    _active={{
                      transform: "translateX(0)",
                      boxShadow: "0 2px 6px rgba(30,64,175,0.4)",
                    }}
                    _disabled={{
                      opacity: 0.5,
                      cursor: "not-allowed",
                      _hover: {
                        bg: "linear-gradient(135deg, #3182ce 0%, #2c5282 100%)",
                        transform: "none",
                        boxShadow: "none",
                      },
                    }}
                    transition="all 0.2s ease"
                    size={{ base: "sm", md: "md" }}
                  />
                </Tooltip>
              </Flex>
            </FormControl>

            {/* UPLOAD STATUS */}
            {uploadingFile && (
              <Text
                fontSize="xs"
                color="blue.300"
                mt={1.5}
                fontWeight="500"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Spinner size="xs" /> Uploading file...
              </Text>
            )}

            {/* KEYBOARD HINT */}
            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
              display={{ base: "none", md: "block" }}
            >
              Shift + Enter for new line
            </Text>
          </Box>
        </Flex>
      ) : (
        <Flex
          h="100%"
          alignItems="center"
          justifyContent="center"
          flexDir="column"
          gap={4}
          bg="linear-gradient(135deg, #0f172a 0%, #1e4db7 100%)"
          borderRadius={{ base: "lg", md: "2xl" }}
        >
          <Box fontSize="5xl" animation="bounce 2s infinite">
            💬
          </Box>
          <VStack spacing={1}>
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="700"
              color="white"
              textAlign="center"
            >
              No Chat Selected
            </Text>
            <Text fontSize={{ base: "sm", md: "md" }} color="gray.400" textAlign="center">
              Click on a user to start messaging
            </Text>
          </VStack>
        </Flex>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
};

export default SingleChat;
