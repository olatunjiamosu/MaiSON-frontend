import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

const Login = () => {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for success message from password reset
    const state = location.state as { message?: string };
    if (state?.message) {
      setMessage(state.message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // After successful login, go to home page where they'll see logged-in state
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!email) {
        setError('Please enter your email address');
        return;
      }
      await resetPassword(email);
      setError('');
      setMessage('Check your email for password reset instructions');
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Login to MaiSON</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
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
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Login
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

<div className="text-center mt-4">
  <span className="text-gray-600">Don't have an account? </span>
  <a 
    href="/sign-up" 
    className="text-emerald-600 hover:text-emerald-700"
  >
    Sign up
  </a>
</div>