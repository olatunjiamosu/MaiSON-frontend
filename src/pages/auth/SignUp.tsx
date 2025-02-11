import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, BarChart } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate(); // React Router navigation hook

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    showPassword: false,
    emailUpdates: false,
    smsUpdates: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add validation or API call here if needed
    
    navigate('/select-user-type'); // Navigate to SelectUserType page
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Clicking "MaiSON" navigates to Landing Page */}
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
          <h1 className="text-3xl font-bold mb-8">Sign up to MaiSON</h1>
          
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <div className="mt-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.showPassword}
                      onChange={(e) => setFormData({ ...formData, showPassword: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Show password</span>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Must be at least 8 characters with 1 lowercase, 1 uppercase, and 1 number.
                </p>
              </div>

              {/* Updates Preferences */}
              <div>
                <h3 className="font-medium mb-2">Want to stay in-the-know?</h3>
                <p className="text-sm text-gray-600 mb-2">Let's keep in touch in a way that suits you best.</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emailUpdates}
                      onChange={(e) => setFormData({ ...formData, emailUpdates: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Email updates</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smsUpdates}
                      onChange={(e) => setFormData({ ...formData, smsUpdates: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">SMS updates</span>
                  </label>
                </div>
              </div>

              {/* Terms */}
              <div className="text-sm text-gray-600">
                By proceeding, you agree to our <a href="/terms" className="text-emerald-600 hover:underline">Terms of Use</a>.
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
  );
};

// Feature Component
const Feature = ({ icon, text }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">{icon}</div>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default SignUp;
