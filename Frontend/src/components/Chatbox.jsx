import { Box } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDirection="column"    
      p={3}
      bg="rgba(10,14,20,0.85)"
      w={{ base: "100%", md: "68%" }}

      h="100%"                  

      borderRadius="2xl"
      boxShadow="0 18px 40px rgba(2,6,23,0.65)"

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
