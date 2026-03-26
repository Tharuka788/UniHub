import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import LostAndFound from './pages/LostAndFound/LostAndFound';
import ItemForm from './components/ItemForm/ItemForm';
import PaymentForm from './components/PaymentForm/PaymentForm';
import PaymentHistory from './components/PaymentHistory/PaymentHistory';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import SubmitTicket from './pages/Support/SubmitTicket';
import MyTickets from './pages/Support/MyTickets';
import AdminSupportLogin from './pages/Support/AdminLogin';
import AdminTicketDashboard from './pages/Support/AdminTicketDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lost-and-found" element={<LostAndFound />} />
            <Route path="/report-lost" element={<ItemForm formType="Lost" />} />
            <Route path="/report-found" element={<ItemForm formType="Found" />} />
            <Route path="/events" element={<div style={{padding: '4rem', textAlign: 'center'}}>Events Page (Dummy)</div>} />
            <Route path="/updates" element={<div style={{padding: '4rem', textAlign: 'center'}}>Updates Page (Dummy)</div>} />
            <Route path="/profile" element={<div style={{padding: '4rem', textAlign: 'center'}}>Profile Page (Dummy)</div>} />
            <Route path="/pay" element={<PaymentForm />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/admin/payments" element={<AdminDashboard />} />
            <Route path="/support/submit" element={<SubmitTicket />} />
            <Route path="/support/my-tickets" element={<MyTickets />} />
            <Route path="/admin/support-login" element={<AdminSupportLogin />} />
            <Route path="/admin/support-tickets" element={<AdminTicketDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
