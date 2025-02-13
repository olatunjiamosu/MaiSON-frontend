import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const userEmail = params.get('email') || 'your email';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    alert('Password successfully reset!');
    navigate('/login');
  };

  // Mask email (show part of it but hide sensitive data)
  const maskEmail = (email: string) => {
    if (!email.includes('@')) return email;
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      {/* Back to Login Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </button>
      </div>

      {/* Reset Password Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            <span>M</span>
            <span className="text-emerald-600">ai</span>
            <span>SON</span>
          </h2>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="text-gray-600 mt-2">
            Set a new password for <strong>{maskEmail(userEmail)}</strong>
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mt-6 text-center">
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            {/* New Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Reset Password Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
