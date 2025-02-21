import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      navigate('/buyer-dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to log in');
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first!');
      return;
    }
    try {
      await resetPassword(email);
      setError(''); // Clear any existing errors
      navigate('/verification');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            <span>M</span>
            <span className="text-emerald-600">ai</span>
            <span>SON</span>
          </h2>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details to access your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            {message && (
              <div className="mb-4 text-emerald-600 text-sm text-center">
                {message}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
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
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={e => setShowPassword(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Show password</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Sign in
                </button>
              </div>
            </form>

            {/* Register Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/signup"
                  className="w-full flex justify-center py-3 px-4 border border-emerald-600 rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;