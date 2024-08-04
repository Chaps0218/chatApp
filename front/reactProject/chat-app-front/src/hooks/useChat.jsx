// src/hooks/useChat.js

import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const SOCKET_URL = 'http://localhost:8080/chat-websocket';

export function useChat(user) {
  const [stompClient, setStompClient] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    if (user) {
      const socket = new SockJS(SOCKET_URL);
      const client = Stomp.over(socket);

      client.connect({}, () => {
        setStompClient(client);

        client.subscribe(`/user/${user.nickname}/queue/messages`, onMessageReceived);
        client.subscribe('/user/public', onMessageReceived);

        client.send("/app/user.addUser", {},
          JSON.stringify({ nickName: user.nickname, fullName: user.fullname, status: 'ONLINE' })
        );

        fetchConnectedUsers();
      }, onError);
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [user]);

  const fetchConnectedUsers = useCallback(async () => {
    const response = await fetch('http://localhost:8080/users');
    const users = await response.json();
    setConnectedUsers(users.filter(u => u.nickName !== user.nickname));
  }, [user]);

  const fetchMessagesForUser = useCallback(async (userId) => {
    if (userId) {
      const response = await fetch(`http://localhost:8080/messages/${user.nickname}/${userId}`);
      const fetchedMessages = await response.json();
      setMessages(prev => ({ ...prev, [userId]: fetchedMessages }));
      // Reset unread messages for this user
      setUnreadMessages(prev => ({ ...prev, [userId]: false }));
    } else {
      setMessages({});
    }
  }, [user.nickname]);

  const selectUser = useCallback((userId) => {
    if (selectedUserId === userId) {
      // If the same user is clicked, just reset the unread messages status
      setUnreadMessages(prev => ({ ...prev, [userId]: false }));
    } else {
      setSelectedUserId(userId);
      fetchMessagesForUser(userId);
    }
  }, [fetchMessagesForUser, selectedUserId]);

  const sendMessage = useCallback((content) => {
    if (stompClient && selectedUserId) {
      const chatMessage = {
        senderId: user.nickname,
        recipientId: selectedUserId,
        content: content,
        timestamp: new Date().toISOString()
      };

      stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));

      // Add the sent message to the current chat
      setMessages(prev => ({
        ...prev,
        [selectedUserId]: [...(prev[selectedUserId] || []), chatMessage]
      }));
    } else {
      console.error("Cannot send message: No connection or recipient selected");
    }
  }, [stompClient, selectedUserId, user.nickname]);

  const onMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);
    console.log('Received message:', message);

    // Determine the chat ID based on sender or recipient
    const chatId = message.senderId === user.nickname ? message.recipientId : message.senderId;

    // Update messages for the correct chat
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      // Avoid adding duplicate messages
      const messageExists = chatMessages.some(m =>
        m.senderId === message.senderId &&
        m.content === message.content &&
        m.timestamp === message.timestamp
      );

      if (!messageExists) {
        return {
          ...prev,
          [chatId]: [...chatMessages, message]
        };
      }
      return prev;
    });

    // Mark messages as unread for the user who is not currently selected
    if (message.recipientId === user.nickname && message.senderId !== selectedUserId) {
      setUnreadMessages(prev => ({
        ...prev,
        [message.senderId]: true
      }));
    }

    fetchConnectedUsers();
  }, [fetchConnectedUsers, user.nickname, selectedUserId]);

  const onError = useCallback((error) => {
    console.error('WebSocket error:', error);
  }, []);

  const logout = useCallback(() => {
    if (stompClient) {
      stompClient.send("/app/user.disconnectUser", {},
        JSON.stringify({ nickName: user.nickname, fullName: user.fullname, status: 'OFFLINE' })
      );
      stompClient.disconnect();
    }
    window.location.reload();
  }, [stompClient, user]);

  return {
    connectedUsers,
    messages: messages[selectedUserId] || [],
    sendMessage,
    logout,
    selectUser,
    unreadMessages
  };
}
