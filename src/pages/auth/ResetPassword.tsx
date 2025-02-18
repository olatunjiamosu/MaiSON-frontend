// src/pages/auth/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../config/firebase';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the oobCode (reset token) from the URL
  const oobCode = new URLSearchParams(location.search).get('oobCode');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      setError('Invalid password reset link');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      // Redirect to login with success message
      navigate('/login', { 
        state: { message: 'Password reset successful. Please log in with your new password.' }
      });
    } catch (error: any) {
      setError(
        error.code === 'auth/expired-action-code'
          ? 'The password reset link has expired. Please request a new one.'
          : 'Failed to reset password. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <label className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Show password</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;