import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Ticket,
  User,
  Settings,
  Circle,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Lost & Found', path: '/lost-and-found', icon: Search },
    { name: 'Kuppi Sessions', path: '/kuppi-request', icon: BookOpen },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Support Tickets', path: '/admin-support/tickets', icon: Ticket },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminItems = [
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: ShieldCheck },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Circle size={24} fill="currentColor" />
        </div>
        <h1>Uni Hub</h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <div className="sidebar-divider">
            <span>Admin</span>
          </div>
        )}

        {isAdmin && adminItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
