import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Lost & Found',
      icon: Search,
      items: [
        { label: 'Recent Items', value: 12 },
        { label: 'Total Reported', value: 45 },
        { label: 'Items Matched', value: 28, color: '#10b981' }
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
      onClick: () => navigate('/support')
    }
  ];

  const recentItems = [
    { name: 'MacBook Pro Charger', location: 'Library 2nd Floor', time: 'Today, 10:30 AM', status: 'Lost' },
    { name: 'Blue Water Bottle', location: 'Cafeteria', time: 'Yesterday', status: 'Found' },
    { name: 'Student ID Card', location: 'Main Auditorium', time: 'Oct 24', status: 'Found' }
  ];

  const upcomingSessions = [
    { subject: 'Advanced Mathematics', tutor: 'Prof. Silva', time: 'Tomorrow, 2:00 PM', status: 'Confirmed' },
    { subject: 'Data Structures', tutor: 'Kamal Perera', time: 'Oct 28, 10:00 AM', status: 'Pending' },
    { subject: 'Physics 101', tutor: 'Nimali Fernando', time: 'Oct 30, 4:00 PM', status: 'Confirmed' }
  ];

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, Tharuka! 👋</h1>
        <p className="welcome-subtitle">Here's your overview for today. You have 2 upcoming Kuppi sessions.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
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
                  <span className="item-value" style={item.color ? { color: item.color } : {}}>{item.value}</span>
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

      <div className="dashboard-sections">
        <div className="dashboard-section recent-lost">
          <div className="section-header">
            <h3>Recent Lost & Found</h3>
            <button className="view-all-btn">
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="list-items">
            {recentItems.map((item, idx) => (
              <div key={idx} className="list-item">
                <div className="item-details">
                  <div className="item-image-placeholder">
                    <Search size={18} />
                  </div>
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <span className="item-meta">{item.location} • {item.time}</span>
                  </div>
                </div>
                <span className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section kuppi-schedule">
          <div className="section-header">
            <h3>My Kuppi Schedule</h3>
            <button className="view-all-btn">
              <span>View All</span>
              <ChevronRight size={16} />
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
                    <span className="item-meta">{session.tutor} • {session.time}</span>
                  </div>
                </div>
                <span className={`status-tag ${session.status.toLowerCase()}`}>
                  {session.status === 'Confirmed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
