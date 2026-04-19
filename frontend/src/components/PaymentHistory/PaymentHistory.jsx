import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Wallet, CalendarDays, GraduationCap, BookOpen, Home, FileText, Building, Download, Search, Plus, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Completed', 'Pending', 'Failed'
  const [searched, setSearched] = useState(false);

  const fetchMyPayments = async () => {
    if (!user || !user.token) {
      alert('Authentication required!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5050/api/payments/my-payments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPayments(res.data);
    } catch (err) {
      setError('Unable to load your payment history. Please try again later.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const getPaymentIcon = (paymentFor) => {
    const normalized = (paymentFor || '').toLowerCase();
    if (normalized.includes('tuition') || normalized.includes('semester')) return <GraduationCap size={20} />;
    if (normalized.includes('library') || normalized.includes('book')) return <BookOpen size={20} />;
    if (normalized.includes('hostel') || normalized.includes('accommodation')) return <Home size={20} />;
    if (normalized.includes('exam') || normalized.includes('registration')) return <FileText size={20} />;
    if (normalized.includes('union') || normalized.includes('club')) return <Building size={20} />;
    return <Wallet size={20} />;
  };

  const getMappedStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'Completed';
      case 'rejected': return 'Failed';
      default: return 'Pending';
    }
  };

  const StatusBadge = ({ status }) => {
    const mappedStatus = getMappedStatus(status);
    let badgeClass = 'ph-status-pending';

    if (mappedStatus === 'Completed') {
      badgeClass = 'ph-status-completed';
    } else if (mappedStatus === 'Failed') {
      badgeClass = 'ph-status-failed';
    }

    return (
      <span className={`ph-status-badge ${badgeClass}`}>
        {mappedStatus}
      </span>
    );
  };

  // Dynamic Summary Statistics
  const totalExpensesRaw = payments
    .filter(p => getMappedStatus(p.status) === 'Completed')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = totalExpensesRaw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const completedPayments = payments.filter(p => getMappedStatus(p.status) === 'Completed');
  const lastPaymentDateRaw = completedPayments.length > 0 
    ? new Date(Math.max(...completedPayments.map(e => new Date(e.createdAt)))) 
    : null;
  const lastPaymentDate = lastPaymentDateRaw ? lastPaymentDateRaw.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A';

  const filteredPayments = payments.filter(p => {
    const matchesSearch = (p.paymentFor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mappedStatus = getMappedStatus(p.status);
    const matchesFilter = filter === 'All' || mappedStatus === filter;
    return matchesSearch && matchesFilter;
  });

  // Dummy values logic for visual accuracy based on the user's uploaded mockup:
  const displayPayments = payments.length > 0 ? filteredPayments : [];

  return (
    <div className="payment-history-container">
      <div className="ph-content">
        <div className="ph-header">
          <h2 className="ph-title">Payment History</h2>
          <p className="ph-subtitle">View and manage your university payments and transactions.</p>
        </div>

        <div className="ph-summary-cards">
          <div className="ph-summary-card">
            <div className="ph-summary-icon">
              <Wallet size={24} />
            </div>
            <div className="ph-summary-info">
              <span className="ph-summary-label">TOTAL SEMESTER EXPENSES</span>
              <span className="ph-summary-value">LKR {totalExpenses}</span>
            </div>
          </div>
          <div className="ph-summary-card">
            <div className="ph-summary-icon">
              <CalendarDays size={24} />
            </div>
            <div className="ph-summary-info">
              <span className="ph-summary-label">LAST PAYMENT DATE</span>
              <span className="ph-summary-value">{lastPaymentDate}</span>
            </div>
          </div>
        </div>

        <div className="ph-controls">
          <div className="ph-filters">
            {['All', 'Completed', 'Pending', 'Failed'].map(f => (
              <button
                key={f}
                className={`ph-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ph-controls-right">
            <button
              onClick={fetchMyPayments}
              disabled={loading}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 inline-flex items-center gap-2"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <Inbox size={16} />
              {loading ? 'Fetching...' : 'My Payments'}
            </button>
            <div className="ph-search">
              <Search className="ph-search-icon" />
              <input
                type="text"
                placeholder="Search reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/pay" className="ph-new-payment-btn">
              <Plus size={16} />
              New Payment
            </Link>
          </div>
        </div>

        {error && <div className="ph-error">{error}</div>}

        {loading ? (
          <div className="ph-loading">Loading payments...</div>
        ) : !searched ? (
          <div className="ph-empty">Click "My Payments" to securely fetch your payment records.</div>
        ) : displayPayments.length === 0 ? (
          <div className="ph-empty">No payments found matching your criteria.</div>
        ) : (
          <div className="ph-list">
            {displayPayments.map((payment, idx) => {
              const txnRef = `TXN-${payment._id ? payment._id.substring(payment._id.length - 5) : '89241'}`;

              const dateObj = new Date(payment.createdAt);
              const formattedDate = isNaN(dateObj.getTime())
                ? 'Oct 24, 2023'
                : dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

              const amountValue = Number(payment.amount) || 0;
              const formattedAmount = amountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

              return (
                <div key={payment._id || idx} className="ph-list-item">
                  <div className="ph-item-icon-wrapper">
                    {getPaymentIcon(payment.paymentFor)}
                  </div>
                  <div className="ph-item-details">
                    <span className="ph-item-title">{payment.paymentFor || 'Unknown Purpose'}</span>
                    <span className="ph-item-date">{formattedDate}</span>
                  </div>
                  <div className="ph-item-email" title={payment.email || 'No email provided'}>
                    {payment.email || 'N/A'}
                  </div>
                  <div className="ph-item-status-wrapper">
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="ph-item-ref">
                    {txnRef.toUpperCase()}
                  </div>
                  <div className="ph-item-amount">
                    LKR {formattedAmount}
                  </div>
                  <button className="ph-item-action" title="Download Receipt">
                    <Download size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
