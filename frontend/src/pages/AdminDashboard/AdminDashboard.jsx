import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminModules = [
    {
      title: 'Lost & Found Management',
      description: 'Manage items reported lost or found by students, track status, and handle reclamations.',
      path: '/admin-lost-found',
      icon: Search,
      color: 'blue'
    },
    {
      title: 'Kuppi Requests',
      description: 'Review and approve batch representative requests for Kuppi sessions.',
      path: '/admin-kuppi',
      icon: BookOpen,
      color: 'yellow'
    },
    {
      title: 'Financial Review',
      description: 'Validate and monitor student payment submissions and verify financial transactions.',
      path: '/admin-payments',
      icon: CreditCard,
      color: 'green'
    }
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="admin-hub-container">
          <header className="admin-hub-header animate-slide-up">
            <div className="hub-title-box">
              <div className="hub-icon">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <h1>Admin Hub</h1>
                <p>Central Command Center for Uni Hub Management</p>
              </div>
            </div>
          </header>

          <div className="admin-modules-grid stagger-1 animate-slide-up">
            {adminModules.map((module) => (
              <div 
                key={module.path} 
                className={`module-card ${module.color}`}
                onClick={() => navigate(module.path)}
              >
                <div className="module-icon-box">
                  <module.icon size={32} />
                </div>
                <div className="module-content">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                <div className="module-footer">
                  <span className="manage-link">
                    Manage Module <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <footer className="admin-hub-footer animate-fade-in stagger-2">
            <div className="footer-status">
              <ShieldCheck size={18} />
              <span>Secure Administrative Session Active</span>
            </div>
            <p>© 2026 Uni Hub University Ecosystem Management System</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
