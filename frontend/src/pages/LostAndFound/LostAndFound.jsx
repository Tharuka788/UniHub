import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LostAndFound.css';

const LostAndFound = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Lost');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5050/api/items?itemType=${activeTab}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    setLoading(false);
  };

  return (
    <div className="lf-dashboard">
      <div className="lf-header">
        <h1>Lost & Found Center</h1>
        <p>Reuniting students with their belongings. Report or find items easily.</p>
        <div className="lf-actions">
          <button className="lf-btn lf-btn-primary" onClick={() => navigate('/report-lost')}>Report Lost Item</button>
          <button className="lf-btn lf-btn-secondary" onClick={() => navigate('/report-found')}>Report Found Item</button>
        </div>
      </div>

      <div className="lf-tabs">
        <button 
          className={`lf-tab ${activeTab === 'Lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('Lost')}
        >
          Lost Items
        </button>
        <button 
          className={`lf-tab ${activeTab === 'Found' ? 'active' : ''}`}
          onClick={() => setActiveTab('Found')}
        >
          Found Items
        </button>
      </div>

      <div className="lf-content">
        {loading ? (
          <div className="lf-loader">
            <div className="spinner"></div>
            <p>Fetching {activeTab} items...</p>
          </div>
        ) : (
          <div className="lf-grid">
            {items.length > 0 ? (
              items.map(item => (
                <div className="lf-card" key={item._id}>
                  <div className="lf-card-image-placeholder">
                    {item.image ? (
                      <img src={`http://localhost:5050${item.image}`} alt={item.title} className="lf-card-img" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="lf-card-body">
                    <span className="lf-badge">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="lf-card-footer">
                      <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                      <button className="lf-btn-small">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="lf-empty">
                <h3>No {activeTab} items reported yet.</h3>
                <p>If you've {activeTab === 'Lost' ? 'lost' : 'found'} something recently, please report it to help the community.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LostAndFound;
