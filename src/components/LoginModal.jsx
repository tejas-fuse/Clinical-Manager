import React, { useState } from 'react';
import { LogIn, UserPlus, X, Shield, ChevronDown, ChevronUp, Key } from 'lucide-react';
import { USER_ROLES } from '../constants/config';

export const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState('staff');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  
  // Password recovery
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleReset = () => {
    // Ask for admin master password to prevent unauthorized reset
    const masterPassword = prompt('⚠️ SECURITY: Enter the admin master password to reset all data.\n\nThis action cannot be undone!');
    
    if (!masterPassword) {
      return; // User cancelled
    }

    if (masterPassword !== 'admin@123') {
      alert('❌ Incorrect master password. Reset denied.');
      return;
    }

    if (window.confirm('⚠️ This will delete ALL data including users, wards, staff, and assignments.\n\nAre you absolutely sure?')) {
      localStorage.clear();
      alert('✅ All data has been cleared. The app will reload with default admin account.\n\nUsername: admin\nPassword: admin123');
      window.location.reload();
    }
  };

  const handleRecoverPassword = () => {
    setRecoveryError('');
    
    if (!recoveryUsername.trim() || !securityAnswer.trim()) {
      setRecoveryError('Please enter username and security answer');
      return;
    }

    const users = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    const user = users.find(u => u.username === recoveryUsername);

    if (!user) {
      setRecoveryError('Username not found');
      return;
    }

    if (!user.securityQuestion || !user.securityAnswer) {
      setRecoveryError('No security question set for this user. Contact administrator.');
      return;
    }

    if (user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
      setRecoveryError('Incorrect answer to security question');
      return;
    }

    // Show the password
    alert(`✅ Password Recovery Successful!\n\nUsername: ${user.username}\nPassword: ${user.password}\n\nPlease change your password after logging in.`);
    
    setIsRecoveringPassword(false);
    setRecoveryUsername('');
    setSecurityAnswer('');
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

  if (isRecoveringPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Key size={28} />
              Recover Password
            </h2>
            <button onClick={() => {
              setIsRecoveringPassword(false);
              setRecoveryUsername('');
              setSecurityAnswer('');
              setRecoveryError('');
            }} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={recoveryUsername}
                onChange={(e) => setRecoveryUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Security Question Answer</label>
              <p className="text-xs text-gray-500 mb-2">What is your preferred role?</p>
              <input
                type="text"
                placeholder="e.g., Staff, In-Charge"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
            </div>

            {recoveryError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {recoveryError}
              </div>
            )}

            <button
              onClick={handleRecoverPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Recover Password
            </button>

            <button
              onClick={() => {
                setIsRecoveringPassword(false);
                setRecoveryUsername('');
                setSecurityAnswer('');
                setRecoveryError('');
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Login
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The security question answer is set during account creation by the administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-sm space-y-2">
          <p className="text-gray-500">Contact your administrator for account credentials</p>
          
          <button
            type="button"
            onClick={() => {
              setIsRecoveringPassword(true);
              setUsername('');
              setPassword('');
              setError('');
            }}
            className="text-blue-600 hover:text-blue-700 underline text-xs"
          >
            Forgot password?
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="block w-full text-xs text-red-500 hover:text-red-700 underline"
          >
            Reset App (requires master password)
          </button>
        </div>
      </div>
    </div>
  );
};
