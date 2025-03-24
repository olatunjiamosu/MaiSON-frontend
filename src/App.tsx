// src/App.tsx (Remove BrowserRouter here)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import SelectUserType from './pages/auth/SelectUserType';
import AppRoutes from './routes/Routes';
import Home from './pages/LandingPage';
import { ChatProvider } from './context/ChatContext';
import { MenuProvider } from './context/MenuContext';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <MenuProvider>
          <ChatProvider>
            <div>
              <ToastContainer position="top-right" autoClose={5000} />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route 
                  path="/select-user-type" 
                  element={
                    <ProtectedRoute>
                      <SelectUserType />
                    </ProtectedRoute>
                  } 
                />
                
                {/* App routes */}
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
            </div>
          </ChatProvider>
        </MenuProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
