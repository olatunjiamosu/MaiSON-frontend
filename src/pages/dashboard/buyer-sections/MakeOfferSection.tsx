import React from 'react';
import { PropertyDetail } from '../../../types/property';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  DollarSign,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react';

interface MakeOfferSectionProps {
  property?: PropertyDetail;
}

const MakeOfferSection: React.FC<MakeOfferSectionProps> = ({ property }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  if (!property) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Property Selected</h3>
          <p className="text-gray-500 mt-2">Select a property to make an offer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
          <p className="text-gray-500">Submit your offer for {property.address.street}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/profile')}
          >
            <Settings className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
          <p className="text-gray-500 mt-2">The offer submission feature will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferSection; 