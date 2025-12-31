import { AddIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarBadge,
  Box,
  Stack,
  Text,
  Button,
  useToast,
  VStack,
  HStack,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

// ⭐⭐⭐ ADD THIS LINE HERE ⭐⭐⭐
const API_URL = window.location.hostname.includes('vercel.app') 
  ? 'https://chat-app-backend-b95z.onrender.com'  // ⚠️ REPLACE WITH YOUR RENDER URL
  : 'http://localhost:5000';

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    onlineUsers,
  } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // ⭐⭐⭐ FIX: Add API_URL here ⭐⭐⭐
      const { data } = await axios.get(`${API_URL}/api/chat`, config);  // ✅ CHANGED
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the chats",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      w={{ base: "100%", md: "31%" }}
      borderRadius="2xl"
      bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
      boxShadow="0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
      border="1px solid rgba(30,64,175,0.3)"
      h="100%"
      overflow="hidden"
      transition="all 0.3s ease"
    >
      {/* ============ HEADER ============ */}
      <HStack
        pb={3}
        px={3}
        w="100%"
        justify="space-between"
        alignItems="center"
        borderBottom="1px solid rgba(30,64,175,0.2)"
      >
        <VStack spacing={0} align="start">
          <Text
            fontSize={{ base: "20px", md: "24px" }}
            fontWeight="900"
            color="white"
            letterSpacing="-0.5px"
          >
            💬 My Chats
          </Text>
          <Text fontSize="xs" color="gray.400">
            {chats?.length || 0} conversations
          </Text>
        </VStack>

        <GroupChatModal>
          <Tooltip label="Create new group" placement="bottom">
            <Button
              rightIcon={<AddIcon />}
              bg="linear-gradient(135deg, #38BDF8, #0EA5E9)"
              _hover={{
                bg: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(30,64,175,0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              color="white"
              fontWeight="700"
              borderRadius="full"
              px={4}
              py={2}
              fontSize={{ base: "12px", md: "13px" }}
              transition="all 0.3s ease"
            >
              New Group
            </Button>
          </Tooltip>
        </GroupChatModal>
      </HStack>

      {/* ============ CHAT LIST ============ */}
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="rgba(15,23,42,0.5)"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
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
        {chats ? (
          chats.length === 0 ? (
            <VStack
              h="100%"
              justify="center"
              spacing={3}
              color="gray.400"
            >
              <Box fontSize="3xl">📭</Box>
              <Text fontSize="sm" textAlign="center">
                No chats yet. Create one to get started!
              </Text>
            </VStack>
          ) : (
            <Stack overflowY="auto" spacing={2}>
              {chats.map((chat) => {
                const otherUser =
                  !chat.isGroupChat && loggedUser
                    ? chat.users.find((u) => u._id !== loggedUser._id)
                    : null;

                const isOnline =
                  otherUser && onlineUsers?.includes(otherUser._id);

                return (
                  <Tooltip
                    key={chat._id}
                    label={
                      chat.isGroupChat
                        ? `${chat.users.length} members`
                        : isOnline
                        ? "Online"
                        : "Offline"
                    }
                    placement="right"
                  >
                    <HStack
                      onClick={() => setSelectedChat(chat)}
                      cursor="pointer"
                      bg={
                        selectedChat === chat
                          ? "linear-gradient(135deg, #38BDF8, #0EA5E9)"
                          : "rgba(30,64,175,0.1)"
                      }
                      color={
                        selectedChat === chat ? "white" : "gray.200"
                      }
                      px={3}
                      py={3}
                      borderRadius="lg"
                      border={
                        selectedChat === chat
                          ? "1px solid rgba(56,189,248,0.5)"
                          : "1px solid rgba(30,64,175,0.2)"
                      }
                      _hover={{
                        bg:
                          selectedChat === chat
                            ? "linear-gradient(135deg, #0EA5E9, #0284C7)"
                            : "rgba(30,64,175,0.2)",
                        transform: "translateX(4px)",
                        borderColor: "rgba(56,189,248,0.4)",
                      }}
                      _active={{
                        transform: "translateX(2px)",
                      }}
                      gap={3}
                      position="relative"
                      transition="all 0.2s ease"
                      spacing={3}
                    >
                      {/* AVATAR + ONLINE DOT */}
                      <Box position="relative" flexShrink={0}>
                        <Avatar
                          size="sm"
                          name={
                            chat.isGroupChat
                              ? chat.chatName
                              : otherUser?.name
                          }
                          src={!chat.isGroupChat ? otherUser?.pic : ""}
                          border="2px solid rgba(30,64,175,0.3)"
                          transition="all 0.2s ease"
                        >
                          {!chat.isGroupChat && isOnline && (
                            <AvatarBadge
                              boxSize="0.9em"
                              bg="#10b981"
                              border="2px solid"
                              borderColor={
                                selectedChat === chat
                                  ? "#38BDF8"
                                  : "rgba(15,23,42,0.9)"
                              }
                            />
                          )}
                        </Avatar>

                        {chat.isGroupChat && (
                          <Badge
                            position="absolute"
                            bottom="-2"
                            right="-2"
                            bg="rgba(56,189,248,0.3)"
                            color="#38BDF8"
                            fontSize="xs"
                            borderRadius="full"
                            px={1.5}
                          >
                            {chat.users.length}
                          </Badge>
                        )}
                      </Box>

                      {/* CHAT INFO */}
                      <VStack
                        spacing={0.5}
                        align="start"
                        flex={1}
                        minW={0}
                      >
                        <HStack spacing={2} w="100%">
                          <Text
                            fontWeight="600"
                            fontSize="sm"
                            noOfLines={1}
                          >
                            {!chat.isGroupChat
                              ? getSender(loggedUser, chat.users)
                              : chat.chatName}
                          </Text>
                          {!chat.isGroupChat && isOnline && (
                            <Box
                              w="2"
                              h="2"
                              bg="#10b981"
                              borderRadius="full"
                              flexShrink={0}
                            />
                          )}
                        </HStack>

                        {chat.latestMessage && (
                          <Text
                            fontSize="xs"
                            opacity={0.7}
                            noOfLines={1}
                            color={
                              selectedChat === chat
                                ? "rgba(255,255,255,0.8)"
                                : "gray.400"
                            }
                          >
                            <strong>
                              {chat.latestMessage.sender.name}:
                            </strong>{" "}
                            {chat.latestMessage.content.length > 30
                              ? chat.latestMessage.content.substring(
                                  0,
                                  30
                                ) + "..."
                              : chat.latestMessage.content}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Tooltip>
                );
              })}
            </Stack>
          )
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;