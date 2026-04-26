import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, CheckCheck, X, Package, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './AdminTopBar.css';

const AdminTopBar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    
    const displayName = user?.name || user?.username || 'Admin User';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        if (!user) return;
        
        const fetchNotifications = async () => {
            try {
                const userId = user._id || user.id;
                const token = user.token || JSON.parse(localStorage.getItem('user') || '{}').token;
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

        const socket = io('http://localhost:5050');
        socket.emit('join_user_room', user._id || user.id);

        socket.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev.slice(0, 19)]);
            setUnreadCount(prev => prev + 1);
        });

        return () => socket.close();
    }, [user]);

    const handleNotificationClick = async (notif) => {
        try {
            const token = user.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            if (!notif.isRead) {
                await axios.patch(`http://localhost:5050/api/notifications/${notif._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setShowNotifDropdown(false);
            
            if (notif.type === 'claim') {
                navigate('/admin-lost-found');
            } else if (notif.type === 'ticket') {
                navigate('/admin-support/manage');
            }
        } catch (err) {
            console.error('Error handling notification click:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const userId = user._id || user.id;
            const token = user.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            await axios.patch(`http://localhost:5050/api/notifications/user/${userId}/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return d.toLocaleDateString();
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'claim': return <Package size={14} className="text-amber-500" />;
            case 'ticket': return <Ticket size={14} className="text-indigo-500" />;
            default: return <Bell size={14} className="text-slate-400" />;
        }
    };

    return (
        <header className="admin-topbar-component">
            <div className="admin-topbar-search">
                <Search size={16} className="admin-search-icon" />
                <input type="text" placeholder="Search for anything..." className="admin-search-input" />
            </div>

            <div className="admin-topbar-right">
                <div className="admin-notification-wrapper">
                    <button 
                        className="admin-icon-btn" 
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="admin-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                    </button>

                    {showNotifDropdown && (
                        <div className="admin-notif-dropdown">
                            <div className="admin-notif-header">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="admin-mark-read">
                                        <CheckCheck size={14} /> Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="admin-notif-list">
                                {notifications.length === 0 ? (
                                    <div className="admin-no-notifs">No new notifications</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif._id} 
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`admin-notif-item ${notif.isRead ? 'read' : 'unread'}`}
                                        >
                                            <div className="admin-notif-icon-box">
                                                {getNotifIcon(notif.type)}
                                            </div>
                                            <div className="admin-notif-content">
                                                <p className="admin-notif-msg">{notif.messagePreview}</p>
                                                <span className="admin-notif-time">{formatTime(notif.createdAt)}</span>
                                            </div>
                                            {!notif.isRead && <div className="admin-unread-dot" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="admin-user-profile-chip">
                    <div className="admin-avatar">
                        <span>{initials}</span>
                    </div>
                    <div className="admin-user-details">
                        <span className="admin-user-name">{displayName}</span>
                        <span className="admin-user-role">Administrator</span>
                    </div>
                    <ChevronDown size={14} className="admin-chevron" />
                </div>
            </div>
        </header>
    );
};

export default AdminTopBar;
