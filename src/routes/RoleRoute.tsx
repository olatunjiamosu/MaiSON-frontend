import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller' | 'both')[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, userRole, roleLoading } = useAuth();
  const location = useLocation();

  if (roleLoading) {
    return <div>Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole as 'buyer' | 'seller' | 'both')) {
    console.log(`User role ${userRole} not in allowed roles ${allowedRoles}, redirecting to select-user-type`);
    return <Navigate to="/select-user-type" replace />;
  }

  // Special handling for users with 'both' role
  if (userRole === 'both' && !location.pathname.includes('/select-dashboard')) {
    // If the route is already a specific dashboard, allow access
    if (location.pathname.includes('/buyer-dashboard') || 
        location.pathname.includes('/seller-dashboard')) {
      return <>{children}</>;
    }
    
    // If accessing just /select-dashboard, allow access
    if (allowedRoles.includes('both') && allowedRoles.length === 1) {
      return <>{children}</>;
    }
    
    // Otherwise redirect to dashboard selection
    console.log('User has both role, redirecting to select-dashboard');
    return <Navigate to="/select-dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute; 