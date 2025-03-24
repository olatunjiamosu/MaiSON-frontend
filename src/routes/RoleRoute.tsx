import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller' | 'both')[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, userRole, roleLoading } = useAuth();
  const location = useLocation();
  const [hasCheckedRole, setHasCheckedRole] = useState(false);
  
  // Add debug logs to help troubleshoot role issues
  useEffect(() => {
    console.log('RoleRoute - Current user role:', userRole);
    console.log('RoleRoute - Allowed roles for current path:', allowedRoles);
    console.log('RoleRoute - Current path:', location.pathname);
  }, [userRole, allowedRoles, location.pathname]);
  
  // Use an effect to track when we've properly checked the role
  useEffect(() => {
    if (!roleLoading && userRole !== undefined) {
      setHasCheckedRole(true);
    }
  }, [roleLoading, userRole]);

  // Don't make any routing decisions until we're sure we've properly loaded the role
  if (roleLoading || !hasCheckedRole) {
    return <div>Loading...</div>;
  }

  // If user is not logged in, they shouldn't be here
  if (!user) {
    console.log('No user detected, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user has no role, they need to select one
  if (userRole === null) {
    console.log('User has no role, redirecting to select-user-type');
    return <Navigate to="/select-user-type" replace />;
  }

  // Handle users with 'both' role
  if (userRole === 'both') {
    // If this route allows 'both' or is already a dashboard route, allow access
    if (allowedRoles.includes('both') || 
        location.pathname.includes('/buyer-dashboard') || 
        location.pathname.includes('/seller-dashboard') ||
        location.pathname.includes('/select-dashboard')) {
      return <>{children}</>;
    }
    
    // Otherwise, redirect to select-dashboard
    console.log('User has both role but not in allowed routes, redirecting to select-dashboard');
    return <Navigate to="/select-dashboard" replace />;
  }

  // Check if user's role is in allowed roles for this route
  if (allowedRoles.includes(userRole)) {
    // User has permission to access this route
    return <>{children}</>;
  } else {
    // User doesn't have permission, redirect to their appropriate dashboard
    console.log(`User role ${userRole} not in allowed roles ${allowedRoles}`);
    
    if (userRole === 'buyer') {
      console.log('Redirecting buyer to buyer dashboard');
      return <Navigate to="/buyer-dashboard" replace />;
    } else if (userRole === 'seller') {
      console.log('Redirecting seller to seller dashboard');
      return <Navigate to="/seller-dashboard" replace />;
    }
    
    // Fallback (shouldn't get here)
    return <Navigate to="/select-user-type" replace />;
  }
};

export default RoleRoute; 