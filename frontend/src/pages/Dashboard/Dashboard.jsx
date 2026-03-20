import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1>Welcome to UniHub</h1>
        <p>Your central destination for campus activities, updates, and community connection.</p>
        <div className="button-group">
          <button className="primary-btn">Explore Lost & Found</button>
          <button className="secondary-btn">View Latest Updates</button>
        </div>
      </header>
      
      <section className="dashboard-grid">
        <div className="card">
          <div className="card-icon">🔍</div>
          <h3>Lost Something?</h3>
          <p>Easily report your lost items and let the community help you find them quickly.</p>
        </div>
        <div className="card">
          <div className="card-icon">🤝</div>
          <h3>Found Something?</h3>
          <p>Be a hero. Report items you've found on campus and connect with the owner safely.</p>
        </div>
        <div className="card">
          <div className="card-icon">📅</div>
          <h3>Upcoming Events</h3>
          <p>Stay up to date with the latest workshops, seminars, and student gatherings in uni.</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
