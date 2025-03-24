import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Menu, X } from 'lucide-react';
import { useMenu } from '../../context/MenuContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { isMenuOpen, setIsMenuOpen } = useMenu();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-b from-emerald-50 to-white py-4 relative">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold z-10">
          <span>M</span>
          <span className="text-emerald-600">ai</span>
          <span>SON</span>
        </Link>

        {/* Burger menu button (visible on mobile) */}
        <button 
          className="md:hidden z-10 p-2 text-gray-600 hover:text-emerald-600 focus:outline-none" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-6">
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

        {/* Mobile menu (overlay) */}
        <div className={`fixed inset-0 bg-white z-0 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex flex-col items-center pt-24 h-full space-y-6 text-xl">
            {/* Dashboard button at the top for logged in users */}
            {user && (
              <Link 
                to={getDashboardPath()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm mb-4"
                onClick={closeMenu}
              >
                <User size={18} />
                <span>My Dashboard</span>
              </Link>
            )}
            
            <Link 
              to="/features" 
              className={`${isActive('/features') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={closeMenu}
            >
              Features
            </Link>
            <Link 
              to="/listings"
              className={`${isActive('/listings') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={closeMenu}
            >
              View Listings
            </Link>
            <Link 
              to="/about"
              className={`${isActive('/about') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={closeMenu}
            >
              About
            </Link>
            <Link 
              to="/contact"
              className={`${isActive('/contact') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
            
            {/* Authentication links for non-logged in users */}
            {!user && (
              <div className="flex flex-col items-center space-y-4 mt-4">
                <Link 
                  to="/login"
                  className={`${isActive('/login') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 