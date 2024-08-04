// src/components/ChatArea.jsx
import { useState, useEffect, useRef } from 'react';

function ChatArea({ messages, onSendMessage, currentUser, selectedUser }) {
    const [messageInput, setMessageInput] = useState('');
    const chatAreaRef = useRef(null);

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (messageInput.trim() && selectedUser) {
            onSendMessage(messageInput.trim());
            setMessageInput('');
        }
    };

    return (
        <div className="chat-area">
            <div className="chat-area" id="chat-messages" ref={chatAreaRef}>
                {messages.map((msg, index) => (
                    <div key={msg.id || index} className={`message ${msg.senderId === currentUser.nickname ? 'sender' : 'receiver'}`}>
                        <p>{msg.content}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className={selectedUser ? '' : 'hidden'}>
                <div className="message-input">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        autoComplete="off"
                    />
                    <button type="submit">Send</button>
                </div>
            </form>
        </div>
    );
}

export default ChatArea;