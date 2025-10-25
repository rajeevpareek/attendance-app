import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type User, type AttendanceRecord, Coordinates } from '../types';
import { MOCK_USERS, MOCK_PROJECTS } from '../constants';
import * as api from '../api';
import LoadingSpinner from './LoadingSpinner';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const storedRecords = await api.getAttendanceRecords();
        // Sort by most recent first
        storedRecords.sort((a, b) => new Date(b.inTime).getTime() - new Date(a.inTime).getTime());
        setRecords(storedRecords);
    } catch(e) {
        console.error("Failed to load records", e);
        setError("Could not load attendance data. Please try again later.");
        setRecords([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const enhancedRecords = useMemo(() => {
    return records.map(rec => {
      const staff = MOCK_USERS.find(u => u.id === rec.userId);
      const project = MOCK_PROJECTS.find(p => p.id === rec.projectId);
      return {
        ...rec,
        staffName: staff?.name || 'Unknown User',
        projectName: project?.name || 'Unassigned',
      };
    });
  }, [records]);

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };
  
  const formatCoordinates = (coords: Coordinates | null) => {
    if (!coords) return 'No Location';
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  };
  
  const getStatus = (record: AttendanceRecord) => {
      if (record.outTime) {
          return <span className="px-2 py-1 text-xs font-semibold text-gray-100 bg-gray-600 rounded-full">Completed</span>;
      }
      return <span className="px-2 py-1 text-xs font-semibold text-green-900 bg-green-300 rounded-full">Active</span>;
  };

  const renderTableBody = () => {
      if (isLoading) {
          return (
              <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center">
                          <LoadingSpinner />
                          <span className="ml-4">Loading records...</span>
                      </div>
                  </td>
              </tr>
          );
      }

      if (error) {
           return (
              <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-400">
                      {error}
                  </td>
              </tr>
          );
      }

      if (enhancedRecords.length === 0) {
          return (
              <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No attendance records found.</td>
              </tr>
          );
      }

      return enhancedRecords.map(rec => (
        <tr key={rec.id} className="hover:bg-gray-700/50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{rec.staffName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{rec.projectName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDateTime(rec.inTime)}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDateTime(rec.outTime)}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{formatCoordinates(rec.inCoordinates)}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{formatCoordinates(rec.outCoordinates)}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatus(rec)}</td>
        </tr>
      ));
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-900">
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Viewing all attendance records</p>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-gray-300">Admin: {user.name}</span>
            <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500">
                Logout
            </button>
        </div>
      </header>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Staff</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Project</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Clock In</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Clock Out</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">In Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Out Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;