
import React, { useState, useCallback } from 'react';
import { type User } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = MOCK_USERS.find(u => u.phone === phone && u.pin === pin);

    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Invalid phone number or PIN. Please try again.');
    }
  }, [phone, pin, onLoginSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-gray-800 rounded-lg shadow-md">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-white">Site-Sync</h2>
          <p className="mt-2 text-center text-gray-400">Welcome back</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-300">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="1112223333"
                className="block w-full px-4 py-3 mt-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                required
              />
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm text-gray-300">PIN</label>
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                placeholder="••••"
                className="block w-full px-4 py-3 mt-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="w-full px-4 py-3 text-lg font-semibold text-white transition-colors duration-300 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
