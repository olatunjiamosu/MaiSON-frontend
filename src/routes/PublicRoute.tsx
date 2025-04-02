import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  protected?: boolean;
  alwaysAccessible?: boolean; // New prop for routes that should always be accessible
}

const PublicRoute = ({ 
  children, 
  protected: isProtected = false,
  alwaysAccessible = false 
}: PublicRouteProps) => {
  const { user } = useAuth();
  
  // If route is always accessible, show it regardless of auth state
  if (alwaysAccessible) {
    return <>{children}</>;
  }
  
  // Only redirect if user is authenticated AND route is protected
  if (user && isProtected) {
    return <Navigate to="/dashboard/listings" />;
  }

  return <>{children}</>;
};

export default PublicRoute;
