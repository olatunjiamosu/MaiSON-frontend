import React, { createContext, useContext, useState, useEffect } from 'react';
import PropertyService from '../services/PropertyService';
import { DashboardResponse } from '../types/property';

interface DashboardContextType {
  dashboardData: DashboardResponse | null;
  isLoading: boolean;
  error: Error | null;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PropertyService.getUserDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshDashboard();
  }, []);

  const value = {
    dashboardData,
    isLoading,
    error,
    refreshDashboard
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 