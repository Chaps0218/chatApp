import { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

function UsersList({ users, rooms, onSelectUser, onSelectRoom, onCreateRoom, onAddParticipants, currentUser, onLogout, unreadMessages }) {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [newRoomId, setNewRoomId] = useState('');
    const [roomToAddParticipants, setRoomToAddParticipants] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [showAddParticipants, setShowAddParticipants] = useState(false);
    const { logout, selectUser } = useChat(currentUser);

    useEffect(() => {
        if (users.length > 0 && !selectedUserId && !selectedRoomId) {
            setSelectedUserId(users[0].nickName);
            onSelectUser(users[0]);
        }
    }, [users, selectedUserId, selectedRoomId, onSelectUser]);

    const handleUserClick = (user) => {
        setSelectedUserId(user.nickName);
        setSelectedRoomId(null);
        onSelectUser(user);
        selectUser(user.nickName);
    };

    const handleRoomClick = (room) => {
        setSelectedRoomId(room.roomId);
        setSelectedUserId(null);
        onSelectRoom(room);
    };

    const handleCreateRoom = (e) => {
        e.preventDefault();
        onCreateRoom(newRoomId);
        setNewRoomId('');
    };

    const handleAddParticipants = (e) => {
        e.preventDefault();
        onAddParticipants(roomToAddParticipants, selectedParticipants);
        setRoomToAddParticipants('');
        setSelectedParticipants([]);
        setShowAddParticipants(false);
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
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
                            {unreadMessages[user.nickName] > 0 && (
                                <span className="new-message-icon"></span>
                            )}
                        </li>
                    ))}
                </ul>

                <h2>Rooms</h2>
                <ul id="roomsList">
                    {rooms.map((room) => (
                        <li
                            key={room.roomId}
                            className={`room-item ${selectedRoomId === room.roomId ? 'active' : ''}`}
                            onClick={() => handleRoomClick(room)}
                        >
                            {room.roomId}
                        </li>
                    ))}
                </ul>

                <h2>Create Room</h2>
                <form id="createRoomForm" onSubmit={handleCreateRoom}>
                    <input
                        type="text"
                        id="roomId"
                        value={newRoomId}
                        onChange={(e) => setNewRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        required
                    />
                    <button type="submit">Create Room</button>
                </form>

                <h2>Add Participants</h2>
                <button onClick={() => setShowAddParticipants(!showAddParticipants)}>
                    {showAddParticipants ? 'Hide' : 'Show'} Add Participants Form
                </button>
                {showAddParticipants && (
                    <form id="addParticipantsForm" onSubmit={handleAddParticipants}>
                        <input
                            type="text"
                            id="roomToAddParticipants"
                            value={roomToAddParticipants}
                            onChange={(e) => setRoomToAddParticipants(e.target.value)}
                            placeholder="Enter room ID"
                            required
                        />
                        <ul id="availableUsersList">
                            {users.map((user) => (
                                <li
                                    key={user.nickName}
                                    className={`available-user ${selectedParticipants.includes(user.nickName) ? 'active' : ''}`}
                                    onClick={() => toggleParticipant(user.nickName)}
                                >
                                    {user.fullName}
                                </li>
                            ))}
                        </ul>
                        <button type="submit">Add Participants</button>
                    </form>
                )}
            </div>
            <div>
                <p id="connected-user-fullname">{currentUser.fullname}</p>
                <a className="logout" href="#" onClick={salir}>Logout</a>
            </div>
        </div>
    );
}

export default UsersList;
