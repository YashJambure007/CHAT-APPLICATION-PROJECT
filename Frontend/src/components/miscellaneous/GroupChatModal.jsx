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
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
  Divider,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

// ⭐⭐⭐ ADD THIS LINE HERE ⭐⭐⭐
const API_URL = window.location.hostname.includes('vercel.app') 
  ? 'https://chat-app-backend-b95z.onrender.com'  // ⚠️ REPLACE WITH YOUR RENDER URL
  : 'http://localhost:5000';

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

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
        title: "Error occurred!",
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

  const handleDelete = (delUser) => {
    setSelectedUsers(
      selectedUsers.filter((sel) => sel._id !== delUser._id)
    );
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast({
        title: "Please fill all the fields",
        description: "Chat name and at least one user are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    try {
      setCreatingChat(true);

      // ⭐⭐⭐ FIX 2: Add API_URL here ⭐⭐⭐
      const { data } = await axios.post(
        `${API_URL}/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setChats([data, ...chats]);
      onClose();
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);

      toast({
        title: "Group chat created! 🎉",
        description: `"${groupChatName}" with ${selectedUsers.length} members`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      toast({
        title: "Failed to create chat",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setCreatingChat(false);
    }
  };

  const handleClose = () => {
    setGroupChatName("");
    setSelectedUsers([]);
    setSearch("");
    setSearchResult([]);
    onClose();
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent
          bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          color="white"
          border="1px solid rgba(30,64,175,0.3)"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.5)"
        >
          <ModalHeader
            fontSize="24px"
            fontWeight="900"
            display="flex"
            justifyContent="center"
            bgGradient="linear(to-r, #38BDF8, #0EA5E9)"
            bgClip="text"
            py={4}
            borderBottom="1px solid rgba(30,64,175,0.2)"
          >
            ✨ Create Group Chat
          </ModalHeader>

          <ModalCloseButton
            _hover={{ bg: "rgba(255,255,255,0.1)" }}
            transition="all 0.2s ease"
          />

          <ModalBody py={6}>
            <VStack spacing={5}>
              {/* CHAT NAME INPUT */}
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.300"
                  mb={2}
                >
                  Group Name
                </FormLabel>
                <Input
                  placeholder="Enter group chat name"
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
                  color="white"
                  transition="all 0.3s ease"
                  fontSize="sm"
                />
              </FormControl>

              {/* SEARCH USERS INPUT */}
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.300"
                  mb={2}
                >
                  Add Users
                </FormLabel>
                <Input
                  placeholder="Search by name or email"
                  value={search}
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
                  color="white"
                  transition="all 0.3s ease"
                  fontSize="sm"
                />
              </FormControl>

              {/* SELECTED USERS BADGES */}
              {selectedUsers.length > 0 && (
                <Box
                  w="100%"
                  bg="rgba(30,64,175,0.1)"
                  p={3}
                  borderRadius="lg"
                  border="1px solid rgba(30,64,175,0.2)"
                >
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.400"
                    mb={2}
                  >
                    Selected Users ({selectedUsers.length})
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {selectedUsers.map((u) => (
                      <UserBadgeItem
                        key={u._id}
                        user={u}
                        handleFunction={() => handleDelete(u)}
                      />
                    ))}
                  </HStack>
                </Box>
              )}

              <Divider borderColor="rgba(30,64,175,0.2)" />

              {/* SEARCH RESULTS */}
              {search && (
                <Box w="100%">
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.400"
                    mb={2}
                  >
                    Search Results
                  </Text>

                  {loading ? (
                    <Box
                      display="flex"
                      flexDir="column"
                      alignItems="center"
                      py={4}
                    >
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
                  ) : searchResult.length === 0 ? (
                    <Box py={4} textAlign="center">
                      <Text fontSize="sm" color="gray.400">
                        No users found
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={1} maxH="250px" overflowY="auto">
                      {searchResult?.slice(0, 5).map((searchUser) => (
                        <Box key={searchUser._id} w="100%">
                          <UserListItem
                            user={searchUser}
                            handleFunction={() => handleGroup(searchUser)}
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
            gap={3}
            py={4}
          >
            <Button
              variant="ghost"
              onClick={handleClose}
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              fontWeight="600"
              transition="all 0.2s ease"
            >
              Cancel
            </Button>
            <Button
              bg="linear-gradient(135deg, #38BDF8, #0EA5E9)"
              color="white"
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={creatingChat}
              isDisabled={!groupChatName || selectedUsers.length === 0}
              _hover={{
                bg: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(30,64,175,0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              _disabled={{
                opacity: 0.5,
                cursor: "not-allowed",
                _hover: {
                  transform: "none",
                  boxShadow: "none",
                },
              }}
              transition="all 0.3s ease"
              borderRadius="lg"
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <style>{`
        @keyframes slideIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default GroupChatModal;