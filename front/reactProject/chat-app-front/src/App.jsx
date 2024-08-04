import { useState } from 'react';
import UserForm from './components/UserForm';
import ChatRoom from './components/ChatRoom';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <h2>Grupo 4</h2>
      {!user ? (
        <UserForm onConnect={setUser} />
      ) : (
        <ChatRoom user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;