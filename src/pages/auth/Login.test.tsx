//import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils/test-utils';
import Login from './Login';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mock-mail-icon">Mail</div>,
  Lock: () => <div data-testid="mock-lock-icon">Lock</div>,
  ArrowLeft: () => <div data-testid="mock-arrow-icon">ArrowLeft</div>,
}));

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Login />);
  });

  test('renders the login heading', () => {
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('renders login form with email and password fields', () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  test('navigates to sign up page when clicking create account', () => {
    const signUpLink = screen.getByRole('link', { name: /create an account/i });
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });

  test('handles form submission', () => {
    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Add assertions based on your login logic
    // For now, we can check if localStorage was updated
    expect(localStorage.getItem('token')).toBeTruthy();
  });

  test('navigates to forgot password', () => {
    const forgotPasswordButton = screen.getByText(/Forgot your password/i);
    fireEvent.click(forgotPasswordButton);
    // Add assertions for navigation
  });

  test('remembers user when checkbox is clicked', () => {
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /Remember me/i });
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });
}); 