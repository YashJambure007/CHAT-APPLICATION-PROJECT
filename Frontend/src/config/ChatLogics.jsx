export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1]?.sender?._id === m?.sender?._id &&
    m?.sender?._id !== userId
  ) {
    return 33;
  } else if (
    (i < messages.length - 1 &&
      messages[i + 1]?.sender?._id !== m?.sender?._id &&
      m?.sender?._id !== userId) ||
    (i === messages.length - 1 && m?.sender?._id !== userId)
  ) {
    return 0;
  } else {
    return "auto";
  }
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    messages[i + 1]?.sender?._id !== m?.sender?._id &&
    m?.sender?._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[i]?.sender?._id !== userId &&
    messages[i]?.sender?._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1]?.sender?._id === m?.sender?._id;
};

export const getSender = (loggedUser, users = []) => {
  if (!loggedUser || users.length < 2) return "";

  return users[0]?._id === loggedUser?._id
    ? users[1]?.name
    : users[0]?.name;
};

export const getSenderFull = (loggedUser, users = []) => {
  if (!loggedUser || users.length < 2) return null;

  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
};

/**
 * ✅ READ RECEIPT HELPER
 * Returns true if all other users have read the message
 */
export const isMessageSeenByAll = (message, loggedUser, chat) => {
  if (!message?.readBy || !chat?.users) return false;

  const otherUsers = chat.users.filter(
    (u) => u._id !== loggedUser._id
  );

  return otherUsers.every((u) =>
    message.readBy.some(
      (readerId) => readerId.toString() === u._id.toString()
    )
  );
};
