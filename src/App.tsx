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

const App = () => {
  return (
    <Router>
      <ChatProvider>
        <div>
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
            
            {/* Add other protected routes here */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </div>
      </ChatProvider>
    </Router>
  );
};

export default App;
