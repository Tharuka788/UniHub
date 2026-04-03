import React, { useState, useEffect } from 'react';
import { Search, Bell, Moon, ChevronDown, LogOut, User as UserIcon, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TopBar.css';

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const userId = user._id || user.id || 'mockUserId123';
      const token = user.token || localStorage.getItem('token') || 'mock-jwt-token';
      const response = await axios.get(`http://localhost:5050/api/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);

    if (user) {
      const userId = user._id || user.id || 'mockUserId123';
      newSocket.emit('join_user_room', userId);
    }

    newSocket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    });

    return () => newSocket.close();
  }, [user]);

  const handleNotificationClick = async (notif) => {
    try {
      const token = user.token || localStorage.getItem('token') || 'mock-jwt-token';
      if (!notif.isRead) {
        await axios.patch(`http://localhost:5050/api/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Close dropdown and navigate
      setShowNotifDropdown(false);
      navigate(`/item/${notif.itemId}?chatWith=${notif.senderId}`);
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user._id || user.id || 'mockUserId123';
      const token = user.token || localStorage.getItem('token') || 'mock-jwt-token';
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
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search resources, tickets, sessions..." 
          className="search-input"
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Moon size={20} />
        </button>
        
        <div className="notification-container">
          <button 
            className={`icon-btn notification-btn ${showNotifDropdown ? 'active' : ''}`}
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowDropdown(false);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllAsRead}>Mark all as read</button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">No new messages</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus size={14} className="text-green-500" />
                        <span className="notif-sender">Connection Request</span>
                      </div>
                      <p className="notif-message">{notif.messagePreview}</p>
                      <span className="notif-time">{formatTime(notif.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {user && (
          <div className="user-profile-container">
            <div className="user-profile" onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifDropdown(false);
            }}>
              <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role || 'Student'}</span>
              </div>
              <ChevronDown size={14} className={`profile-chevron ${showDropdown ? 'rotate' : ''}`} />
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout" onClick={logout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
