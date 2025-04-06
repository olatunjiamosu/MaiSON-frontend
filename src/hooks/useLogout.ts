import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { toast } from 'react-hot-toast';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setDashboardData } = useDashboard();

  const handleLogout = async () => {
    try {
      // Clear dashboard data first
      if (setDashboardData) {
        setDashboardData(null);
      }
      // Then perform logout
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return handleLogout;
}; 