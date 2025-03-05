import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const SelectDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  // Redirect if not 'both' role
  React.useEffect(() => {
    if (userRole === 'buyer') {
      navigate('/buyer-dashboard');
    } else if (userRole === 'seller') {
      navigate('/seller-dashboard');
    }
  }, [userRole, navigate]);

  const handleDashboardSelection = (dashboardType: 'buyer' | 'seller') => {
    if (dashboardType === 'buyer') {
      navigate('/buyer-dashboard');
      toast.success('Switched to Buyer Dashboard');
    } else {
      navigate('/seller-dashboard');
      toast.success('Switched to Seller Dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="text-5xl font-bold mb-2">
          <span>M</span>
          <span className="text-emerald-600">ai</span>
          <span>SON</span>
        </div>
        <p className="text-gray-600 text-lg mb-16">
          Your smart AI-powered property platform.
        </p>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Select Your Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Which dashboard would you like to access?
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Buyer Dashboard Option */}
          <button 
            onClick={() => handleDashboardSelection('buyer')}
            className="flex flex-col items-center p-10 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <Home className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-3">Buyer Dashboard</h2>
            <p className="text-gray-600 text-center">
              Browse properties, view your saved listings, and manage your property search.
            </p>
          </button>

          {/* Seller Dashboard Option */}
          <button 
            onClick={() => handleDashboardSelection('seller')}
            className="flex flex-col items-center p-10 border-2 border-blue-600 rounded-xl hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Image className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">Seller Dashboard</h2>
            <p className="text-gray-600 text-center">
              Manage your properties, track viewings, and communicate with potential buyers.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDashboard; 