import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const PrivateRoute = ({ children, requireAuth = true }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (requireAuth && !user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (!requireAuth && user) {
    // Already logged in, redirect to home or dashboard
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}; 