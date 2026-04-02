import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  ShieldCheck, 
  LogOut, 
  Edit, 
  Lock, 
  Activity,
  Award,
  Clock,
  ExternalLink,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminProfile.css';

const AdminProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return (
        <div className="admin-loading-container">
            <div className="admin-loader"></div>
            <p>Authenticating Session...</p>
        </div>
    );

    const userInitials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

    const stats = [
        { label: 'System Access', value: 'Level 10', icon: ShieldCheck, color: 'blue' },
        { label: 'Tasks Completed', value: '42', icon: Activity, color: 'green' },
        { label: 'Active Since', value: 'Mar 2026', icon: Clock, color: 'purple' },
        { label: 'Reputation', value: 'Elite', icon: Award, color: 'gold' }
    ];

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main-content">
                <div className="admin-profile-container animate-fade-in">
                    <header className="profile-header-banner">
                        <div className="profile-banner-overlay"></div>
                    </header>

                    <div className="profile-content-wrapper">
                        <aside className="profile-left-sidebar">
                            <div className="admin-glass-card profile-main-info">
                                <div className="avatar-container">
                                    <div className="admin-avatar-glow"></div>
                                    <div className="admin-avatar-large">
                                        {userInitials}
                                        <button className="avatar-edit-icon" title="Change Avatar">
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="user-identity">
                                    <h2>{user.name}</h2>
                                    <span className="user-role-badge">
                                        <Shield size={14} />
                                        System Administrator
                                    </span>
                                </div>

                                <div className="login-status">
                                    <div className="status-indicator online"></div>
                                    <span>Active Session</span>
                                </div>

                                <div className="profile-action-stack">
                                    <button className="admin-btn-primary">
                                        <Edit size={16} />
                                        Edit Profile
                                    </button>
                                    <button className="admin-btn-outline logout" onClick={logout}>
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>

                            <div className="admin-glass-card quick-links">
                                <h3>Quick Actions</h3>
                                <button className="quick-link-item">
                                    <Lock size={16} />
                                    Change Password
                                </button>
                                <button className="quick-link-item">
                                    <Shield size={16} />
                                    Privacy Settings
                                </button>
                                <button className="quick-link-item" onClick={() => navigate('/admin-users')}>
                                    <Users size={16} />
                                    View Registered Users
                                </button>
                                <button className="quick-link-item">
                                    <ExternalLink size={16} />
                                    System Logs
                                </button>
                            </div>
                        </aside>

                        <section className="profile-main-details">
                            <div className="admin-glass-card stats-overview">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="stat-item-box">
                                        <div className={`stat-icon-bg ${stat.color}`}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div className="stat-data">
                                            <span className="stat-label">{stat.label}</span>
                                            <span className="stat-value">{stat.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="admin-glass-card details-form-section">
                                <div className="section-header">
                                    <User size={20} className="section-icon" />
                                    <h3>Account Information</h3>
                                </div>
                                
                                <div className="details-grid">
                                    <div className="info-field">
                                        <label><Mail size={14} /> Email Address</label>
                                        <div className="field-value-box">
                                            <span>{user.email}</span>
                                            <span className="field-tag verified">Verified</span>
                                        </div>
                                    </div>

                                    <div className="info-field">
                                        <label><Phone size={14} /> Contact Number</label>
                                        <div className="field-value-box">
                                            <span>{user.phoneNumber || 'Not Provided'}</span>
                                        </div>
                                    </div>

                                    <div className="info-field">
                                        <label><ShieldCheck size={14} /> Administrative Role</label>
                                        <div className="field-value-box">
                                            <span>Primary Administrator</span>
                                        </div>
                                    </div>

                                    <div className="info-field">
                                        <label><Clock size={14} /> Account Created</label>
                                        <div className="field-value-box">
                                            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'March 15, 2026'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-glass-card security-notice">
                                <div className="notice-icon">
                                    <Lock size={24} />
                                </div>
                                <div className="notice-content">
                                    <h4>Security Protocol Active</h4>
                                    <p>Your account is protected by industry-standard encryption. Ensure you logout before leaving your terminal unattended.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
