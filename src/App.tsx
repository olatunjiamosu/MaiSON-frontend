// src/App.tsx (Remove BrowserRouter here)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/Routes';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
