import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading spinner component
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  // User is authenticated, show the protected content
  return children;
};

export default PrivateRoute;
