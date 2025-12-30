import {
  Avatar,
  Tooltip,
  Box,
  Text,
  Image,
  Button,
  HStack,
  VStack,
  Badge,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
  isMessageSeenByAll,
} from "../config/ChatLogics.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";

const ScrollableChat = ({ messages }) => {
  const { user, selectedChat } = ChatState();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isImageMessage = (content) => {
    return (
      typeof content === "string" &&
      content.includes("res.cloudinary.com") &&
      (content.endsWith(".jpg") ||
        content.endsWith(".png") ||
        content.endsWith(".jpeg") ||
        content.endsWith(".webp"))
    );
  };

  const isFileMessage = (content) => {
    return (
      typeof content === "string" &&
      (content.endsWith(".pdf") ||
        content.endsWith(".doc") ||
        content.endsWith(".docx"))
    );
  };

  const getFileName = (url) => {
    try {
      return decodeURIComponent(url.split("/").pop());
    } catch {
      return "Document";
    }
  };

  const getDownloadUrl = (url) => {
    if (!url) return url;
    return `${url}?fl_attachment=true`;
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".pdf")) return "📕";
    if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return "📘";
    return "📄";
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      overflowY="auto"
      maxH="100%"
      px={2}
      py={3}
      css={{
        "&::-webkit-scrollbar": { width: "6px" },
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
      {messages && messages.length === 0 ? (
        <VStack h="100%" justify="center" spacing={3}>
          <Box fontSize="3xl">👋</Box>
          <Text color="gray.400" fontSize="sm" textAlign="center">
            Start a conversation
          </Text>
        </VStack>
      ) : (
        messages.map((m, i) => (
          <Box key={m._id} display="flex" flexDir="column" mb={3}>
            {/* MESSAGE CONTAINER */}
            <Box
              display="flex"
              justifyContent={m.sender._id === user._id ? "flex-end" : "flex-start"}
              alignItems="flex-end"
              gap={2}
            >
              {/* AVATAR */}
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) &&
                m.sender._id !== user._id && (
                  <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                    <Avatar
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic}
                      border="2px solid rgba(30,64,175,0.3)"
                      transition="all 0.2s ease"
                      _hover={{ transform: "scale(1.1)" }}
                    />
                  </Tooltip>
                )}

              {/* SPACING FOR SENT MESSAGES */}
              {m.sender._id === user._id &&
                (isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Box w="40px" />
                )}

              {/* MESSAGE BUBBLE */}
              <VStack
                bg={m.sender._id === user._id ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" : "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)"}
                color="white"
                ml={
                  m.sender._id !== user._id
                    ? isSameSenderMargin(messages, m, i, user._id)
                    : 0
                }
                mr={m.sender._id === user._id ? 0 : "auto"}
                mt={isSameUser(messages, m, i) ? 1 : 3}
                borderRadius={
                  m.sender._id === user._id
                    ? "20px 20px 4px 20px"
                    : "20px 20px 20px 4px"
                }
                px={4}
                py={3}
                maxW={{ base: "85%", md: "60%" }}
                boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                transition="all 0.2s ease"
                _hover={{
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  transform: "translateY(-1px)",
                }}
                spacing={2}
                align="start"
              >
                {/* IMAGE MESSAGE */}
                {isImageMessage(m.content) && (
                  <Box
                    position="relative"
                    borderRadius="lg"
                    overflow="hidden"
                    cursor="pointer"
                    transition="all 0.2s ease"
                    _hover={{
                      transform: "scale(1.02)",
                    }}
                  >
                    <Image
                      src={m.content}
                      alt="chat-img"
                      borderRadius="lg"
                      maxH="220px"
                      maxW="100%"
                      objectFit="cover"
                      onClick={() => window.open(m.content, "_blank")}
                    />
                    <Box
                      position="absolute"
                      inset={0}
                      bg="rgba(0,0,0,0)"
                      _hover={{ bg: "rgba(0,0,0,0.3)" }}
                      transition="all 0.2s ease"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon
                        as={ExternalLinkIcon}
                        fontSize="2xl"
                        color="white"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                      />
                    </Box>
                  </Box>
                )}

                {/* FILE MESSAGE */}
                {isFileMessage(m.content) && (
                  <HStack
                    spacing={3}
                    w="100%"
                    bg="rgba(0,0,0,0.2)"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    transition="all 0.2s ease"
                    _hover={{
                      bg: "rgba(0,0,0,0.3)",
                    }}
                  >
                    <Box fontSize="xl">{getFileIcon(getFileName(m.content))}</Box>
                    <VStack spacing={0} align="start" flex={1}>
                      <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                        {getFileName(m.content)}
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        Document
                      </Text>
                    </VStack>
                    <IconButton
                      icon={<DownloadIcon />}
                      aria-label="Download"
                      size="sm"
                      bg="rgba(0,0,0,0.2)"
                      _hover={{
                        bg: "rgba(0,0,0,0.4)",
                        transform: "scale(1.1)",
                      }}
                      _active={{
                        transform: "scale(0.95)",
                      }}
                      transition="all 0.2s ease"
                      onClick={() =>
                        window.open(getDownloadUrl(m.content), "_blank")
                      }
                    />
                  </HStack>
                )}

                {/* TEXT MESSAGE */}
                {!isImageMessage(m.content) && !isFileMessage(m.content) && (
                  <Text fontSize="sm" wordBreak="break-word" lineHeight="1.4">
                    {m.content}
                  </Text>
                )}

                {/* TIMESTAMP */}
                <Text fontSize="xs" opacity={0.7} alignSelf="flex-end" mt={1}>
                  {formatTime(m.createdAt)}
                </Text>
              </VStack>
            </Box>

            {/* READ RECEIPT */}
            {m.sender._id === user._id && i === messages.length - 1 && (
              <HStack spacing={1} justify="flex-end" mr={2} mt={1}>
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color={
                    isMessageSeenByAll(m, user, selectedChat)
                      ? "cyan.300"
                      : "gray.400"
                  }
                >
                  {isMessageSeenByAll(m, user, selectedChat) ? (
                    <HStack spacing={0.5}>
                      <Text>👁️ Seen</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={0.5}>
                      <Text>✓ Delivered</Text>
                    </HStack>
                  )}
                </Text>
              </HStack>
            )}
          </Box>
        ))
      )}

      <div ref={bottomRef} />
    </Box>
  );
};

export default ScrollableChat;
