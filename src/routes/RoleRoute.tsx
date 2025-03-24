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

  // Handle users with 'both' role - always send them to select-dashboard if they need redirection
  if (userRole === 'both') {
    // If this route allows 'both' or is a specific dashboard route, allow access
    if (allowedRoles.includes('both') || 
        location.pathname.includes('/buyer-dashboard') || 
        location.pathname.includes('/seller-dashboard') ||
        location.pathname.includes('/select-dashboard')) {
      return <>{children}</>;
    }
    
    // Otherwise, redirect to select-dashboard
    console.log('User has both role but not allowed on this route, redirecting to select-dashboard');
    return <Navigate to="/select-dashboard" replace />;
  }

  // For all other users, perform normal role check
  if (!userRole || !allowedRoles.includes(userRole as 'buyer' | 'seller' | 'both')) {
    console.log(`User role ${userRole} not in allowed roles ${allowedRoles}, redirecting to select-user-type`);
    return <Navigate to="/select-user-type" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute; 