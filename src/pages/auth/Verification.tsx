import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userEmail = params.get('email') || 'your email';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Countdown Timer for Resending Code
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '123456') {
      // Simulated verification
      navigate(`/reset-password?email=${encodeURIComponent(userEmail)}`);
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  // Handle Resend Code Logic
  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    alert(`Verification code resent to ${userEmail}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4">
      {/* Back to Login Button */}
      <div className="absolute top-4 left-4">
        <Link
          to="/login"
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>
      </div>

      {/* Centered Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* MaiSON Branding */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            <span>M</span>
            <span className="text-emerald-600">ai</span>
            <span>SON</span>
          </h2>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mt-6 text-center">
          <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mt-2">
            We've sent a verification code to <strong>{userEmail}</strong>.
            Please enter it below.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-center"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700"
            >
              Verify Account
            </button>
          </form>

          {/* Resend Code Button with Cooldown */}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`mt-4 flex items-center text-emerald-600 ${!canResend ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            {canResend ? 'Resend Code' : `Resend Code in ${timeLeft}s`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verification;
