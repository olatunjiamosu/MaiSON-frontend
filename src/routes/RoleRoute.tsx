import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleRouteProps {
  children: React.ReactNode;
}

const RoleRoute = ({ children }: RoleRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not logged in, they shouldn't be here
  if (!user) {
    console.log('No user detected, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Allow access to all authenticated users
  return <>{children}</>;
};

export default RoleRoute; 