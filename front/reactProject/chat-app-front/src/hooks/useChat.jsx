// src/hooks/useChat.js

import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const SOCKET_URL = 'http://localhost:8080/chat-websocket';

export function useChat(user) {
    const [stompClient, setStompClient] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [messages, setMessages] = useState({});
    const [unreadMessages, setUnreadMessages] = useState({});

    useEffect(() => {
        if (user) {
            const socket = new SockJS(SOCKET_URL);
            const client = Stomp.over(socket);

            client.connect(
                {},
                () => {
                    setStompClient(client);

                    client.subscribe(
                        `/user/${user.nickname}/queue/messages`,
                        onMessageReceived
                    );
                    client.subscribe("/user/public", onMessageReceived);
                    client.subscribe(`/user/${user.nickname}/queue/rooms`, onRoomUpdated);
                    client.subscribe(`/topic/rooms/${user.nickname}`, onRoomUpdated);

                    client.send(
                        "/app/user.addUser",
                        {},
                        JSON.stringify({
                            nickName: user.nickname,
                            fullName: user.fullname,
                            status: "ONLINE",
                        })
                    );

                    fetchConnectedUsers();
                    fetchUserRooms();
                },
                onError
            );
        }

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [user]);

    const fetchConnectedUsers = useCallback(async () => {
        const response = await fetch("http://localhost:8080/users");
        const users = await response.json();
        setConnectedUsers(users.filter((u) => u.nickName !== user.nickname));
    }, [user]);

    const fetchUserRooms = useCallback(async () => {
        const response = await fetch(`http://localhost:8080/user/${user.nickname}/rooms`);
        const userRooms = await response.json();
        setRooms(userRooms);
    }, [user.nickname]);

    const fetchMessagesForUser = useCallback(
        async (userId) => {
            if (userId) {
                const response = await fetch(
                    `http://localhost:8080/messages/${user.nickname}/${userId}`
                );
                const fetchedMessages = await response.json();
                setMessages((prev) => ({ ...prev, [userId]: fetchedMessages }));
                setUnreadMessages(prev => ({ ...prev, [userId]: 0 }));
            }
        },
        [user.nickname]
    );

    const fetchMessagesForRoom = useCallback(
        async (roomId) => {
            if (roomId) {
                const response = await fetch(
                    `http://localhost:8080/messages/rooms/${roomId}`
                );
                const fetchedMessages = await response.json();
                setMessages((prev) => ({ ...prev, [roomId]: fetchedMessages }));
            }
        },
        []
    );

    const selectUser = useCallback(
        (userId) => {
            setSelectedUserId(userId);
            setSelectedRoomId(null);
            fetchMessagesForUser(userId);
            setUnreadMessages(prev => ({ ...prev, [userId]: 0 }));
        },
        [fetchMessagesForUser]
    );

    const selectRoom = useCallback(
        (roomId) => {
            setSelectedRoomId(roomId);
            setSelectedUserId(null);
            fetchMessagesForRoom(roomId);
        },
        [fetchMessagesForRoom]
    );

    const sendMessage = useCallback(
        (content) => {
            if (stompClient && (selectedUserId || selectedRoomId)) {
                const chatMessage = {
                    senderId: user.nickname,
                    content: content,
                    timestamp: new Date().toISOString(),
                };

                if (selectedUserId) {
                    chatMessage.recipientId = selectedUserId;
                    stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
                } else if (selectedRoomId) {
                    stompClient.send(`/app/messages/rooms/${selectedRoomId}`, {}, JSON.stringify(chatMessage));
                }

                setMessages((prev) => {
                    const chatId = selectedUserId || selectedRoomId;
                    return {
                        ...prev,
                        [chatId]: [...(prev[chatId] || []), chatMessage],
                    };
                });
            }
        },
        [stompClient, selectedUserId, selectedRoomId, user.nickname]
    );

    const onMessageReceived = useCallback(
        (payload) => {
            const message = JSON.parse(payload.body);
            console.log("Received message:", message);
            const chatId = message.roomId || (message.senderId === user.nickname ? message.recipientId : message.senderId);

            setMessages((prev) => {

                const chatMessages = prev[chatId] || [];

                const messageExists = chatMessages.some(
                    (m) =>
                        m.senderId === message.senderId &&
                        m.content === message.content &&
                        m.timestamp === message.timestamp
                );

                if (!messageExists) {
                    return {
                        ...prev,
                        [chatId]: [...chatMessages, message],
                    };
                }
                return prev;
            });

            setUnreadMessages(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }));

            fetchConnectedUsers();
        },
        [fetchConnectedUsers, user.nickname]
    );

    const onRoomUpdated = useCallback(() => {
        fetchUserRooms();
    }, [fetchUserRooms]);

    const createRoom = useCallback(
        (roomId) => {
            if (stompClient) {
                const roomData = {
                    roomId: roomId,
                    creatorId: user.nickname
                };
                stompClient.send("/app/group/create", {}, JSON.stringify(roomData));
            }
        },
        [stompClient, user.nickname]
    );

    const addParticipants = useCallback(
        (roomId, participants) => {
            if (stompClient) {
                participants.forEach(userId => {
                    stompClient.send(`/app/group/${roomId}/${userId}`, {}, JSON.stringify({}));
                });
            }
        },
        [stompClient]
    );

    const onError = useCallback((error) => {
        console.error("WebSocket error:", error);
    }, []);

    const logout = useCallback(() => {
        if (stompClient) {
            stompClient.send(
                "/app/user.disconnectUser",
                {},
                JSON.stringify({
                    nickName: user.nickname,
                    fullName: user.fullname,
                    status: "OFFLINE",
                })
            );
            stompClient.disconnect();
        }
    }, [stompClient, user]);

    return {
        connectedUsers,
        rooms,
        messages: messages[selectedUserId] || messages[selectedRoomId] || [],
        unreadMessages,
        sendMessage,
        logout,
        selectUser,
        selectRoom,
        createRoom,
        addParticipants,
    };
}
