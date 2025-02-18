import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SelectUserType = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Select User Type</h1>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/buyer-dashboard')}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continue as Buyer
          </button>
          <button
            onClick={() => navigate('/seller-dashboard')}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Continue as Seller
          </button>
          <button
            onClick={logout}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;