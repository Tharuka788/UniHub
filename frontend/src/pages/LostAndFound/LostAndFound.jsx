import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Tag, 
  Plus, 
  Megaphone, 
  Filter, 
  ChevronDown,
  ExternalLink,
  Package
} from 'lucide-react';
import './LostAndFound.css';

const LostAndFound = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All Categories', 'Electronics', 'Bags', 'Keys', 'Books', 'Clothing', 'Documents', 'Other'];
  const locations = ['All Locations', 'Library', 'Engineering Faculty', 'Canteen', 'Gym', 'Hostel', 'Computing Faculty', 'Science Faculty', 'Main Hall'];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchQuery, categoryFilter, locationFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5050/api/items', {
        params: {
          itemType: activeTab,
          search: searchQuery,
          category: categoryFilter,
          location: locationFilter
        }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    setLoading(false);
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Lost': return 'badge-lost';
      case 'Found': return 'badge-found';
      case 'Reclaimed': return 'badge-reclaimed';
      default: return '';
    }
  };

  return (
    <div className="lf-container">
      {/* Header Section */}
      <header className="lf-header-new">
        <div className="lf-header-content">
          <div className="lf-header-text">
            <h1>Lost & Found Hub</h1>
            <p>Recover your lost items or help a fellow student by posting found belongings across the university campus.</p>
          </div>
          <div className="lf-header-actions">
            <button className="lf-btn-report lost" onClick={() => navigate('/report-lost')}>
              <Plus size={18} /> Report Lost Item
            </button>
            <button className="lf-btn-report found" onClick={() => navigate('/report-found')}>
              <Megaphone size={18} /> Post Found Item
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="lf-search-wrapper">
          <div className="lf-search-bar">
            <Search className="lf-search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by keyword, location, or item..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="lf-filters-row">
          <div className="lf-tabs-new">
            {['All', 'Lost', 'Found', 'Reclaimed'].map(tab => (
              <button 
                key={tab}
                className={`lf-tab-new ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="lf-dropdowns">
            <div className="lf-select-wrapper">
              <Tag size={16} className="lf-select-icon" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown size={14} className="lf-chevron" />
            </div>

            <div className="lf-select-wrapper">
              <MapPin size={16} className="lf-select-icon" />
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <ChevronDown size={14} className="lf-chevron" />
            </div>

            <button className="lf-filter-btn">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <main className="lf-main-content">
        {loading ? (
          <div className="lf-loading-state">
            <div className="lf-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="lf-items-grid">
            {items.map(item => (
              <div className="lf-item-card" key={item._id}>
                <div className="lf-card-img-container">
                  {item.image ? (
                    <img 
                      src={item.image.startsWith('http') ? item.image : `http://localhost:5050${item.image}`} 
                      alt={item.title} 
                    />
                  ) : (
                    <div className="lf-img-placeholder">
                      <Package size={48} />
                    </div>
                  )}
                  <span className={`lf-card-badge ${getBadgeColor(item.itemType)}`}>
                    {item.itemType}
                  </span>
                </div>
                <div className="lf-card-info">
                  <span className="lf-card-category">{item.category}</span>
                  <h3 className="lf-card-title">{item.title}</h3>
                  <div className="lf-card-meta">
                    <div className="lf-meta-item">
                      <MapPin size={14} />
                      <span>{item.location || 'Campus'}</span>
                    </div>
                    <div className="lf-meta-item">
                      <Calendar size={14} />
                      <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <button className="lf-view-details" onClick={() => navigate(`/item/${item._id}`)}>
                    <ExternalLink size={14} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="lf-no-items">
            <Package size={64} />
            <h3>No items found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LostAndFound;
