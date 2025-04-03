import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Verification from '../pages/auth/Verification';
import ResetPassword from '../pages/auth/ResetPassword';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import ListingsDashboard from '../pages/dashboard/ListingsDashboard';
import SelectUserType from '../pages/auth/SelectUserType';
import SignUp from '../pages/auth/SignUp';
import PropertyDetails from '../pages/property/PropertyDetails';
import PublicListings from '../pages/PublicListings';
import FeaturesPage from '../pages/FeaturesPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import RoleRoute from './RoleRoute';
import Dashboard from '../pages/dashboard/Dashboard';
import SellerDashboard from '../pages/dashboard/SellerDashboard';
import BuyersDashboard from '../pages/dashboard/BuyersDashboard';

// Remove mock property data as we're now using the API

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
    <Route path="/features" element={<PublicRoute><FeaturesPage /></PublicRoute>} />
    <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
    <Route path="/listings" element={<PublicRoute><PublicListings /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
    <Route path="/verification" element={<PublicRoute><Verification /></PublicRoute>} />
    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
    <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
    <Route path="/select-user-type" element={<PrivateRoute><SelectUserType /></PrivateRoute>} />
    
    {/* Main Dashboard Route */}
    <Route 
      path="/dashboard" 
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />

    {/* Seller Property Dashboard Route */}
    <Route 
      path="/dashboard/seller/property/:propertyId/*" 
      element={
        <PrivateRoute>
          <SellerDashboard />
        </PrivateRoute>
      }
    />

    {/* Protected Routes */}
    <Route 
      path="/dashboard/listings/*" 
      element={
        <PrivateRoute>
          <ListingsDashboard />
        </PrivateRoute>
      }
    />

    <Route 
      path="/property/:id" 
      element={
        <PrivateRoute>
          <PropertyDetails />
        </PrivateRoute>
      }
    />

    {/* Dashboard Routes */}
    <Route path="/dashboard/seller/*" element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />
    <Route path="/dashboard/buyer/property/:propertyId/*" element={<PrivateRoute><BuyersDashboard /></PrivateRoute>} />
  </Routes>
);

export default AppRoutes;
