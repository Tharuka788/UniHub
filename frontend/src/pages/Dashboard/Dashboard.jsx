import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Ticket,
  Clock,
  CheckCircle,
  MoreHorizontal,
  ChevronRight,
  Package,
  QrCode,
  X
} from 'lucide-react';
import KuppiNotices from '../KuppiNotices/KuppiNotices';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

/* ─────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────── */
function useAnimatedCounter(target, duration = 900, start = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start || typeof target !== 'number') {
      setCount(target);
      return;
    }

    let startTime = null;
    const from = 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

/* ─────────────────────────────────────────────
   Shimmer skeleton for loading state
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="card-header">
        <div className="skeleton-line" style={{ width: 44, height: 44, borderRadius: 14 }} />
        <div className="skeleton-line" style={{ width: 24, height: 24, borderRadius: 8 }} />
      </div>
      <div className="skeleton-line" style={{ width: '55%', height: 18 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[80, 65, 70].map((w) => (
          <div key={w} className="skeleton-line" style={{ width: `${w}%`, height: 14 }} />
        ))}
      </div>
      <div className="skeleton-line" style={{ width: '100%', height: 46, borderRadius: 14 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated stat value
───────────────────────────────────────────── */
function AnimatedValue({ value, ready }) {
  const isNum = typeof value === 'number';
  const animated = useAnimatedCounter(isNum ? value : 0, 900, ready && isNum);
  return <>{isNum ? animated : value}</>;
}

/* ─────────────────────────────────────────────
   Main Dashboard Component
───────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [acceptedClaims, setAcceptedClaims] = useState([]);
  const [showQRModal, setShowQRModal] = useState(null);

  useEffect(() => {
    console.log('Current Dashboard User:', user);
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5050/api/items');
        setItems(data);
        
        // Fetch user's accepted claims
        if (user && user.token) {
          const claimsRes = await axios.get('http://localhost:5050/api/claims/my-claims', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          console.log('Dashboard Claims:', claimsRes.data);
          const pendingCollection = claimsRes.data.filter(c => 
            c.status === 'Accepted' && !c.isVerified
          );
          setAcceptedClaims(pendingCollection);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        setTimeout(() => setReady(true), 80);
      }
    };
    fetchDashboardData();
  }, [user]);

  const stats = [
    {
      title: 'Lost & Found',
      icon: Search,
      items: [
        {
          label: 'Recent Items',
          value: items.filter((i) => {
            const createdAt = new Date(i.createdAt);
            const now = new Date();
            return now - createdAt < 7 * 24 * 60 * 60 * 1000;
          }).length
        },
        { label: 'Total Reported', value: items.length },
        {
          label: 'Items Matched',
          value: items.filter((i) => i.itemType === 'Reclaimed').length,
          color: '#10b981'
        }
      ],
      buttonText: 'Report Lost Item',
      onClick: () => navigate('/report-lost')
    },
    {
      title: 'Kuppi Sessions',
      icon: BookOpen,
      items: [
        { label: 'Upcoming sessions', value: 2 },
        { label: 'Tutors available', value: 18 },
        { label: 'Pending Requests', value: 1, color: '#f59e0b' }
      ],
      buttonText: 'Request Kuppi',
      onClick: () => navigate('/kuppi-request')
    },
    {
      title: 'Support Tickets',
      icon: Ticket,
      items: [
        { label: 'Active Tickets', value: 3 },
        { label: 'Avg. Response Time', value: '1.2 hrs' },
        { label: 'Open Tickets Status', value: 'Normal', color: '#3b82f6' }
      ],
      buttonText: 'Create Ticket',
      onClick: () => navigate('/admin-support/create')
    }
  ];

  const recentItems = items.slice(0, 3).map((item) => ({
    name: item.title,
    location: item.location || 'Campus',
    time: new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    status: item.itemType,
    image: item.image
  }));

  const upcomingSessions = [
    {
      subject: 'Advanced Mathematics',
      tutor: 'Prof. Silva',
      time: 'Tomorrow, 2:00 PM',
      status: 'Confirmed'
    },
    {
      subject: 'Data Structures',
      tutor: 'Kamal Perera',
      time: 'Oct 28, 10:00 AM',
      status: 'Pending'
    },
    {
      subject: 'Physics 101',
      tutor: 'Nimali Fernando',
      time: 'Oct 30, 4:00 PM',
      status: 'Confirmed'
    }
  ];

  return (
    <div className="dashboard-content">
      {/* ── Ready for Collection (QR Alerts) ── */}
      {acceptedClaims.length > 0 && (
        <div className="collection-alerts animate-slide-up">
          {acceptedClaims.map(claim => (
            <div key={claim._id} className="collection-card">
              <div className="collection-info">
                <div className="collection-icon">
                  <QrCode size={24} />
                </div>
                <div>
                  <h4>Ready for Collection!</h4>
                  <p>Your claim for <strong>{claim.item?.title}</strong> was approved. Show the QR to collect.</p>
                </div>
              </div>
              <button className="view-qr-btn" onClick={() => setShowQRModal(claim)}>
                View QR Code
              </button>
            </div>
          ))}
        </div>
      )}
      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        {loading
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          : stats.map((stat) => (
              <div key={stat.title} className="stat-card">
                <div className="card-header">
                  <div className="card-icon-wrapper">
                    <stat.icon size={20} className="card-header-icon" />
                  </div>
                  <button className="card-menu">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <h3 className="card-title">{stat.title}</h3>

                <div className="card-items">
                  {stat.items.map((item) => (
                    <div key={item.label} className="card-item">
                      <span className="item-label">{item.label}</span>
                      <span
                        className="item-value"
                        style={item.color ? { color: item.color } : {}}
                      >
                        <AnimatedValue value={item.value} ready={ready} />
                      </span>
                    </div>
                  ))}
                </div>

                <button className="card-action-btn" onClick={stat.onClick}>
                  <Plus size={16} />
                  <span>{stat.buttonText}</span>
                </button>
              </div>
            ))}
      </div>

      {/* ── Kuppi Notices ── */}
      <KuppiNotices />

      {/* ── Bottom Sections ── */}
      <div className="dashboard-sections">
        {/* Recent Lost & Found */}
        <div className="dashboard-section recent-lost">
          <div className="section-header">
            <h3>Recent Lost &amp; Found</h3>
            <button
              className="view-all-btn"
              onClick={() => navigate('/lost-and-found')}
            >
              <span>View All</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="list-items">
            {loading ? (
              /* Skeleton list items */
              [0, 1, 2].map((i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.85rem 0.75rem' }}>
                  <div className="skeleton-line" style={{ width:48, height:48, borderRadius:14, flexShrink:0 }} />
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                    <div className="skeleton-line" style={{ width:'55%', height:14 }} />
                    <div className="skeleton-line" style={{ width:'40%', height:11 }} />
                  </div>
                  <div className="skeleton-line" style={{ width:60, height:22, borderRadius:999 }} />
                </div>
              ))
            ) : recentItems.length > 0 ? (
              recentItems.map((item, idx) => (
                <div key={idx} className="list-item">
                  <div className="item-details">
                    <div className="item-image-placeholder">
                      {item.image ? (
                        <img
                          src={
                            item.image.startsWith('http')
                              ? item.image
                              : `http://localhost:5050${item.image}`
                          }
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                        />
                      ) : (
                        <Package size={18} />
                      )}
                    </div>

                    <div className="item-info">
                      <h4 className="item-name">{item.name}</h4>
                      <span className="item-meta">
                        {item.location} &bull; {item.time}
                      </span>
                    </div>
                  </div>

                  <span className={`status-tag ${item.status?.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#64748b'
                }}
              >
                No recent items found
              </div>
            )}
          </div>
        </div>

        {/* Kuppi Schedule */}
        <div className="dashboard-section kuppi-schedule">
          <div className="section-header">
            <h3>My Kuppi Schedule</h3>
            <button
              className="view-all-btn"
              onClick={() => navigate('/kuppi-request')}
            >
              <span>View All</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="list-items">
            {upcomingSessions.map((session, idx) => (
              <div key={idx} className="list-item">
                <div className="item-details">
                  <div className="item-avatar-placeholder">
                    {session.subject.charAt(0)}
                  </div>

                  <div className="item-info">
                    <h4 className="item-name">{session.subject}</h4>
                    <span className="item-meta">
                      {session.tutor} &bull; {session.time}
                    </span>
                  </div>
                </div>

                <span className={`status-tag ${session.status.toLowerCase()}`}>
                  {session.status === 'Confirmed' ? (
                    <CheckCircle size={11} />
                  ) : (
                    <Clock size={11} />
                  )}
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

       {/* QR Modal */}
       {showQRModal && (
         <div className="qr-modal-overlay" onClick={() => setShowQRModal(null)}>
           <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
             <button className="close-modal" onClick={() => setShowQRModal(null)}>
               <X size={20} />
             </button>
             <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Collection QR Code</h3>
             <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Show this to the administrator to collect your item.</p>
             
             <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '2px solid #e2e8f0' }}>
               <img src={showQRModal.qrCode} alt="QR" style={{ width: '100%', maxWidth: '250px', margin: '0 auto' }} />
               <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#fff', borderRadius: '8px', fontSize: '0.85rem' }}>
                 <strong>Token:</strong> <code>{showQRModal.verificationToken}</code>
               </div>
             </div>
             
             <button 
               onClick={() => setShowQRModal(null)}
               style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', background: '#1e293b', color: '#fff', borderRadius: '12px', fontWeight: '700' }}
             >
               Close
             </button>
           </div>
         </div>
       )}
     </div>
  );
};

export default Dashboard;