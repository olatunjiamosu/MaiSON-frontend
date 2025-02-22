import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller')[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  if (!user || !userRole) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={`/${userRole}-dashboard`} />;
  }

  return <>{children}</>;
};

export default RoleRoute; 