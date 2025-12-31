import {
  Button,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  Box,
  Text,
  Heading,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider.jsx";
import { Eye, EyeOff, LogIn, User2, Sparkles } from "lucide-react";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { setUser } = ChatState();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="relative"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient:
          "linear(to-br, #0f172a, #020617, #1e293b, #0f172a)",
        // animated gradient background
        backgroundSize: "300% 300%",
        animation: "gradientShift 18s ease infinite",
        zIndex: -2,
      }}
      _after={{
        content: '""',
        position: "absolute",
        width: "600px",
        height: "600px",
        bgGradient:
          "radial(circle at 10% 20%, rgba(236,72,153,0.45), transparent 60%), radial(circle at 80% 80%, rgba(59,130,246,0.4), transparent 55%)",
        filter: "blur(6px)",
        zIndex: -1,
      }}
    >
      {/* subtle floating 3D glow orb */}
      <Box
        position="absolute"
        top="10%"
        right="15%"
        boxSize="180px"
        borderRadius="full"
        bgGradient="radial(circle, rgba(251,113,133,0.3), transparent 60%)"
        filter="blur(3px)"
        animation="floatOrb 8s ease-in-out infinite"
        opacity={0.8}
        zIndex={-1}
      />

      {/* glassmorphism card */}
      <Box
        maxW="400px"
        w="full"
        mx={4}
        bg="rgba(15,23,42,0.65)"
        borderRadius="2xl"
        border="1px solid rgba(148,163,184,0.4)"
        boxShadow="0 25px 80px rgba(15,23,42,0.9)"
        backdropFilter="blur(24px)"
        p={8}
        transform="translateY(0) translateZ(0)"
        transition="all 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
        _hover={{
          transform: "translateY(-6px) translateZ(20px) scale(1.01)",
          boxShadow: "0 35px 100px rgba(15,23,42,1)",
          borderColor: "rgba(236,72,153,0.7)",
        }}
      >
        <HStack mb={6} spacing={3} align="center">
          <Box
            boxSize="40px"
            borderRadius="xl"
            bgGradient="linear(to-br, pink.400, purple.500)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 10px 25px rgba(236,72,153,0.6)"
            transform="rotate(-8deg)"
          >
            <Sparkles size={22} color="#f9fafb" />
          </Box>
          <Box>
            <Heading
              as="h2"
              size="md"
              color="gray.100"
              letterSpacing="wide"
            >
              Welcome back
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Sign in to continue your conversations.
            </Text>
          </Box>
        </HStack>

        <VStack spacing="18px" align="stretch">
          <FormControl isRequired>
            <FormLabel color="gray.200" fontSize="sm">
              Email address
            </FormLabel>
            <InputGroup>
              <Input
                value={email}
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                bg="rgba(15,23,42,0.75)"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: "pink.400" }}
                _focus={{
                  borderColor: "pink.400",
                  boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                  bg: "rgba(15,23,42,0.95)",
                }}
                color="gray.100"
                fontSize="sm"
                height="44px"
              />
              <InputRightElement pointerEvents="none">
                <User2 size={18} color="#9ca3af" />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.200" fontSize="sm">
              Password
            </FormLabel>
            <InputGroup>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Enter your password"
                bg="rgba(15,23,42,0.75)"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: "pink.400" }}
                _focus={{
                  borderColor: "pink.400",
                  boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                  bg: "rgba(15,23,42,0.95)",
                }}
                color="gray.100"
                fontSize="sm"
                height="44px"
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClick}
                  p={0}
                  minW="auto"
                  _hover={{ bg: "transparent", transform: "scale(1.05)" }}
                  _active={{ bg: "transparent", transform: "scale(0.97)" }}
                >
                  {show ? (
                    <EyeOff size={18} color="#e5e7eb" />
                  ) : (
                    <Eye size={18} color="#e5e7eb" />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Use at least 6 characters for a strong password.
            </Text>
          </FormControl>

          <Button
            width="100%"
            mt={2}
            onClick={submitHandler}
            isLoading={loading}
            colorScheme="pink"
            borderRadius="full"
            height="46px"
            fontWeight="semibold"
            leftIcon={<LogIn size={18} />}
            bgGradient="linear(to-r, pink.500, purple.500)"
            _hover={{
              bgGradient: "linear(to-r, pink.400, purple.400)",
              transform: "translateY(-1px)",
              boxShadow: "0 18px 40px rgba(236,72,153,0.55)",
            }}
            _active={{
              transform: "translateY(0px)",
              boxShadow: "0 10px 25px rgba(236,72,153,0.45)",
            }}
          >
            Login
          </Button>

          <HStack py={2}>
            <Divider borderColor="whiteAlpha.300" />
            <Text fontSize="xs" color="gray.500">
              or
            </Text>
            <Divider borderColor="whiteAlpha.300" />
          </HStack>

          <Button
            variant="outline"
            width="100%"
            borderRadius="full"
            height="44px"
            onClick={() => {
              setEmail("guest@example.com");
              setPassword("123456");
            }}
            borderColor="whiteAlpha.400"
            color="gray.100"
            _hover={{
              borderColor: "pink.400",
              bg: "whiteAlpha.100",
              transform: "translateY(-1px)",
            }}
            _active={{
              transform: "translateY(0px)",
            }}
          >
            Get guest user credentials
          </Button>

          <Text
            fontSize="xs"
            color="gray.500"
            textAlign="center"
            mt={2}
          >
            Secured with end‑to‑end encryption for your conversations.
          </Text>
        </VStack>
      </Box>

      {/* keyframes injected via global style (can be moved to theme.css) */}
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floatOrb {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(-10px, 20px, 20px) scale(1.08); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;
