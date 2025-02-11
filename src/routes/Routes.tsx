import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Verification from '../pages/auth/Verification';
import ResetPassword from '../pages/auth/ResetPassword';
import PrivateRoute from './PrivateRoute';
import BuyerDashboard from '../pages/dashboard/BuyerDashboard';
import SelectUserType from '../pages/auth/SelectUserType';
import RegisterBuyer from '../pages/auth/RegisterBuyer';
import MessagesSection from '../pages/dashboard/buyer-sections/MessagesSection';
import SignUp from '../pages/auth/SignUp';

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/sign-up" element={<SignUp />} />
    <Route path="/verification" element={<Verification />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/select-user-type" element={<SelectUserType />} />
    <Route path="/register-buyer" element={<RegisterBuyer />} />
    <Route path="/buyer-dashboard/messages" element={<MessagesSection />} />
    {/* Protected Route for Buyer Dashboard */}
    <Route 
      path="/buyer-dashboard" 
      element={
        <PrivateRoute>
          <BuyerDashboard />
        </PrivateRoute>
      } 
    />
  </Routes>
);

export default AppRoutes;
