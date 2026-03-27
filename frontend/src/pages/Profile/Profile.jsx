import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, LogOut, Edit2, ShieldCheck, Calendar } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) return <div className="profile-loading">Loading user profile...</div>;

    const userInitials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

    return (
        <div className="profile-page-container animate-fade-in">
            <div className="profile-header-section">
                <h1 className="profile-main-title">My Profile</h1>
                <p className="profile-subtitle">Manage your personal information and account settings.</p>
            </div>

            <div className="profile-layout">
                <div className="profile-card main-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                            {userInitials}
                            <button className="edit-avatar-btn" title="Change Avatar">
                                <Edit2 size={16} />
                            </button>
                        </div>
                        <h2 className="profile-name">{user.name}</h2>
                        <span className="profile-tag">{user.isAdmin ? 'Administrator' : 'Student'}</span>
                    </div>

                    <div className="profile-details-grid">
                        <div className="profile-detail-item">
                            <div className="detail-icon-wrapper">
                                <Mail size={18} />
                            </div>
                            <div className="detail-info">
                                <label>Email Address</label>
                                <span>{user.email}</span>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="detail-icon-wrapper">
                                <Phone size={18} />
                            </div>
                            <div className="detail-info">
                                <label>Phone Number</label>
                                <span>{user.phoneNumber}</span>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="detail-icon-wrapper">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="detail-info">
                                <label>Account Status</label>
                                <span className="status-verified">Verified</span>
                            </div>
                        </div>

                        <div className="profile-detail-item">
                            <div className="detail-icon-wrapper">
                                <Calendar size={18} />
                            </div>
                            <div className="detail-info">
                                <label>Member Since</label>
                                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Mar 2026'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="profile-btn secondary">
                            <Edit2 size={16} />
                            <span>Edit Profile</span>
                        </button>
                        <button className="profile-btn danger" onClick={logout}>
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                <div className="profile-sidebar-info">
                    <div className="info-card">
                        <h3>Security Options</h3>
                        <p>Keep your account secure by enabling two-factor authentication or changing your password regularly.</p>
                        <button className="sidebar-action-link">Change Password</button>
                    </div>
                    <div className="info-card">
                        <h3>Privacy Settings</h3>
                        <p>Control who can see your activity and information on the hub.</p>
                        <button className="sidebar-action-link">Manage Privacy</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
