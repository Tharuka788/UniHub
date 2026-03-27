import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  BookOpen,
  CreditCard,
  Search,
  Ticket,
  CalendarDays,
  Shield
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Admin Profile', path: '/admin-profile', icon: User },
    { name: 'Manage Kuppi Requests', path: '/admin-kuppi', icon: BookOpen },
    { name: 'Payment Module', path: '/admin-payments', icon: CreditCard },
    { name: 'Manage Lost & Found', path: '/admin-lost-found', icon: Search },
    { name: 'Support Module', path: '/admin-support', icon: Ticket },
    { name: 'Event Module', path: '/admin-events', icon: CalendarDays },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div className="admin-logo-icon">
          <Shield size={22} />
        </div>
        <div>
          <h2>Uni Hub</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="admin-nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;