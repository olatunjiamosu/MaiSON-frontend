// src/App.tsx (Remove BrowserRouter here)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import MaisonChat from './components/chat/MaisonChat';

// Create a wrapper component for MaisonChat
const MaisonChatWrapper = () => {
  const location = useLocation();
  const isPropertyChatsPage = location.pathname.includes('/buyer-dashboard/messages');
  
  if (isPropertyChatsPage) {
    return null;
  }
  
  return <MaisonChat />;
};

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
        <MaisonChatWrapper />
      </div>
    </Router>
  );
};

export default App;
