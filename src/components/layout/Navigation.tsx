import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 