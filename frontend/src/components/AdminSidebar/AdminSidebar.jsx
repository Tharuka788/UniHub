import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Lost & Found', path: '/admin-lost-found', icon: Search },
    { name: 'Kuppi Sessions', path: '/admin-kuppi', icon: Users },
    { name: 'Payments', path: '/admin-payments', icon: CreditCard },
    { name: 'Support Tickets', path: '/admin-support/manage', icon: MessageSquare },
    { name: 'Profile', path: '/admin-profile', icon: User },

  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar-v2">
      {/* Branding */}
      <div className="sidebar-brand">
        <img 
          src="/logo.png" 
          alt="UniHub Logo" 
          className="sidebar-logo-img" 
          style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }}
        />
      </div>

      {/* Nav Label */}
      <p className="sidebar-section-label">NAVIGATION</p>

      {/* Navigation */}
      <nav className="sidebar-nav-v2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={17} className="sidebar-nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer-v2">
        <div className="sidebar-divider" />
        <button className="sidebar-nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={17} className="sidebar-nav-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;