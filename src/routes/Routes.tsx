import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Verification from '../pages/auth/Verification';
import ResetPassword from '../pages/auth/ResetPassword';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import BuyerDashboard from '../pages/dashboard/BuyerDashboard';
import SelectUserType from '../pages/auth/SelectUserType';
import SelectDashboard from '../pages/dashboard/SelectDashboard';
import PropertyChats from '../pages/dashboard/buyer-sections/PropertyChats';
import SignUp from '../pages/auth/SignUp';
import PropertyDetails from '../pages/property/PropertyDetails';
import SavedPropertiesSection from '../pages/dashboard/buyer-sections/SavedPropertiesSection';
import ViewingsSection from '../pages/dashboard/buyer-sections/ViewingsSection';
import AvailabilitySection from '../pages/dashboard/seller-sections/AvailabilitySection';
import PublicListings from '../pages/PublicListings';
import FeaturesPage from '../pages/FeaturesPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import SellerDashboard from '../pages/dashboard/SellerDashboard';
import SellerPropertyGrid from '../pages/dashboard/SellerPropertyGrid';
import RoleRoute from './RoleRoute';
import { TestApi } from '../components/TestApi';

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
    
    {/* Test Route */}
    <Route path="/test-api" element={<PublicRoute><TestApi /></PublicRoute>} />
    
    {/* Dashboard Selection for Both-Role Users */}
    <Route 
      path="/select-dashboard" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['both']}>
            <SelectDashboard />
          </RoleRoute>
        </PrivateRoute>
      }
    />

    {/* Protected Routes */}
    <Route 
      path="/buyer-dashboard/*" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['buyer', 'both']}>
            <BuyerDashboard />
          </RoleRoute>
        </PrivateRoute>
      }
    />

    {/* Seller Dashboard Routes */}
    <Route 
      path="/seller-dashboard" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['seller', 'both']}>
            <SellerPropertyGrid />
          </RoleRoute>
        </PrivateRoute>
      }
    />
    <Route 
      path="/seller-dashboard/availability" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['seller', 'both']}>
            <AvailabilitySection />
          </RoleRoute>
        </PrivateRoute>
      }
    />

    <Route 
      path="/seller-dashboard/properties" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['seller', 'both']}>
            <SellerPropertyGrid />
          </RoleRoute>
        </PrivateRoute>
      }
    />
    
    <Route 
      path="/seller-dashboard/property/:propertyId/*" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['seller', 'both']}>
            <SellerDashboard />
          </RoleRoute>
        </PrivateRoute>
      }
    />
    
    <Route 
      path="/seller-dashboard/add-property" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['seller', 'both']}>
            <SellerDashboard />
          </RoleRoute>
        </PrivateRoute>
      }
    />
    
    <Route 
      path="/seller-dashboard/edit-property/:propertyId" 
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['seller', 'both']}>
            <SellerDashboard />
          </RoleRoute>
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
  </Routes>
);

export default AppRoutes;
