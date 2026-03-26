import React from 'react';
import { Search, Bell, Moon, ChevronDown } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
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
        
        <div className="user-profile">
          <div className="avatar">T</div>
          <div className="user-info">
            <span className="user-name">Tharuka</span>
            <span className="user-role">Student</span>
          </div>
          <ChevronDown size={14} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
