import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
  VStack,
  HStack,
  Text,
  Divider,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider.jsx";
import UserBadgeItem from "../userAvatar/UserBadgeItem.jsx";
import UserListItem from "../userAvatar/UserListItem.jsx";

// ⭐⭐⭐ ADD THIS LINE HERE ⭐⭐⭐
const API_URL = window.location.hostname.includes('vercel.app') 
  ? 'https://chat-app-backend-b95z.onrender.com'  // ⚠️ REPLACE WITH YOUR RENDER URL
  : 'http://localhost:5000';

const UpdateGroupChatModal = ({
  fetchMessages,
  fetchAgain,
  setFetchAgain,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [removingUser, setRemovingUser] = useState(false);

  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  if (!selectedChat) return null;

  const isAdmin = selectedChat.groupAdmin._id === user._id;

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      // ⭐⭐⭐ FIX 1: Add API_URL here ⭐⭐⭐
      const { data } = await axios.get(`${API_URL}/api/user?search=${query}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to load search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName.trim()) {
      toast({
        title: "Please enter a group name",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      setRenameLoading(true);
      // ⭐⭐⭐ FIX 2: Add API_URL here ⭐⭐⭐
      const { data } = await axios.put(
        `${API_URL}/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");

      toast({
        title: "Group renamed successfully! 🎉",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      toast({
        title: "Rename Failed",
        description: error.response?.data?.message || "Error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already in group",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Only admins can add users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);
      // ⭐⭐⭐ FIX 3: Add API_URL here ⭐⭐⭐
      const { data } = await axios.put(
        `${API_URL}/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setSearch("");
      setSearchResult([]);

      toast({
        title: "User added successfully! ✨",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      toast({
        title: "Failed to add user",
        description: error.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (
      !isAdmin &&
      userToRemove._id !== user._id
    ) {
      toast({
        title: "Only admins can remove users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      setRemovingUser(true);
      // ⭐⭐⭐ FIX 4: Add API_URL here ⭐⭐⭐
      const { data } = await axios.put(
        `${API_URL}/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (userToRemove._id === user._id) {
        setSelectedChat(null);
        toast({
          title: "You left the group 👋",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        setSelectedChat(data);
        toast({
          title: `${userToRemove.name} removed from group`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }

      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (error) {
      toast({
        title: "Failed to remove user",
        description: error.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setRemovingUser(false);
    }
  };

  return (
    <>
      <Tooltip label="Manage Group" placement="bottom">
        <IconButton
          icon={<ViewIcon />}
          onClick={onOpen}
          aria-label="Update Group"
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{
            bg: "rgba(255,255,255,0.2)",
            transform: "scale(1.1)",
          }}
          _active={{
            transform: "scale(0.95)",
          }}
          transition="all 0.2s ease"
          size="sm"
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent
          bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          color="white"
          border="1px solid rgba(30,64,175,0.3)"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.5)"
        >
          <Box
            bgGradient="linear(to-r, #38BDF8, #0EA5E9)"
            py={4}
            display="flex"
            justifyContent="center"
            position="relative"
          >
            <ModalHeader
              fontSize="24px"
              fontWeight="900"
              textAlign="center"
              p={0}
            >
              ⚙️ Manage Group
            </ModalHeader>
            <ModalCloseButton
              color="white"
              _hover={{ bg: "rgba(0,0,0,0.2)" }}
              position="absolute"
              right={2}
              top={2}
            />
          </Box>

          <ModalBody py={6}>
            <VStack spacing={6}>
              {/* GROUP NAME SECTION */}
              <Box w="100%" bg="rgba(30,64,175,0.1)" p={4} borderRadius="lg" border="1px solid rgba(30,64,175,0.2)">
                <Text fontSize="sm" fontWeight="600" color="gray.300" mb={3}>
                  📝 Group Name
                </Text>
                <Text fontSize="lg" fontWeight="700" color="white" mb={3}>
                  {selectedChat.chatName}
                </Text>
                <FormControl display="flex" gap={2}>
                  <Input
                    placeholder="New group name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(30,64,175,0.3)"
                    _focus={{
                      bg: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(30,64,175,0.6)",
                      boxShadow: "0 0 0 3px rgba(30,64,175,0.2)",
                    }}
                    _placeholder={{ color: "gray.500" }}
                    borderRadius="lg"
                    fontSize="sm"
                  />
                  <Button
                    bg="linear-gradient(135deg, #38BDF8, #0EA5E9)"
                    color="white"
                    fontWeight="700"
                    isLoading={renameLoading}
                    onClick={handleRename}
                    isDisabled={!groupChatName.trim() || !isAdmin}
                    _hover={{
                      bg: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(30,64,175,0.4)",
                    }}
                    _disabled={{
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }}
                    transition="all 0.3s ease"
                    borderRadius="lg"
                    whiteSpace="nowrap"
                  >
                    Rename
                  </Button>
                </FormControl>
              </Box>

              <Divider borderColor="rgba(30,64,175,0.2)" />

              {/* MEMBERS SECTION */}
              <Box w="100%">
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight="600" color="gray.300">
                    👥 Members ({selectedChat.users.length})
                  </Text>
                  {isAdmin && (
                    <Badge bg="rgba(56,189,248,0.2)" color="#38BDF8" fontSize="xs">
                      Admin
                    </Badge>
                  )}
                </HStack>

                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={2}
                  bg="rgba(30,64,175,0.05)"
                  p={3}
                  borderRadius="lg"
                  border="1px solid rgba(30,64,175,0.15)"
                  minH="80px"
                >
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      admin={selectedChat.groupAdmin}
                      handleFunction={() => handleRemove(u)}
                      isCurrentUser={u._id === user._id}
                      isAdmin={isAdmin}
                    />
                  ))}
                </Box>
              </Box>

              <Divider borderColor="rgba(30,64,175,0.2)" />

              {/* ADD USERS SECTION */}
              {isAdmin && (
                <Box w="100%">
                  <Text fontSize="sm" fontWeight="600" color="gray.300" mb={3}>
                    ➕ Add Users to Group
                  </Text>
                  <FormControl mb={3}>
                    <Input
                      placeholder="Search users by name or email"
                      onChange={(e) => handleSearch(e.target.value)}
                      bg="rgba(255,255,255,0.05)"
                      border="1px solid rgba(30,64,175,0.3)"
                      _focus={{
                        bg: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(30,64,175,0.6)",
                        boxShadow: "0 0 0 3px rgba(30,64,175,0.2)",
                      }}
                      _placeholder={{ color: "gray.500" }}
                      borderRadius="lg"
                      fontSize="sm"
                    />
                  </FormControl>

                  {loading ? (
                    <Box display="flex" flexDir="column" alignItems="center" py={4}>
                      <Spinner
                        thickness="3px"
                        speed="0.65s"
                        emptyColor="rgba(255,255,255,0.1)"
                        color="#38BDF8"
                        size="sm"
                        mb={2}
                      />
                      <Text fontSize="xs" color="gray.400">
                        Searching users...
                      </Text>
                    </Box>
                  ) : searchResult.length === 0 && search ? (
                    <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                      No users found
                    </Text>
                  ) : (
                    <VStack spacing={1} maxH="250px" overflowY="auto">
                      {searchResult.map((u) => (
                        <Box key={u._id} w="100%">
                          <UserListItem
                            user={u}
                            handleFunction={() => handleAddUser(u)}
                          />
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid rgba(30,64,175,0.2)"
            bg="rgba(15,23,42,0.5)"
            gap={3}
            py={4}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              fontWeight="600"
              transition="all 0.2s ease"
            >
              Close
            </Button>
            <Button
              bg="linear-gradient(135deg, #ef4444, #dc2626)"
              color="white"
              fontWeight="700"
              onClick={() => handleRemove(user)}
              isLoading={removingUser}
              _hover={{
                bg: "linear-gradient(135deg, #dc2626, #b91c1c)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(239,68,68,0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.3s ease"
              borderRadius="lg"
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <style>{`
        @keyframes slideIn {
          from {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default UpdateGroupChatModal;