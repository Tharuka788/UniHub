import React, { useState } from 'react';
import { Search, Bell, Moon, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

const TopBar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

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
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        
        {user && (
          <div className="user-profile-container">
            <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
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
