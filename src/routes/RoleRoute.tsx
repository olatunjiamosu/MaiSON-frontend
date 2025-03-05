import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ('buyer' | 'seller' | 'both')[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole as 'buyer' | 'seller' | 'both')) {
    return <Navigate to="/select-user-type" replace />;
  }

  // Special handling for users with 'both' role
  if (userRole === 'both' && !location.pathname.includes('/select-dashboard')) {
    // If the route is already a specific dashboard, allow access
    if (location.pathname.includes('/buyer-dashboard') || 
        location.pathname.includes('/seller-dashboard')) {
      return <>{children}</>;
    }
    
    // If accessing just /select-dashboard, allow access
    if (allowedRoles.includes('both') && allowedRoles.length === 1) {
      return <>{children}</>;
    }
    
    // Otherwise redirect to dashboard selection
    return <Navigate to="/select-dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute; 