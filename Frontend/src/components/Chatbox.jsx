import { Box } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDirection="column"          // ✅ IMPORTANT (not alignItems)
      p={3}
      bg="rgba(10,14,20,0.85)"
      w={{ base: "100%", md: "68%" }}

      /* ✅ SAME HEIGHT AS SIDEBAR */
      h="100%"                        // 🔥 KEY FIX (not vh here)

      borderRadius="2xl"
      boxShadow="0 18px 40px rgba(2,6,23,0.65)"

      /* ✅ PREVENT CHAT FROM EXPANDING */
      overflow="hidden"
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  );
};

export default Chatbox;
