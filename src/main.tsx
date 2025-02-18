// src/main.tsx or src/index.tsx (whichever your project uses)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Ensure styles are imported
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
