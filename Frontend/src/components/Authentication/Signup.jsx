import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Box,
  useToast,
  Text,
} from "@chakra-ui/react";

import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Image as ImageIcon, User, Mail, Lock } from "lucide-react";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  // ================= SUBMIT =================
  const submitHandler = async () => {
    setPicLoading(true);

    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast({
        title: "Registration successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setPicLoading(false);
    }
  };

  // ================= CLOUDINARY =================
const postDetails = (file) => {
  setPicLoading(true);

  if (!file) {
    toast({
      title: "Please select an image",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setPicLoading(false);
    return;
  }

  if (file.type === "image/jpeg" || file.type === "image/png") {
    const data = new FormData();
    data.append("file", file); // ✅ MUST
    data.append("upload_preset", "nexachat-profile"); // ✅ YOUR PRESET
    data.append("cloud_name", "dy6mrm5nr"); // ✅ YOUR CLOUD

    fetch("https://api.cloudinary.com/v1_1/dy6mrm5nr/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.secure_url) {
          throw new Error("Upload failed");
        }

        setPic(data.secure_url); // ✅ USE secure_url
        setPicLoading(false);
      })
      .catch((err) => {
        console.error("Cloudinary error:", err);
        toast({
          title: "Image upload failed",
          description: "Check Cloudinary preset / cloud name",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setPicLoading(false);
      });
  } else {
    toast({
      title: "Please select a valid image (jpg/png)",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setPicLoading(false);
  }
};


  // ================= UI =================
  return (
    <Box
      bg="rgba(15,23,42,0.65)"
      p={8}
      borderRadius="2xl"
      w="100%"
      boxShadow="0 25px 80px rgba(15,23,42,0.9)"
      border="1px solid rgba(148,163,184,0.4)"
      backdropFilter="blur(24px)"
      transform="translateY(0) translateZ(0)"
      transition="all 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
      _hover={{
        transform: "translateY(-4px) translateZ(18px) scale(1.005)",
        boxShadow: "0 30px 90px rgba(15,23,42,1)",
        borderColor: "rgba(236,72,153,0.7)",
      }}
    >
      <VStack spacing="16px" align="stretch">
        <FormControl isRequired>
          <FormLabel color="gray.200" fontSize="sm">
            Name
          </FormLabel>
          <InputGroup>
            <Input
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              bg="rgba(15,23,42,0.75)"
              color="gray.100"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "pink.400" }}
              _focus={{
                borderColor: "pink.400",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                bg: "rgba(15,23,42,0.95)",
              }}
              fontSize="sm"
              height="44px"
              _placeholder={{ color: "gray.500" }}
            />
            <InputRightElement pointerEvents="none">
              <User size={18} color="#9ca3af" />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.200" fontSize="sm">
            Email address
          </FormLabel>
          <InputGroup>
            <Input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              bg="rgba(15,23,42,0.75)"
              color="gray.100"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "pink.400" }}
              _focus={{
                borderColor: "pink.400",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                bg: "rgba(15,23,42,0.95)",
              }}
              fontSize="sm"
              height="44px"
              _placeholder={{ color: "gray.500" }}
            />
            <InputRightElement pointerEvents="none">
              <Mail size={18} color="#9ca3af" />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.200" fontSize="sm">
            Password
          </FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
              bg="rgba(15,23,42,0.75)"
              color="gray.100"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "pink.400" }}
              _focus={{
                borderColor: "pink.400",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                bg: "rgba(15,23,42,0.95)",
              }}
              fontSize="sm"
              height="44px"
              _placeholder={{ color: "gray.500" }}
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
            Use at least 6 characters with letters and numbers.
          </Text>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.200" fontSize="sm">
            Confirm password
          </FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Re-enter your password"
              onChange={(e) => setConfirmpassword(e.target.value)}
              bg="rgba(15,23,42,0.75)"
              color="gray.100"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "pink.400" }}
              _focus={{
                borderColor: "pink.400",
                boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
                bg: "rgba(15,23,42,0.95)",
              }}
              fontSize="sm"
              height="44px"
              _placeholder={{ color: "gray.500" }}
            />
            <InputRightElement pointerEvents="none">
              <Lock size={18} color="#9ca3af" />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel color="gray.200" fontSize="sm">
            Upload picture
          </FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
            color="gray.300"
            bg="rgba(15,23,42,0.55)"
            borderColor="whiteAlpha.200"
            _hover={{ borderColor: "pink.400", bg: "rgba(15,23,42,0.7)" }}
            _focus={{
              borderColor: "pink.400",
              boxShadow: "0 0 0 1px rgba(236,72,153,0.6)",
              bg: "rgba(15,23,42,0.8)",
            }}
            _file={{
              cursor: "pointer",
              color: "gray.100",
              fontWeight: "medium",
              px: 4,
              py: 1,
            }}
          />
          {pic && (
            <Text fontSize="xs" color="green.300" mt={1}>
              Profile picture uploaded successfully.
            </Text>
          )}
        </FormControl>

        <Button
          width="100%"
          mt={4}
          onClick={submitHandler}
          isLoading={picLoading}
          bgGradient="linear(to-r, pink.500, purple.500)"
          color="white"
          borderRadius="full"
          fontSize="md"
          fontWeight="semibold"
          height="46px"
          leftIcon={<ImageIcon size={18} style={{ opacity: 0 }} />}
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
          Sign Up
        </Button>
      </VStack>
    </Box>
  );
};

export default Signup;
