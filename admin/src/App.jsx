import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const App = () => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  return (
    <Router basename="/admin">
      <Routes>
        <Route 
          path="/" 
          element={adminToken ? <Navigate to="/dashboard" /> : <AdminLogin setAdminToken={setAdminToken} />} 
        />
        <Route 
          path="/dashboard" 
          element={adminToken ? <AdminDashboard logout={logout} /> : <Navigate to="/" />} 
        />
        {/* Redirect any other path to root */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
