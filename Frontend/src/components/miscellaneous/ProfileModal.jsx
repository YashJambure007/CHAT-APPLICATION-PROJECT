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
  IconButton,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  Box,
  Tooltip,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!user) return null;

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <Tooltip label="View Profile" placement="bottom">
          <IconButton
            aria-label="View Profile"
            icon={<ViewIcon />}
            display={{ base: "flex" }}
            onClick={onOpen}
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
          />
        </Tooltip>
      )}

      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />

        <ModalContent
          bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          color="white"
          border="1px solid rgba(30,64,175,0.3)"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0,0,0,0.5)"
          overflow="hidden"
          animation="slideIn 0.4s ease-out"
        >
          <Box
            bgGradient="linear(to-r, #38BDF8, #0EA5E9)"
            py={6}
            display="flex"
            justifyContent="center"
            position="relative"
          >
            <ModalHeader
              fontSize="28px"
              fontWeight="900"
              display="flex"
              justifyContent="center"
              letterSpacing="-0.5px"
              p={0}
            >
              {user.name}
            </ModalHeader>
            <ModalCloseButton
              color="white"
              _hover={{ bg: "rgba(0,0,0,0.2)" }}
              position="absolute"
              right={2}
              top={2}
            />
          </Box>

          <ModalBody py={8}>
            <VStack spacing={6} alignItems="center">
              <Box
                position="relative"
                display="inline-block"
                transition="all 0.3s ease"
                _hover={{
                  transform: "scale(1.05)",
                }}
              >
                <Image
                  borderRadius="full"
                  boxSize="160px"
                  src={user.pic}
                  alt={user.name}
                  border="4px solid rgba(30,64,175,0.5)"
                  boxShadow="0 10px 30px rgba(56,189,248,0.3)"
                  objectFit="cover"
                />
                <Badge
                  position="absolute"
                  bottom={0}
                  right={0}
                  bg="linear-gradient(135deg, #38BDF8, #0EA5E9)"
                  color="white"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="bold"
                  boxShadow="0 4px 12px rgba(56,189,248,0.4)"
                >
                  👤 User
                </Badge>
              </Box>

              <Divider borderColor="rgba(30,64,175,0.2)" />

              <VStack spacing={2} w="100%">
                <HStack
                  spacing={3}
                  w="100%"
                  bg="rgba(30,64,175,0.1)"
                  p={4}
                  borderRadius="lg"
                  border="1px solid rgba(30,64,175,0.2)"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w={10}
                    h={10}
                    bg="rgba(56,189,248,0.2)"
                    borderRadius="full"
                    fontSize="lg"
                  >
                    ✉️
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontSize="xs" color="gray.400" fontWeight="600">
                      Email Address
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="white"
                      wordBreak="break-all"
                    >
                      {user.email}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <HStack spacing={2} w="100%" justify="center" pt={2}>
                <Badge
                  bg="rgba(16,185,129,0.2)"
                  color="#10b981"
                  fontSize="xs"
                  fontWeight="600"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  border="1px solid rgba(16,185,129,0.3)"
                >
                  🟢 Active
                </Badge>
                <Badge
                  bg="rgba(56,189,248,0.2)"
                  color="#38BDF8"
                  fontSize="xs"
                  fontWeight="600"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  border="1px solid rgba(56,189,248,0.3)"
                >
                  ⭐ Member
                </Badge>
              </HStack>
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
              bg="linear-gradient(135deg, #38BDF8, #0EA5E9)"
              color="white"
              fontWeight="700"
              onClick={onClose}
              _hover={{
                bg: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(30,64,175,0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.3s ease"
              borderRadius="lg"
            >
              Done
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

export default ProfileModal;
