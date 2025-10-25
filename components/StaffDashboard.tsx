import React, { useState, useEffect, useCallback } from 'react';
import { type User } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { MOCK_PROJECTS } from '../constants';
import * as api from '../api';
import LoadingSpinner from './LoadingSpinner';
import Clock from './Clock';

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onLogout }) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(MOCK_PROJECTS[0]?.id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getGeolocation, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    const fetchUserStatus = async () => {
        try {
            const activeRecord = await api.getActiveRecordForUser(user.id);
            if (activeRecord) {
                setIsClockedIn(true);
                setCurrentRecordId(activeRecord.id);
                setSelectedProjectId(activeRecord.projectId);
            } else {
                setIsClockedIn(false);
                setCurrentRecordId(null);
            }
        } catch (e) {
            setError("Could not fetch current status. Please try again later.");
        } finally {
            setIsInitializing(false);
        }
    };
    fetchUserStatus();
  }, [user.id]);
  
  const handleClockInOut = async () => {
    setError(null);
    setIsLoading(true);

    if (isClockedIn && !currentRecordId) {
        setError("Error: Clocked in but no record ID found. Please contact support.");
        setIsLoading(false);
        return;
    }
    
    if (!isClockedIn && !selectedProjectId) {
        setError("Please select a project before clocking in.");
        setIsLoading(false);
        return;
    }

    try {
      const coordinates = await getGeolocation();
      
      if (isClockedIn && currentRecordId) { // Clocking Out
        await api.clockOut(currentRecordId, coordinates);
        setIsClockedIn(false);
        setCurrentRecordId(null);
      } else if (!isClockedIn && selectedProjectId) { // Clocking In
        const newRecord = await api.clockIn(user.id, selectedProjectId, coordinates);
        setIsClockedIn(true);
        setCurrentRecordId(newRecord.id);
      }
    } catch (e: any) {
        const errorMessage = e?.message || 'An unexpected error occurred.';
        setError(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-800">
            <LoadingSpinner />
            <p className="mt-4 text-gray-300">Loading your status...</p>
        </div>
    );
  }

  const buttonDisabled = isLoading || geoLoading;
  const clockButtonClass = isClockedIn
    ? 'bg-red-600 hover:bg-red-500'
    : 'bg-green-600 hover:bg-green-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-800">
        <header className="absolute top-4 right-4 flex items-center">
            <span className="text-gray-300 mr-4">Hello, {user.name.split(' ')[0]}</span>
            <button onClick={onLogout} className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600">Logout</button>
        </header>

        <div className="flex flex-col items-center">
            <Clock />
            <p className={`mt-2 text-2xl font-semibold ${isClockedIn ? 'text-green-400' : 'text-red-400'}`}>
                {isClockedIn ? 'Clocked In' : 'Clocked Out'}
            </p>
        </div>

        <div className="my-12">
            <button
                onClick={handleClockInOut}
                disabled={buttonDisabled}
                className={`relative w-48 h-48 rounded-full text-white text-3xl font-bold shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${clockButtonClass} ${isClockedIn ? 'focus:ring-red-400' : 'focus:ring-green-400'} disabled:bg-gray-500 disabled:cursor-not-allowed`}
            >
                 {buttonDisabled ? <LoadingSpinner /> : (isClockedIn ? 'Clock Out' : 'Clock In')}
            </button>
        </div>
        
        <div className="w-full max-w-xs">
            <label htmlFor="project" className="block mb-2 text-sm font-medium text-gray-300">Project Site</label>
            <select
                id="project"
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                disabled={isClockedIn}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
                <option value="" disabled>Select a project</option>
                {MOCK_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>

        {error && <p className="mt-6 text-red-400 bg-red-900/50 p-3 rounded-md max-w-md">{error}</p>}
    </div>
  );
};

export default StaffDashboard;