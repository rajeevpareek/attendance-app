import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import { type User, UserRole } from './types';
import * as api from './api';
import LoadingSpinner from './components/LoadingSpinner';

interface LoginData {
  user: User;
  token: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const user = await api.getSelf();
        setCurrentUser(user);
      } catch (error) {
        console.error("Session token is invalid, logging out.", error);
        localStorage.removeItem('authToken');
        setCurrentUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLoginSuccess = useCallback(({ user, token }: LoginData) => {
    localStorage.setItem('authToken', token);
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    if (!currentUser) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentUser.role) {
      case UserRole.STAFF:
        return <StaffDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        // This case should ideally not be reached if currentUser is set
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