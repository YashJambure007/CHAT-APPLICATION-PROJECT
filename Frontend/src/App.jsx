import "./App.css";
import Homepage from "./Pages/Homepage.jsx";
import Chatpage from "./Pages/Chatpage.jsx";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { ChatState } from "./Context/ChatProvider";

function App() {
  const { user } = ChatState();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/chats" && !user) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, user, navigate]);

  return (
    <div className="App">
      <Routes>
        {/* LOGIN / SIGNUP */}
        <Route path="/" element={<Homepage />} />

        {/* CHAT */}
        <Route
          path="/chats"
          element={user ? <Chatpage /> : <Navigate to="/" replace />}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FOOTER */}
      <Box
        textAlign="center"
        py={3}
        mt={2}
        fontSize="sm"
        color="gray.300"
        bg="rgba(15,23,42,0.9)"
        width="100%"
        borderRadius="xl"
      >
        © {new Date().getFullYear()} NexaChat · Designed & Developed by Yash Jambure
      </Box>
    </div>
  );
}

export default App;
