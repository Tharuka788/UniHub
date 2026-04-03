import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

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
import AdminLostFound from './pages/AdminLostFound/AdminLostFound';
import AdminPayments from './pages/AdminPayments/AdminPayments';
import AdminProfile from './pages/AdminProfile/AdminProfile';
import UsersList from './pages/AdminProfile/UsersList';
import AdminTicketDashboard from './pages/support/AdminTicketDashboard';
import MyTickets from './pages/support/MyTickets';
import SubmitTicket from './pages/support/SubmitTicket';
import StudentManagementAdmin from './modules/student-management/StudentManagementAdmin';
import { useAuth } from './context/AuthContext';

import './index.css';
import './App.css';

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
      {title}
    </h1>
    <p style={{ marginTop: '0.75rem', color: '#6b7280' }}>
      This module page is reserved for future development.
    </p>
  </div>
);

function StudentLayout() {
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
            <Route
              path="/events"
              element={
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  Events Page (Dummy)
                </div>
              }
            />
            <Route
              path="/updates"
              element={
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  Updates Page (Dummy)
                </div>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pay" element={<PaymentForm />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/kuppi-request" element={<KuppiRequest />} />
            <Route path="/admin-support/tickets" element={<MyTickets />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminLayout() {
  return (
    <Routes>
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-profile" element={<AdminProfile />} />
      <Route path="/admin-users" element={<UsersList />} />
      <Route path="/admin-kuppi" element={<AdminKuppiRequests />} />
      <Route path="/admin-payments" element={<AdminPayments />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin-lost-found" element={<AdminLostFound />} />
      <Route path="/admin-support" element={<Navigate to="/admin-support/manage" />} />
      <Route path="/admin-events" element={<PlaceholderPage title="Event Module" />} />
      <Route path="/admin-support/manage" element={<AdminTicketDashboard />} />
      <Route path="/admin-support/create" element={<SubmitTicket />} />
      <Route path="/admin-students-portal/*" element={<StudentManagementAdmin />} />
      <Route path="*" element={<Navigate to="/admin-dashboard" />} />
    </Routes>
  );
}

const AppRouter = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  const isAdminRoute =
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/admin-kuppi') ||
    location.pathname.startsWith('/admin-profile') ||
    location.pathname.startsWith('/admin-users') ||
    location.pathname.startsWith('/admin-payments') ||
    location.pathname.startsWith('/admin-lost-found') ||
    location.pathname.startsWith('/admin-events') ||
    location.pathname.startsWith('/admin/payments') ||
    location.pathname.startsWith('/admin-students-portal') ||
    (location.pathname.startsWith('/admin-support') && location.pathname !== '/admin-support/tickets');

  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" />;
  }

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

  return isAdminRoute ? <AdminLayout /> : <StudentLayout />;
};

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;