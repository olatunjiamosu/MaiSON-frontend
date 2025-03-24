import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getDashboardPath = () => {
    if (userRole === 'buyer') {
      return '/buyer-dashboard';
    } else if (userRole === 'seller') {
      return '/seller-dashboard';
    } else if (userRole === 'both') {
      return '/select-dashboard';
    } else {
      return '/select-user-type';
    }
  };

  return (
    <nav className="bg-gradient-to-b from-emerald-50 to-white py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          <span>M</span>
          <span className="text-emerald-600">ai</span>
          <span>SON</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            to="/features" 
            className={`${isActive('/features') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Features
          </Link>
          <Link 
            to="/listings"
            className={`${isActive('/listings') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            View Listings
          </Link>
          <Link 
            to="/about"
            className={`${isActive('/about') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            About
          </Link>
          <Link 
            to="/contact"
            className={`${isActive('/contact') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Contact
          </Link>
          
          {user ? (
            <Link 
              to={getDashboardPath()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <User size={18} />
              <span>My Dashboard</span>
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                className={`${isActive('/login') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Login
              </Link>
              <Link
                to="/sign-up"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 