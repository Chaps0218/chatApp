// src/components/ChatRoom.jsx
import { useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatArea from "./ChatArea";
import UsersList from "./UsersList";

function ChatRoom({ user, onLogout }) {
  const { connectedUsers, messages, sendMessage, selectUser } = useChat(user);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    selectUser(user.nickName);
  };

  return (
    <div className="chat-container">
      <UsersList
        users={connectedUsers}
        onSelectUser={handleSelectUser}
        currentUser={user}
        onLogout={onLogout}
      />
      <ChatArea
        messages={messages}
        onSendMessage={sendMessage}
        currentUser={user}
        selectedUser={selectedUser}
      />
    </div>
  );
}

export default ChatRoom;
