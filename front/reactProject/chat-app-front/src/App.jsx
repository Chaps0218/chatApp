import { useState, useEffect } from 'react';
import UserForm from './components/UserForm';
import ChatRoom from './components/ChatRoom';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };


  return (
    <div>
      <h2>Grupo 4</h2>
      {!user ? (
        <UserForm onConnect={setUser} />
      ) : (
        <ChatRoom user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;