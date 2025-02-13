import { Navigate } from 'react-router-dom';

// Mock authentication check (Replace with actual logic)
const isAuthenticated = () => !!localStorage.getItem('token');

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/buyer-dashboard" /> : children;
};

export default PublicRoute;
