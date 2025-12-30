import {
  Box,
  Button,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
  Tooltip,
  Avatar,
  AvatarBadge,
  Spinner,
  useDisclosure,
  useToast,
  Badge,
  VStack,
  HStack,
  Flex,
  List,
  ListItem,
} from "@chakra-ui/react";
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import ChatLoading from "../ChatLoading.jsx";
import ProfileModal from "./ProfileModal.jsx";
import UserListItem from "../userAvatar/UserListItem.jsx";
import { getSender } from "../../config/ChatLogics.jsx";
import { ChatState } from "../../Context/ChatProvider.jsx";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const logoutHandler = () => {
    toast({
      title: "Logging out...",
      status: "info",
      duration: 1500,
      isClosable: true,
      position: "bottom-right",
    });
    setTimeout(() => {
      localStorage.removeItem("userInfo");
      navigate("/");
    }, 500);
  };

  // REAL-TIME SEARCH
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSearchResult([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      setShowSuggestions(true);

      const { data } = await axios.get(`/api/user?search=${value}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Search error",
        description: "Failed to search users",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      toast({
        title: "Please enter something to search",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    setShowSuggestions(true);
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await axios.post(
        "/api/chat",
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setSearch("");
      setSearchResult([]);
      setShowSuggestions(false);
      onClose();

      toast({
        title: "Chat opened",
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      toast({
        title: "Error opening chat",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="linear-gradient(120deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))"
        backdropFilter="blur(15px)"
        borderRadius="20px"
        w="100%"
        p="12px 18px"
        mt={2}
        mb={2}
        boxShadow="0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
        border="1px solid rgba(30,64,175,0.3)"
        position="relative"
        zIndex={10}
        animation="slideInDown 0.6s ease-out"
      >
        <Tooltip label="Search Users" hasArrow placement="bottom-end">
          <Button
            variant="ghost"
            onClick={onOpen}
            leftIcon={<SearchIcon />}
            color="white"
            fontWeight="600"
            fontSize={{ base: "sm", md: "md" }}
            _hover={{
              bg: "rgba(255,255,255,0.1)",
              transform: "translateY(-2px)",
            }}
            transition="all 0.3s ease"
          >
            <Text display={{ base: "none", md: "flex" }}>Search User</Text>
          </Button>
        </Tooltip>

        <Box display="flex" flexDir="column" alignItems="center" gap={0.5}>
          <Text
            fontSize="28px"
            fontWeight="900"
            bgGradient="linear(to-r, #38BDF8, #0EA5E9)"
            bgClip="text"
            textShadow="0 0 20px rgba(56,189,248,0.3)"
            letterSpacing="-1px"
          >
            NexaChat
          </Text>
        </Box>

        <HStack spacing={3} flex={1} justify="flex-end">
          {/* NOTIFICATIONS */}
          <Menu>
            <Tooltip
              label={`${notification.length} unread messages`}
              hasArrow
              placement="bottom"
            >
              <MenuButton
                as={Box}
                position="relative"
                cursor="pointer"
                _hover={{ transform: "scale(1.1)" }}
                transition="all 0.2s ease"
              >
                <BellIcon fontSize="2xl" color="white" />
                {notification.length > 0 && (
                  <Box
                    position="absolute"
                    top="-1"
                    right="-1"
                    bg="linear-gradient(135deg, #ef4444, #dc2626)"
                    color="white"
                    borderRadius="full"
                    fontSize="xs"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    border="2px solid rgba(15,23,42,0.9)"
                    boxShadow="0 0 10px rgba(239,68,68,0.6)"
                    animation="glow 2s infinite"
                  >
                    {notification.length > 9 ? "9+" : notification.length}
                  </Box>
                )}
              </MenuButton>
            </Tooltip>

            <MenuList
              bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
              color="white"
              border="1px solid rgba(30,64,175,0.3)"
              boxShadow="0 20px 60px rgba(0,0,0,0.5)"
              zIndex={2000}
              minW="320px"
              maxH="400px"
              overflowY="auto"
              borderRadius="lg"
              css={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(30,64,175,0.1)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(30,64,175,0.4)",
                  borderRadius: "3px",
                },
              }}
            >
              {!notification.length && (
                <MenuItem
                  bg="transparent"
                  color="gray.400"
                  _hover={{ bg: "rgba(255,255,255,0.05)" }}
                  isDisabled
                  justifyContent="center"
                  py={4}
                >
                  <VStack spacing={1}>
                    <Text fontSize="2xl">🎉</Text>
                    <Text fontSize="sm" fontWeight="500">
                      No new messages
                    </Text>
                  </VStack>
                </MenuItem>
              )}

              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  bg="transparent"
                  color="white"
                  _hover={{
                    bg: "rgba(30,64,175,0.3)",
                    borderLeft: "3px solid #38BDF8",
                    paddingLeft: "calc(16px - 3px)",
                  }}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                  py={3}
                  px={3}
                  transition="all 0.2s ease"
                  borderLeft="3px solid transparent"
                  display="flex"
                  flexDir="column"
                  gap={1}
                >
                  <HStack spacing={2} justify="space-between" w="100%">
                    <Text fontWeight="600" fontSize="sm" flex={1}>
                      {notif.chat.isGroupChat
                        ? notif.chat.chatName
                        : getSender(user, notif.chat.users)}
                    </Text>
                    <Badge
                      bg="linear-gradient(135deg, #38BDF8, #0EA5E9)"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      borderRadius="full"
                      px={2}
                    >
                      New
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.300" noOfLines={1}>
                    {notif.chat.isGroupChat
                      ? `New message in ${notif.chat.chatName}`
                      : `New message from ${getSender(user, notif.chat.users)}`}
                  </Text>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* PROFILE MENU */}
          <Menu>
            <Tooltip
              label={`${user?.name || "User"}`}
              hasArrow
              placement="bottom"
            >
              <MenuButton
                as={Box}
                cursor="pointer"
                borderRadius="full"
                transition="all 0.3s ease"
                _hover={{ transform: "scale(1.05)" }}
              >
                <Avatar
                  size="sm"
                  name={user?.name || "User"}
                  src={user?.pic}
                  border="2px solid rgba(30,64,175,0.5)"
                  _hover={{
                    borderColor: "rgba(30,64,175,0.9)",
                    boxShadow: "0 0 15px rgba(30,64,175,0.3)",
                  }}
                  transition="all 0.3s ease"
                >
                  <AvatarBadge boxSize="1.2em" bg="#10b981" />
                </Avatar>
              </MenuButton>
            </Tooltip>

            <MenuList
              bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
              color="white"
              border="1px solid rgba(30,64,175,0.3)"
              boxShadow="0 20px 60px rgba(0,0,0,0.5)"
              zIndex={2000}
              borderRadius="lg"
            >
              <Box
                px={4}
                py={3}
                borderBottom="1px solid rgba(30,64,175,0.2)"
                bg="rgba(30,64,175,0.1)"
              >
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={user?.name || "User"}
                    src={user?.pic}
                  />
                  <VStack spacing={0} align="start">
                    <Text fontWeight="700" fontSize="sm">
                      {user?.name || "User"}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {user?.email || "user@example.com"}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <ProfileModal user={user}>
                <MenuItem
                  bg="transparent"
                  _hover={{
                    bg: "rgba(30,64,175,0.3)",
                    borderLeft: "3px solid #38BDF8",
                    paddingLeft: "calc(16px - 3px)",
                  }}
                  borderLeft="3px solid transparent"
                  transition="all 0.2s ease"
                  py={2.5}
                  fontWeight="500"
                >
                  👤 My Profile
                </MenuItem>
              </ProfileModal>

              <MenuDivider borderColor="rgba(30,64,175,0.2)" my={1} />

              <MenuItem
                bg="transparent"
                color="red.300"
                _hover={{
                  bg: "rgba(239,68,68,0.15)",
                  borderLeft: "3px solid #ef4444",
                  paddingLeft: "calc(16px - 3px)",
                }}
                borderLeft="3px solid transparent"
                transition="all 0.2s ease"
                onClick={logoutHandler}
                py={2.5}
                fontWeight="500"
              >
                🚪 Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      {/* SEARCH DRAWER */}
      <Drawer
        placement="left"
        isOpen={isOpen}
        onClose={() => {
          setShowSuggestions(false);
          onClose();
        }}
        size={{ base: "full", md: "md" }}
      >
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent
          bg="linear-gradient(135deg, #0f172a 0%, #1e4db7 100%)"
          color="white"
          borderRight="1px solid rgba(30,64,175,0.3)"
          animation="slideInLeft 0.4s ease-out"
        >
          <Box
            p={4}
            borderBottom="1px solid rgba(30,64,175,0.2)"
            bg="rgba(15,23,42,0.5)"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <VStack spacing={0} align="start">
              <Text fontSize="xl" fontWeight="900" color="#38BDF8">
                🔍 Find Users
              </Text>
              <Text fontSize="xs" color="gray.400">
                Real-time suggestions as you type
              </Text>
            </VStack>
            <DrawerCloseButton position="relative" top={0} right={0} />
          </Box>

          <DrawerBody p={4} position="relative">
            {/* SEARCH INPUT */}
            <Box mb={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" pt={1}>
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Type name or email..."
                  value={search}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => search && setShowSuggestions(true)}
                  bg="rgba(255,255,255,0.05)"
                  border="1px solid rgba(30,64,175,0.3)"
                  _focus={{
                    bg: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(30,64,175,0.6)",
                    boxShadow: "0 0 0 3px rgba(30,64,175,0.2)",
                  }}
                  _placeholder={{ color: "gray.500" }}
                  color="white"
                  borderRadius="lg"
                  transition="all 0.3s ease"
                  pl={10}
                  autoFocus
                />
              </InputGroup>
            </Box>

            {/* FULL RESULTS LIST WITH DARK CARDS */}
            <VStack spacing={2} align="stretch" mt={2}>
              {loading ? (
                <Box py={8} display="flex" flexDir="column" alignItems="center">
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="rgba(255,255,255,0.1)"
                    color="#38BDF8"
                    size="lg"
                    mb={3}
                  />
                  <Text color="gray.400" fontSize="sm">
                    Searching users...
                  </Text>
                </Box>
              ) : searchResult.length > 0 ? (
                <>
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.300"
                    px={1}
                  >
                    SEARCH RESULTS ({searchResult.length})
                  </Text>

                  {searchResult.map((u) => (
                    <Box
                      key={u._id}
                      onClick={() => accessChat(u._id)}
                      cursor="pointer"
                      bg="rgba(15,23,42,0.95)"          // dark card bg
                      _hover={{
                        bg: "rgba(30,64,175,0.95)",     // blue hover
                        transform: "translateY(-2px)",
                      }}
                      borderRadius="lg"
                      border="1px solid rgba(30,64,175,0.5)"
                      p={3}
                      transition="all 0.2s ease"
                    >
                      <HStack spacing={3}>
                        <Avatar size="sm" name={u.name} src={u.pic} />
                        <VStack spacing={0} align="start">
                          <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="white"
                          >
                            {u.name}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="gray.300"
                          >
                            {u.email}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </>
              ) : search ? (
                <Box py={8} textAlign="center">
                  <Text fontSize="2xl" mb={2}>
                    🔍
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    No users found matching "{search}"
                  </Text>
                  <Text color="gray.500" fontSize="xs" mt={2}>
                    Try a different name or email
                  </Text>
                </Box>
              ) : (
                <Box py={8} textAlign="center">
                  <Text fontSize="2xl" mb={2}>
                    👥
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Start typing to search users
                  </Text>
                </Box>
              )}

              {loadingChat && (
                <Box display="flex" alignItems="center" justify="center" py={4}>
                  <Spinner
                    thickness="3px"
                    speed="0.65s"
                    emptyColor="rgba(255,255,255,0.1)"
                    color="#38BDF8"
                    size="md"
                  />
                  <Text ml={3} color="gray.300" fontSize="sm">
                    Opening chat...
                  </Text>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(56, 189, 248, 0);
          }
        }
      `}</style>
    </>
  );
}

export default SideDrawer;
