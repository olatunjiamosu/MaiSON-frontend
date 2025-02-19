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

import { render, screen, fireEvent } from '@testing-library/react';
import SignUp from './SignUp';

describe('SignUp Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<SignUp />);
  });

  test('renders the signup heading', () => {
    expect(screen.getByText('Sign up to MaiSON')).toBeInTheDocument();
  });

  test('renders all form fields', () => {
    // Check for input fields using exact labels
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    
    // For password field, use the input's ID
    expect(screen.getByTestId('password-input')).toBeInTheDocument();

    // Check for checkboxes
    expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email updates')).toBeInTheDocument();
    expect(screen.getByLabelText('SMS updates')).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  test('toggles password visibility when show/hide is clicked', () => {
    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByLabelText('Show password');

    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('toggles update preferences correctly', () => {
    const emailUpdatesCheckbox = screen.getByLabelText('Email updates');
    const smsUpdatesCheckbox = screen.getByLabelText('SMS updates');

    // Initially unchecked
    expect(emailUpdatesCheckbox).not.toBeChecked();
    expect(smsUpdatesCheckbox).not.toBeChecked();

    // Toggle email updates
    fireEvent.click(emailUpdatesCheckbox);
    expect(emailUpdatesCheckbox).toBeChecked();
    expect(smsUpdatesCheckbox).not.toBeChecked();

    // Toggle SMS updates
    fireEvent.click(smsUpdatesCheckbox);
    expect(emailUpdatesCheckbox).toBeChecked();
    expect(smsUpdatesCheckbox).toBeChecked();
  });

  test('submits form with valid data', () => {
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'Password123!' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/select-user-type');
  });

  test('shows validation errors when submitting empty form', () => {
    // Try to submit without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Check that required fields show validation messages
    const requiredFields = [
      'First Name',
      'Last Name',
      'Email Address',
      'Phone Number',
      'Password',
    ];

    requiredFields.forEach(fieldName => {
      const input = screen.getByLabelText(fieldName);
      expect(input).toBeRequired();
      expect(input).toBeInvalid();
    });

    // Navigation should not happen
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('navigates correctly when links are clicked', () => {
    // Test logo navigation
    const logo = screen.getByText('M');
    fireEvent.click(logo.parentElement!); // Click the parent span that has the onClick
    expect(mockNavigate).toHaveBeenCalledWith('/');

    // Reset mock
    mockNavigate.mockClear();

    // Test "Log in" link navigation
    const loginLink = screen.getByText('Log in');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('validates email format', () => {
    const emailInput = screen.getByLabelText('Email Address');

    // Try invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailInput).toBeInvalid();

    // Try valid email
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
    expect(emailInput).toBeValid();
  });
}); 