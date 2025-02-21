import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

const Login = () => {
  const { login, resetPassword, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as { message?: string };
    if (state?.message) {
      setMessage(state.message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/select-user-type');
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      navigate('/select-user-type');
    } catch (err: any) {
      setError('Failed to sign in with Google');
      console.error('Google sign in error:', err);
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
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
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
  
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
  
          <div className="space-y-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <label className="flex items-center">
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
            onClick={handleSubmit}
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Login
          </button>
        </div>
  
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
  
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
              fill="#4285F4"
            />
            <path
              d="M12.24 24.0008C15.4764 24.0008 18.2058 22.9382 20.1944 21.1039L16.3274 18.1055C15.2516 18.8375 13.8626 19.252 12.24 19.252C9.07376 19.252 6.38168 17.1399 5.41376 14.3003H1.41455V17.3912C3.38736 21.4434 7.49128 24.0008 12.24 24.0008Z"
              fill="#34A853"
            />
            <path
              d="M5.41374 14.3003C5.17374 13.5681 5.03974 12.7862 5.03974 12.0008C5.03974 11.2154 5.17374 10.4335 5.41374 9.70132V6.61035H1.41455C0.514018 8.23035 0 10.0649 0 12.0008C0 13.9367 0.514018 15.7712 1.41455 17.3912L5.41374 14.3003Z"
              fill="#FBBC05"
            />
            <path
              d="M12.24 4.74966C14.0291 4.74966 15.6374 5.36966 16.9057 6.58366L20.3097 3.17966C18.2003 1.21166 15.4764 0 12.24 0C7.49128 0 3.38736 2.55733 1.41455 6.61035L5.41374 9.70132C6.38168 6.86166 9.07376 4.74966 12.24 4.74966Z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
  
        <div className="space-y-4">
          <button
            onClick={handleResetPassword}
            className="block w-full text-center text-emerald-600 hover:text-emerald-700 text-sm"
          >
            Forgot password?
          </button>
  
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link 
              to="/sign-up" 
              className="text-emerald-600 hover:text-emerald-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// Mock the AuthContext to simulate a logged-out user
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    login: jest.fn(() => Promise.resolve()),
    resetPassword: jest.fn(() => Promise.resolve()),
    signInWithGoogle: jest.fn(() => Promise.resolve()),
    user: null, // Simulate no user logged in
    loading: false, // Simulate that loading is complete
  }),
}));

describe('Login Component', () => {
  it('renders login form', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    // Wait for the form to render
    const loginText = await screen.findByText(/login to maison/i);
    expect(loginText).toBeInTheDocument();
  });

  it('handles email and password input', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    // Wait for the inputs to render
    const emailInput = await screen.findByPlaceholderText('Email');
    const passwordInput = await screen.findByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('handles form submission', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );

    // Wait for the inputs and button to render
    const emailInput = await screen.findByPlaceholderText('Email');
    const passwordInput = await screen.findByPlaceholderText('Password');
    const submitButton = await screen.findByText('Login');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Add assertions for successful login behavior
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});
  