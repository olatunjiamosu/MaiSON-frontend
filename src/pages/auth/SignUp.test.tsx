// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="mock-calendar-icon">Calendar</div>,
  MessageSquare: () => <div data-testid="mock-message-icon">MessageSquare</div>,
  BarChart: () => <div data-testid="mock-barchart-icon">BarChart</div>,
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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import SignUp from './SignUp';
import { HelmetProvider } from 'react-helmet-async';

// Mock the AuthContext to simulate a logged-out user
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    signUp: jest.fn(() => Promise.resolve()),
    user: null, // Simulate no user logged in
    loading: false, // Simulate that loading is complete
  }),
}));

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    // Wait for the form to render
    const signUpText = await screen.findByText(/create your account/i);
    expect(signUpText).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    // Wait for the inputs to render
    const firstNameInput = await screen.findByLabelText(/first name/i);
    const lastNameInput = await screen.findByLabelText(/last name/i);
    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = await screen.findByTestId('password-input');
    const submitButton = await screen.findByRole('button', { name: /continue/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Add assertions for successful signup behavior
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('renders all form fields', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    // Wait for the inputs to render
    const firstNameInput = await screen.findByLabelText(/first name/i);
    const lastNameInput = await screen.findByLabelText(/last name/i);
    const emailInput = await screen.findByLabelText(/email address/i);
    const phoneInput = await screen.findByLabelText(/phone number/i);
    const passwordInput = await screen.findByTestId('password-input');

    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('toggles password visibility when show/hide is clicked', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    const passwordInput = await screen.findByTestId('password-input');
    const toggleButton = await screen.findByLabelText(/show password/i);

    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle button
    fireEvent.click(toggleButton);

    // Password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('navigates correctly when links are clicked', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    // Test "Log in" link navigation
    const loginLink = await screen.findByText(/log in/i);
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('validates email format', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    );

    const emailInput = await screen.findByLabelText(/email address/i);

    // Try invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailInput).toBeInvalid();

    // Try valid email
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
    expect(emailInput).toBeValid();
  });
}); 