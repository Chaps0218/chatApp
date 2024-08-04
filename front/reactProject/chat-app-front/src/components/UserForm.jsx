// src/components/UserForm.jsx
import { useState } from 'react';

function UserForm({ onConnect }) {
    const [nickname, setNickname] = useState('');
    const [fullname, setFullname] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (nickname.trim() && fullname.trim()) {
            onConnect({ nickname: nickname.trim(), fullname: fullname.trim() });
        }
    };

    return (
        <div className="user-form" id="username-page">
            <h2>Enter Chatroom</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nickname">Nickname:</label>
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                />

                <label htmlFor="fullname">Real Name:</label>
                <input
                    type="text"
                    id="fullname"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                />

                <button type="submit">Enter Chatroom</button>
            </form>
        </div>
    );
}

export default UserForm;
