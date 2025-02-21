import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

const Verification = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="absolute top-4 left-4">
        <Link to="/login" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-bold">
          <span>M</span>
          <span className="text-emerald-600">ai</span>
          <span>SON</span>
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600">
            We've sent you a password reset link. Please check your email and follow the instructions to reset your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verification;
