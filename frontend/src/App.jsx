import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import TopBar from './components/TopBar/TopBar';
import Dashboard from './pages/Dashboard/Dashboard';
import LostAndFound from './pages/LostAndFound/LostAndFound';
import ItemDetails from './pages/LostAndFound/ItemDetails';
import ItemForm from './components/ItemForm/ItemForm';
import PaymentForm from './components/PaymentForm/PaymentForm';
import PaymentHistory from './components/PaymentHistory/PaymentHistory';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import KuppiRequest from './pages/KuppiRequest/KuppiRequest';
import AdminKuppiRequests from './pages/AdminKuppiRequests/AdminKuppiRequests';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import { useAuth } from './context/AuthContext';
import './index.css';
import './App.css';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // If not authenticated and not on an auth page, redirect to login
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" />;
  }

  // If on an auth page, show only the content (no sidebar/topbar)
  if (isAuthPage) {
    return (
      <div className="auth-wrapper">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lost-and-found" element={<LostAndFound />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/report-lost" element={<ItemForm formType="Lost" />} />
            <Route path="/report-found" element={<ItemForm formType="Found" />} />
            <Route path="/events" element={<div style={{padding: '4rem', textAlign: 'center'}}>Events Page (Dummy)</div>} />
            <Route path="/updates" element={<div style={{padding: '4rem', textAlign: 'center'}}>Updates Page (Dummy)</div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pay" element={<PaymentForm />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/admin/payments" element={<AdminDashboard />} />
            <Route path="/kuppi-request" element={<KuppiRequest />} />
            <Route path="/admin-kuppi" element={<AdminKuppiRequests />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App