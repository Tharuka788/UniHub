import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock3,
  CheckCircle2,
  LayoutDashboard,
  ArrowRight,
  CreditCard,
  Search,
  Ticket,
  CalendarDays,
  RefreshCw
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './MainAdminDashboard.css';

const MainAdminDashboard = () => {
  const navigate = useNavigate();
  const [kuppiRequests, setKuppiRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKuppiRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5050/api/kuppi');
      setKuppiRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching kuppi requests:', error);
      setKuppiRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKuppiRequests();
  }, []);

  const sortedRequests = useMemo(() => {
    return [...kuppiRequests].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [kuppiRequests]);

  const totalRequests = kuppiRequests.length;
  const pendingRequests = kuppiRequests.filter(
    (r) => r.status?.toLowerCase() === 'pending'
  ).length;
  const approvedRequests = kuppiRequests.filter(
    (r) => r.status?.toLowerCase() === 'approved'
  ).length;

  const latestRequest =
    sortedRequests.length > 0 && sortedRequests[0].createdAt
      ? new Date(sortedRequests[0].createdAt).toLocaleDateString()
      : 'No requests yet';

  const moduleCards = [
    {
      title: 'Kuppi Requests',
      desc: 'Review, approve and schedule Kuppi requests.',
      icon: BookOpen,
      action: () => navigate('/admin-kuppi'),
      actionText: 'Manage Now',
      colorClass: 'purple'
    },
    {
      title: 'Payment Module',
      desc: 'Reserved space for payment administration.',
      icon: CreditCard,
      action: () => navigate('/admin/payments'),
      actionText: 'Open Module',
      colorClass: 'blue'
    },
    {
      title: 'Lost & Found Module',
      desc: 'Reserved space for lost and found administration.',
      icon: Search,
      action: () => navigate('/admin-lost-found'),
      actionText: 'Open Module',
      colorClass: 'green'
    },
    {
      title: 'Support Module',
      desc: 'Reserved space for support ticket handling.',
      icon: Ticket,
      action: () => navigate('/admin-support'),
      actionText: 'Open Module',
      colorClass: 'orange'
    },
    {
      title: 'Event Module',
      desc: 'Reserved space for event and update management.',
      icon: CalendarDays,
      action: () => navigate('/admin-events'),
      actionText: 'Open Module',
      colorClass: 'pink'
    }
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <div className="admin-dashboard-page">
          <div className="admin-dashboard-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Overall summary of all university service modules.</p>
            </div>

            <button
              className="admin-action-btn"
              onClick={fetchKuppiRequests}
              disabled={loading}
              type="button"
            >
              <RefreshCw size={16} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          <div className="admin-summary-grid">
            <div className="admin-summary-card gradient-blue">
              <div className="summary-icon">
                <LayoutDashboard size={20} />
              </div>
              <h3>Total Kuppi Requests</h3>
              <p className="summary-value">{loading ? '...' : totalRequests}</p>
            </div>

            <div className="admin-summary-card gradient-yellow">
              <div className="summary-icon pending">
                <Clock3 size={20} />
              </div>
              <h3>Pending Requests</h3>
              <p className="summary-value">{loading ? '...' : pendingRequests}</p>
            </div>

            <div className="admin-summary-card gradient-green">
              <div className="summary-icon approved">
                <CheckCircle2 size={20} />
              </div>
              <h3>Approved Requests</h3>
              <p className="summary-value">{loading ? '...' : approvedRequests}</p>
            </div>

            <div className="admin-summary-card gradient-purple">
              <div className="summary-icon">
                <BookOpen size={20} />
              </div>
              <h3>Latest Request</h3>
              <p className="summary-value small">{loading ? '...' : latestRequest}</p>
            </div>
          </div>

          <div className="admin-main-card">
            <div className="section-top">
              <div>
                <h2>Kuppi Requests Management</h2>
                <p>Quick access to review and manage submitted Kuppi requests.</p>
              </div>

              <button
                className="admin-action-btn"
                onClick={() => navigate('/admin-kuppi')}
                type="button"
              >
                Manage Kuppi Requests
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mini-stats">
              <div className="mini-stat-box">
                <span className="mini-label">Total</span>
                <span className="mini-number">{loading ? '...' : totalRequests}</span>
              </div>
              <div className="mini-stat-box">
                <span className="mini-label">Pending</span>
                <span className="mini-number">{loading ? '...' : pendingRequests}</span>
              </div>
              <div className="mini-stat-box">
                <span className="mini-label">Approved</span>
                <span className="mini-number">{loading ? '...' : approvedRequests}</span>
              </div>
            </div>
          </div>

          <div className="admin-placeholder-grid">
            {moduleCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className={`admin-module-card ${card.colorClass}`}>
                  <div className="module-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                  <button type="button" onClick={card.action}>
                    {card.actionText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainAdminDashboard;