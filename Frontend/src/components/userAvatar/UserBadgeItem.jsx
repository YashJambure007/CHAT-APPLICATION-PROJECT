import { CloseIcon } from "@chakra-ui/icons";
import { Badge, Box } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize="12px"
      colorScheme="purple"
      cursor="pointer"
      display="flex"
      alignItems="center"
      gap={1}
      onClick={handleFunction}
    >
      {user.name}

      {admin?._id === user._id && (
        <Box as="span" fontSize="10px" ml={1}>
          (Admin)
        </Box>
      )}

      <CloseIcon fontSize="10px" />
    </Badge>
  );
};

export default UserBadgeItem;
