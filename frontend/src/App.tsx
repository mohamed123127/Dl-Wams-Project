import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { useState } from 'react';
import { fetchEndpoints } from './services/api';

fetchEndpoints();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const onlogin = () => {
    setIsLoggedIn(true);
  }

  return (
    <div>
      {isLoggedIn ? <Dashboard /> : <LoginPage onLogin={onlogin} />}
    </div>
  )
}

export default App
