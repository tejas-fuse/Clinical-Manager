import React, { useState, useRef, useEffect } from 'react';
import { LogIn, X, Key } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  
  // Password recovery
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Removed master password reset flow per requirement
  const handleRecoverPassword = () => {
    setRecoveryError('Password recovery is not available. Contact an administrator.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Query users_app table for the user
      const { data: users, error: queryError } = await supabase
        .from('users_app')
        .select('*')
        .eq('username', username)
        .single();

      if (queryError || !users) {
        setError('Invalid username or password');
        return;
      }

      // For MVP: Call Supabase RPC to verify password
      // If RPC doesn't exist, fall back to client-side comparison
      try {
        const { data, error: rpcError } = await supabase.rpc('verify_password', {
          username_input: username,
          password_input: password
        });

        if (rpcError || !data) {
          setError('Invalid username or password');
          return;
        }
      } catch {
        // Fallback: simple string comparison (NOT SECURE - for MVP only)
        // In production, use RPC on backend
        setError('Password verification unavailable. Please contact admin.');
        return;
      }

      // Convert users_app row to app user shape
      const appUser = {
        id: users.id,
        username: users.username,
        fullName: users.full_name,
        role: users.role,
        assignedWards: users.assigned_wards || []
      };

      onLogin(appUser);
    } catch (err) {
      setError('Unable to login right now. Please retry.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Focus username on open
    if (isOpen && !isRecoveringPassword) {
      setTimeout(() => usernameRef.current?.focus(), 50);
    }
  }, [isOpen, isRecoveringPassword]);

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

  // Legacy admin forced password change flow is removed with Supabase Auth

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-indigo-900/70 backdrop-blur-sm animate-[fadeIn_300ms_ease-out]">
      {/* White translucent bouncy balls - login page only */}
      <div className="absolute top-20 left-10 w-10 h-10 rounded-full bg-white/40 shadow-lg ring-1 ring-white/30 backdrop-blur motion-safe:animate-bounce" aria-hidden="true"></div>
      <div className="absolute bottom-24 right-12 w-6 h-6 rounded-full bg-white/40 shadow-md ring-1 ring-white/30 backdrop-blur motion-safe:animate-bounce" style={{animationDelay: '250ms'}} aria-hidden="true"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 border border-blue-200/60 motion-safe:animate-[slideUp_300ms_ease-out]">
        <div className="absolute -top-24 -left-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute -bottom-24 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <LogIn size={24} className="text-blue-600 motion-safe:animate-[float_3s_ease-in-out_infinite]" />
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
              ref={usernameRef}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                ref={passwordRef}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {capsLockOn && (
              <p className="mt-1 text-xs text-amber-600 motion-safe:animate-pulse">Caps Lock is ON</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
            disabled={!username || !password || isSubmitting}
          >
            <LogIn size={20} />
            {isSubmitting ? 'Logging in...' : 'Login'}
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

          {/* App reset removed per requirement */}
        </div>
      </div>
    </div>
  );
};
