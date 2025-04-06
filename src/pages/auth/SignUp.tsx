import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, BarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserData } from '../../types/user';
import PageTitle from '../../components/PageTitle';

// Add these interfaces at the top of the file
interface FeatureProps {
  icon: React.ReactNode;
  text: string;
}

const checkPhoneExists = async (phoneNumber: string) => {
  try {
    // Clean the phone number to match database format (just digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    console.log('Checking phone:', cleanPhone);
    const phoneQuery = query(
      collection(db, 'users'),
      where('phone', '==', cleanPhone)
    );
    const phoneSnapshot = await getDocs(phoneQuery);
    const exists = !phoneSnapshot.empty;
    console.log('Phone exists?', exists);
    return exists;
  } catch (error: any) { // Type assertion for error
    console.error('Phone check error:', error);
    throw new Error('Error checking phone number: ' + (error.message || 'Unknown error'));
  }
};

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate(); // React Router navigation hook

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    showPassword: false,
    emailUpdates: false,
    smsUpdates: false,
  });

  const [error, setError] = useState('');

  const validatePassword = (password: string): string[] => {
    const errors = [];
    
    // Check length
    if (password.length < 8) {
      errors.push('Must be at least 8 characters long');
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      errors.push('Include at least one lowercase letter (a-z)');
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      errors.push('Include at least one uppercase letter (A-Z)');
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors.push('Include at least one number (0-9)');
    }

    // Check for special character
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Include at least one special character (!@#$%^&*)');
    }

    return errors;
  };

  const validatePhone = (phone: string): string | null => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // UK phone number validation (basic)
    // Allows formats like: 07700900000, +447700900000
    const ukPhoneRegex = /^(?:(?:\+44)|(?:0))(?:7\d{9})$/;
    
    if (!cleanPhone) {
      return "Phone number is required";
    }
    
    if (!ukPhoneRegex.test(cleanPhone)) {
      return "Please enter a valid UK mobile number";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if phone number already exists
      const phoneExists = await checkPhoneExists(formData.phone);
      if (phoneExists) {
        setError('This phone number is already registered');
        return;
      }

      // Prepare user data according to UserData type
      const userData: Partial<UserData> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferences: {
          emailUpdates: formData.emailUpdates,
          smsUpdates: formData.smsUpdates,
        },
      };

      // Use signup from AuthContext
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        userData
      );

      // Navigate to dashboard after successful signup
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please try signing in or use a different email address.');
      } else {
        setError(error.message || 'An error occurred during signup');
      }
    }
  };

  // Improve password strength messaging
  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    const errors = validatePassword(password);
    if (errors.length === 0) {
      return { strength: 'Strong - Good to go! 🚀', color: 'text-green-600' };
    }
    if (errors.length <= 2) {
      return { strength: 'Medium - Almost there! 👍', color: 'text-yellow-600' };
    }
    return { strength: 'Weak - Keep going! 💪', color: 'text-red-600' };
  };

  return (
    <>
      <PageTitle title="Sign Up" />
      <div className="min-h-screen bg-white">
        {/* Minimal Navbar with gradient */}
        <nav className="bg-gradient-to-b from-emerald-50 to-white">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <span
                className="text-2xl font-bold tracking-tight cursor-pointer"
                onClick={() => navigate('/')}
              >
                <span>M</span>
                <span className="text-emerald-600">ai</span>
                <span>SON</span>
              </span>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
          {/* Left Column - Features */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-8">
              Sign up to M<span className="text-emerald-600">ai</span>SON
            </h1>

            <div className="space-y-6">
              <Feature
                icon={<Calendar className="h-6 w-6 text-emerald-600" />}
                text="Book viewings, make offers and agree sales 24/7"
              />
              <Feature
                icon={<MessageSquare className="h-6 w-6 text-emerald-600" />}
                text="Send direct messages through our AI assistant"
              />
              <Feature
                icon={<BarChart className="h-6 w-6 text-emerald-600" />}
                text="View your property's activity and performance reports"
              />
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h2 className="text-2xl font-bold mb-6">Create your account</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name */}
                <div>
                  <label 
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label 
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label 
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label 
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => {
                      const value = e.target.value;
                      // Only allow digits, spaces, plus, and hyphens
                      const sanitized = value.replace(/[^\d\s+-]/g, '');
                      setFormData({ ...formData, phone: sanitized });
                    }}
                    placeholder="07700900000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      formData.phone && validatePhone(formData.phone) 
                        ? 'border-red-300' 
                        : formData.phone 
                          ? 'border-green-300' 
                          : ''
                    }`}
                    required
                  />
                  {formData.phone && validatePhone(formData.phone) && (
                    <p className="mt-1 text-sm text-red-600">
                      {validatePhone(formData.phone)}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label 
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    data-testid="password-input"
                    type={formData.showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      formData.password && validatePassword(formData.password).length > 0 
                        ? 'border-red-300' 
                        : formData.password 
                          ? 'border-green-300' 
                          : ''
                    }`}
                    required
                  />
                  <div className="mt-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showPassword}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            showPassword: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Show password</span>
                    </label>
                  </div>
                  {formData.password && (
                    <div className="mt-2 text-sm">
                      <p className={`font-medium ${getPasswordStrength(formData.password).color}`}>
                        Password Strength: {getPasswordStrength(formData.password).strength}
                      </p>
                      {validatePassword(formData.password).length > 0 && (
                        <>
                          <p className="text-gray-600 mt-2 mb-1">Your password needs:</p>
                          <ul className="space-y-1">
                            {validatePassword(formData.password).map((error, index) => (
                              <li key={index} className="text-red-600 flex items-center">
                                <span className="mr-2">•</span>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Updates Preferences */}
                <div>
                  <h3 className="font-medium mb-2">Want to stay in-the-know?</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Let's keep in touch in a way that suits you best.
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.emailUpdates}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            emailUpdates: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Email updates</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.smsUpdates}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            smsUpdates: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">SMS updates</span>
                    </label>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-sm text-gray-600">
                  By proceeding, you agree to our{' '}
                  <a href="/terms" className="text-emerald-600 hover:underline">
                    Terms of Use
                  </a>
                  .
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Continue
                </button>

                {/* Already Have an Account */}
                <div className="text-sm text-center">
                  Already have an account?{' '}
                  <a href="/login" className="text-emerald-600 hover:underline">
                    Log in
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Feature = ({ icon, text }: FeatureProps) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">{icon}</div>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default SignUp;
