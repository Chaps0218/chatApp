// src/components/UsersList.jsx
import { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

function UsersList({ users, onSelectUser, currentUser, onLogout }) {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { logout } = useChat(currentUser);

    useEffect(() => {
        if (users.length > 0 && !selectedUserId) {
            setSelectedUserId(users[0].nickName);
            onSelectUser(users[0]);
        }
    }, [users, selectedUserId, onSelectUser]);

    const handleUserClick = (user) => {
        setSelectedUserId(user.nickName);
        onSelectUser(user);
    };

    function salir() {
        logout();
        onLogout();
    }

    return (
        <div className="users-list">
            <div className="users-list-container">
                <h2>Online Users</h2>
                <ul id="connectedUsers">
                    {users.map((user) => (
                        <li
                            key={user.nickName}
                            className={`user-item ${selectedUserId === user.nickName ? 'active' : ''}`}
                            onClick={() => handleUserClick(user)}
                        >
                            <img src="./user_icon.png" alt={user.fullName} />
                            <span>{user.fullName}</span>
                            <span className="nbr-msg hidden">0</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <p id="connected-user-fullname">{currentUser.fullname}</p>
                <a className="logout" href="#" onClick={salir}>Logout</a>
            </div>
        </div>
    );
}

export default UsersList;