
import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import { type User, UserRole } from './types';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Persist login state across page reloads
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      const user = MOCK_USERS.find(u => u.id === parseInt(loggedInUserId));
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('loggedInUserId', user.id.toString());
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('loggedInUserId');
  }, []);

  const renderContent = () => {
    if (!currentUser) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentUser.role) {
      case UserRole.STAFF:
        return <StaffDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
