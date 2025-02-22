import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Image, Users } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const SelectUserType = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUserTypeSelection = async (userType: 'buyer' | 'seller' | 'both') => {
    try {
      if (!user) return;
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        userType: userType,
        updatedAt: new Date().toISOString()
      });

      // Navigate to register-property for both seller and both options
      if (userType === 'seller' || userType === 'both') {
        navigate('/register-property');
      } else {
        navigate('/buyer-dashboard');
      }
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

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
          We're Glad You're Here
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Are you looking to buy or sell a property?
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {/* Buyer Option */}
          <button 
            onClick={() => handleUserTypeSelection('buyer')}
            className="flex flex-col items-center p-10 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <Home className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-3">I'm a Buyer</h2>
            <p className="text-gray-600 text-center">
              Find your perfect property with our AI matching system. Browse listings and get personalized recommendations.
            </p>
          </button>

          {/* Seller Option */}
          <button 
            onClick={() => handleUserTypeSelection('seller')}
            className="flex flex-col items-center p-10 border-2 border-blue-600 rounded-xl hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Image className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">I'm a Seller</h2>
            <p className="text-gray-600 text-center">
              List your property and reach qualified buyers. Get AI-powered pricing insights and marketing tools.
            </p>
          </button>

          {/* Both Option */}
          <button 
            onClick={() => handleUserTypeSelection('both')}
            className="flex flex-col items-center p-10 border-2 border-purple-600 rounded-xl hover:bg-purple-50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-purple-600 mb-3">I'm Both</h2>
            <p className="text-gray-600 text-center">
              Looking to buy and sell? Access our complete suite of tools for a seamless property transition experience.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;
