import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Users, CreditCard,
  MessageSquare, User, ExternalLink, QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard',       path: '/admin-dashboard',      icon: LayoutDashboard },
    { name: 'Lost & Found',    path: '/admin-lost-found',     icon: Search },
    { name: 'Kuppi Sessions',  path: '/admin-kuppi',          icon: Users },
    { name: 'Payments',        path: '/admin-payments',       icon: CreditCard },
    { name: 'Support Tickets', path: '/admin-support/manage', icon: MessageSquare },
    { name: 'Profile',         path: '/admin-profile',        icon: User },
    { name: 'Student Portal',  path: '/admin-students-portal',icon: ExternalLink },
  ];



  return (
    <aside className="admin-sidebar-v2">
      {/* Logo */}
      <div className="sidebar-brand">
        <img src="/logo.png" alt="UniHub" className="sidebar-logo-img"
          style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }} />
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav-v2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.name} to={item.path}
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}>
              <Icon size={17} className="sidebar-nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer-v2">
        <div className="sidebar-divider" />

        <div className="sidebar-divider" style={{ margin: '0.25rem 0' }} />
      </div>
    </aside>
  );
};

export default AdminSidebar;