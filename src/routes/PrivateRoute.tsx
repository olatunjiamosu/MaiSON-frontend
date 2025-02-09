import { Navigate } from 'react-router-dom';

// Mock authentication check (Replace this with actual auth logic)
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Check if a token exists
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
