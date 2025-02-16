import { createContext, useContext, useState } from 'react';
import CustomToast from '../components/CustomToast';

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
};

type ToastContextType = {
  showToast: (toast: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = (toast: ToastType) => {
    setToast(toast);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <CustomToast {...toast} />}
    </ToastContext.Provider>
  );
}; 