import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Lost & Found', path: '/lost-and-found' },
    { name: 'Payments', path: '/payments' },
    { name: 'Admin (Payments)', path: '/admin/payments' },
    { name: 'Support', path: '/support/submit' },
    { name: 'My Tickets', path: '/support/my-tickets' },
    { name: 'Admin (Support)', path: '/admin/support-login' },
    { name: 'Events', path: '/events' },
    { name: 'Updates', path: '/updates' },
    { name: 'Profile', path: '/profile' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          UniHub<span className="highlight">.</span>
        </Link>
        <div className="nav-links">
          {links.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path} 
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
