import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login.jsx";
import Signup from "../components/Authentication/Signup.jsx";

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <Box
      minH="100vh"
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-b, #020617, #020617)"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bgGradient:
          "radial(circle at 0% 0%, rgba(129,140,248,0.18), transparent 55%), radial(circle at 100% 100%, rgba(236,72,153,0.18), transparent 55%)",
        zIndex: -2,
      }}
    >
      {/* subtle glow behind the main column */}
      <Box
        position="absolute"
        top="8%"
        left="50%"
        transform="translateX(-50%)"
        w="520px"
        h="520px"
        bgGradient="radial(circle, rgba(15,23,42,0.9), transparent 70%)"
        filter="blur(6px)"
        zIndex={-1}
      />

      <Container maxW="xl" centerContent>
        {/* brand header card */}
        <Box
          mt="40px"
          w="100%"
          p="18px"
          borderRadius="2xl"
          textAlign="center"
          bg="rgba(15,23,42,0.78)"
          backdropFilter="blur(20px)"
          boxShadow="0 26px 80px rgba(15,23,42,0.9)"
          border="1px solid rgba(148,163,184,0.45)"
        >
          <Text
            fontSize="4xl"
            fontFamily="Work sans"
            fontWeight="extrabold"
            bgGradient="linear(to-r, #60a5fa, #a78bfa)"
            bgClip="text"
          >
            NexaChat
          </Text>

          <Text fontSize="md" color="rgba(226,232,240,0.9)">
            Experience conversations in a new light.
          </Text>
        </Box>

        {/* tabs container card (login / signup) */}
        <Box
          w="100%"
          p={4}
          mt={4}
          borderRadius="2xl"
          bg="rgba(15,23,42,0.78)"
          backdropFilter="blur(20px)"
          boxShadow="0 26px 80px rgba(15,23,42,0.95)"
          border="1px solid rgba(148,163,184,0.45)"
        >
          <Tabs isFitted variant="unstyled">
            <TabList mb="1.5em">
              <Tab
                fontSize="sm"
                fontWeight="semibold"
                color="gray.400"
                _selected={{
                  color: "white",
                  bg: "rgba(15,23,42,0.9)",
                  borderRadius: "full",
                  boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                  bgGradient: "linear(to-r, rgba(236,72,153,0.15), rgba(129,140,248,0.18))",
                }}
                _hover={{ color: "gray.200" }}
                px={6}
                py={2}
              >
                Login
              </Tab>
              <Tab
                fontSize="sm"
                fontWeight="semibold"
                color="gray.400"
                _selected={{
                  color: "white",
                  bg: "rgba(15,23,42,0.9)",
                  borderRadius: "full",
                  boxShadow: "0 0 0 1px rgba(59,130,246,0.6)",
                  bgGradient: "linear(to-r, rgba(59,130,246,0.18), rgba(129,140,248,0.2))",
                }}
                _hover={{ color: "gray.200" }}
                px={6}
                py={2}
              >
                Sign Up
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
}

export default Homepage;
