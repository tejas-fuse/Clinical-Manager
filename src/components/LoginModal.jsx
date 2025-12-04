import React, { useState } from 'react';
import { LogIn, UserPlus, X, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { USER_ROLES } from '../constants/config';

export const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState('staff');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleReset = () => {
    if (window.confirm('This will delete ALL data including users, wards, staff, and assignments. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Only allow login, not registration
    // Registration is handled by admin
    const users = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      setError('Invalid username or password');
      return;
    }

    onLogin(user);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Login to Clinical Manager
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Default Admin Credentials Hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-blue-700 text-sm font-medium w-full"
            >
              <Shield size={16} />
              <span>First time? Default admin credentials</span>
              {showHint ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
            </button>
            {showHint && (
              <div className="mt-2 text-sm text-blue-600 space-y-1 pl-6">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
                <p className="text-xs text-blue-500 mt-2">⚠️ Create a new admin account and delete the default one after first login.</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Contact your administrator for account credentials</p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Reset App (Clear All Data)
          </button>
        </div>
      </div>
    </div>
  );
};
