import React, { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Bell, Search, ChevronDown, Settings, ChevronLeft, ChevronRight,
  Calendar, ArrowUpDown, BookOpen, CheckCircle, Clock, 
  AlertCircle, TrendingUp, Users, Ticket, MapPin, X
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminTopBar from '../../components/AdminTopBar/AdminTopBar';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

/* ── Fixed Animated Counter Hook ── */
function useAnimatedCounter(target, duration = 800, enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame;

    if (!enabled || typeof target !== 'number') {
      // FIX: Linter error එක එන්නේ නැති වෙන්න async විදිහට state update කරනවා
      animationFrame = requestAnimationFrame(() => setCount(target));
    } else {
      let startTime = null;
      const step = (ts) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        setCount(Math.round(target * eased));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };
      animationFrame = requestAnimationFrame(step);
    }

    // Cleanup function: පේජ් එකෙන් යද්දී ඇනිමේෂන් එක නවත්වනවා
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, enabled]);

  return count;
}

function SkeletonSummaryCard() {
  return (
    <div className="adm-summary-card adm-skeleton-card">
      <div className="adm-skeleton-line" style={{ width: 44, height: 44, borderRadius: 14 }} />
      <div style={{ flex: 1 }}>
        <div className="adm-skeleton-line" style={{ width: '50%', height: 14, marginBottom: 10 }} />
        <div className="adm-skeleton-line" style={{ width: '35%', height: 28 }} />
      </div>
    </div>
  );
}

/* ── Module Summary Section ── */
function ModuleSummarySection({ lostData, kuppiData, ticketData, ready }) {
  const navigate = useNavigate();

  const lTotal = useAnimatedCounter(lostData?.total ?? 0, 900, ready);
  const kTotal = useAnimatedCounter(kuppiData?.total ?? 0, 900, ready);
  const tTotal = useAnimatedCounter(ticketData?.total ?? 0, 900, ready);

  return (
    <section className="adm-summary-section">
      <div className="adm-summary-header">
        <h2 className="adm-summary-title">Module Overview</h2>
        <p className="adm-summary-subtitle">Live real-time performance summary</p>
      </div>
      <div className="adm-summary-grid">
        {!lostData ? <SkeletonSummaryCard /> : (
          <div className="adm-summary-card" style={{ '--card-accent': '#3b82f6', '--card-accent-light': '#eff6ff' }} onClick={() => navigate('/admin-lost-found')}>
            <div className="adm-summary-card-glow" />
            <div className="adm-summary-icon-ring"><Search size={20} /></div>
            <div className="adm-summary-main">
              <p className="adm-summary-module-label">Lost & Found</p>
              <p className="adm-summary-big-number">{lTotal}</p>
              <p className="adm-summary-big-label">Total Reports</p>
            </div>
          </div>
        )}

        {!kuppiData ? <SkeletonSummaryCard /> : (
          <div className="adm-summary-card" style={{ '--card-accent': '#f59e0b', '--card-accent-light': '#fffbeb' }} onClick={() => navigate('/admin-kuppi')}>
            <div className="adm-summary-card-glow" />
            <div className="adm-summary-icon-ring"><BookOpen size={20} /></div>
            <div className="adm-summary-main">
              <p className="adm-summary-module-label">Kuppi Sessions</p>
              <p className="adm-summary-big-number">{kTotal}</p>
              <p className="adm-summary-big-label">Total Sessions</p>
            </div>
          </div>
        )}

        {!ticketData ? <SkeletonSummaryCard /> : (
          <div className="adm-summary-card" style={{ '--card-accent': '#10b981', '--card-accent-light': '#f0fdf4' }} onClick={() => navigate('/admin-support')}>
            <div className="adm-summary-card-glow" />
            <div className="adm-summary-icon-ring"><Ticket size={20} /></div>
            <div className="adm-summary-main">
              <p className="adm-summary-module-label">Support Tickets</p>
              <p className="adm-summary-big-number">{tTotal}</p>
              <p className="adm-summary-big-label">Total Tickets</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Analytics Charts ── */
function AnalyticsCharts({ lostData, kuppiData, ticketData }) {
  if (!lostData || !kuppiData || !ticketData) {
    return (
      <div className="ad-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="ad-card" style={{ height: '350px' }}><div className="adm-skeleton-line" style={{width: '100%', height:'100%'}}/></div>
        <div className="ad-card" style={{ height: '350px' }}><div className="adm-skeleton-line" style={{width: '100%', height:'100%'}}/></div>
      </div>
    );
  }

  const lfChartData = [
    { name: 'Lost Items', value: lostData.lost, color: '#ef4444' },
    { name: 'Found Items', value: lostData.found, color: '#10b981' }
  ];

  const kuppiChartData = [
    { name: 'Sessions', Pending: kuppiData.pending, 'Active/Completed': Math.max(0, kuppiData.total - kuppiData.pending) }
  ];

  const ticketChartData = [
    { name: 'Open', value: ticketData.open, color: '#f59e0b' },
    { name: 'Closed/Resolved', value: Math.max(0, ticketData.total - ticketData.open), color: '#3b82f6' }
  ];

  return (
    <div className="ad-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
      
      {/* Lost & Found Distribution Chart */}
      <div className="ad-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="ad-card-header" style={{ padding: '0 0 1rem 0', borderBottom: 'none' }}>
          <h2 className="ad-card-title" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Lost & Found Distribution</h2>
        </div>
        <div style={{ flex: 1, minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={lfChartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {lfChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
                itemStyle={{ fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kuppi Sessions Bar Chart */}
      <div className="ad-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="ad-card-header" style={{ padding: '0 0 1rem 0', borderBottom: 'none' }}>
          <h2 className="ad-card-title" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Kuppi Session Status</h2>
        </div>
        <div style={{ flex: 1, minHeight: '260px', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kuppiChartData} barSize={45}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="Active/Completed" fill="#3b82f6" radius={[6, 6, 6, 6]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Support Tickets Chart */}
      <div className="ad-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="ad-card-header" style={{ padding: '0 0 1rem 0', borderBottom: 'none' }}>
          <h2 className="ad-card-title" style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Support Tickets</h2>
        </div>
        <div style={{ flex: 1, minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ticketChartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {ticketChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
                itemStyle={{ fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
import AdminClaimReviewModal from '../../components/ClaimModal/AdminClaimReviewModal';

/* ── Main Dashboard ── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedClaimForReview, setSelectedClaimForReview] = useState(null);

  // Lifted state for data fetching
  const [lostData, setLostData] = useState(null);
  const [kuppiData, setKuppiData] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [itemsRes, kuppiRes, ticketsRes] = await Promise.allSettled([
          axios.get('http://localhost:5050/api/items'),
          axios.get('http://localhost:5050/api/kuppi'),
          axios.get('http://localhost:5050/admin-support/tickets'),
        ]);

        if (itemsRes.status === 'fulfilled') {
          const items = itemsRes.value.data?.items || (Array.isArray(itemsRes.value.data) ? itemsRes.value.data : []);
          setLostData({
            total: items.length,
            lost: items.filter(i => i.itemType?.toLowerCase() === 'lost').length,
            found: items.filter(i => i.itemType?.toLowerCase() === 'found').length,
          });
        }

        if (kuppiRes.status === 'fulfilled') {
          const sessions = kuppiRes.value.data?.sessions || (Array.isArray(kuppiRes.value.data) ? kuppiRes.value.data : []);
          setKuppiData({
            total: sessions.length,
            pending: sessions.filter(s => s.status?.toLowerCase() === 'pending').length,
          });
        }

        if (ticketsRes.status === 'fulfilled') {
          const tickets = ticketsRes.value.data?.tickets || (Array.isArray(ticketsRes.value.data) ? ticketsRes.value.data : []);
          setTicketData({
            total: tickets.length,
            open: tickets.filter(t => t.status?.toLowerCase() === 'open').length,
          });
        }
      } catch (err) {
        console.error('Data loading error:', err);
      } finally {
        setReady(true);
      }
    };
    load();
  }, []);

  // Notification Loading & Socket Effect
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const userId = user._id || user.id;
        const token = user.token || localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        if (!token) return;
        const response = await axios.get(`http://localhost:5050/api/notifications/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Error fetching admin notifications:', err);
      }
    };

    fetchNotifications();

    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);
    
    newSocket.emit('join_user_room', user._id || user.id);

    newSocket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    });

    return () => newSocket.close();
  }, [user]);

  const handleNotificationClick = async (notif) => {
    try {
      const token = user.token || JSON.parse(localStorage.getItem('user')).token;
      if (!notif.isRead) {
        await axios.patch(`http://localhost:5050/api/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setShowNotifDropdown(false);
      
      // specific logic for claims
      if (notif.type === 'claim') {
        try {
          const { data: claims } = await axios.get(`http://localhost:5050/api/claims/item/${notif.itemId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          const targetClaim = claims.find(c => (c.requester._id || c.requester.id || c.requester) === notif.senderId);
          if (targetClaim) {
             setSelectedClaimForReview(targetClaim);
          } else {
             alert('Claim may have been removed or already actioned.');
          }
        } catch (fetchErr) {
           console.error('Failed to fetch claim', fetchErr);
           navigate('/admin-lost-found'); // fallback
        }
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const handleClaimAction = async (claimId, status) => {
    try {
       const token = user.token || JSON.parse(localStorage.getItem('user')).token;
       await axios.patch(`http://localhost:5050/api/claims/${claimId}/status`, { status }, {
          headers: { Authorization: `Bearer ${token}` }
       });
       setSelectedClaimForReview(null);
       alert(`Claim successfully ${status.toLowerCase()}!`);
    } catch (err) {
       console.error('Error updating status', err);
       alert('Error updating claim status.');
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user._id || user.id;
      const token = user.token || JSON.parse(localStorage.getItem('user')).token;
      await axios.patch(`http://localhost:5050/api/notifications/user/${userId}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const displayName = user?.name || user?.username || 'Admin User';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="ad-layout">
      <AdminSidebar />
      <main className="ad-main">
        <AdminTopBar />

        <div className="ad-content">
          <ModuleSummarySection lostData={lostData} kuppiData={kuppiData} ticketData={ticketData} ready={ready} />
          <AnalyticsCharts lostData={lostData} kuppiData={kuppiData} ticketData={ticketData} />
        </div>
      </main>

      {/* Claim Review Overlay */}
      <AdminClaimReviewModal 
        claim={selectedClaimForReview}
        onClose={() => setSelectedClaimForReview(null)}
        onAction={handleClaimAction} 
      />
    </div>
  );
};

const AdminDashboardWrapper = () => (
  <ErrorBoundary fallbackRender={({ error }) => (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h1>Dashboard Error</h1>
      <pre>{error.message}</pre>
    </div>
  )}>
    <AdminDashboard />
  </ErrorBoundary>
);

export default AdminDashboardWrapper;