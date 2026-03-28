import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, 
  MapPin, 
  Tag, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  Package,
  Clock,
  ExternalLink,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import LostFoundAnalytics from './LostFoundAnalytics';
import './AdminLostFound.css';

const AdminLostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [statsData, setStatsData] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5050/api/items');
      setItems(res.data);
    } catch (err) {
      setError('Unable to fetch lost & found records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5050/api/items/stats', {
        headers: { Authorization: 'Bearer mock-jwt-admin-token' }
      });
      setStatsData(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setActionLoading(id);
    try {
      await axios.delete(`http://localhost:5050/api/items/${id}`, {
        headers: { Authorization: 'Bearer mock-jwt-admin-token' }
      });
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      alert('Error deleting item.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (id, newType) => {
    setActionLoading(id);
    try {
      await axios.put(
        `http://localhost:5050/api/items/${id}`,
        { itemType: newType },
        { headers: { Authorization: 'Bearer mock-jwt-admin-token' } }
      );
      setItems(items.map(item => item._id === id ? { ...item, itemType: newType } : item));
    } catch (err) {
      alert('Error updating status.');
    } finally {
      setActionLoading(null);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(items.map(item => item.category))];
    return ['All', ...cats];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || item.itemType === filterType;
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [items, searchTerm, filterType, filterCategory]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      lost: items.filter(i => i.itemType === 'Lost').length,
      found: items.filter(i => i.itemType === 'Found').length,
      reclaimed: items.filter(i => i.itemType === 'Reclaimed').length
    };
  }, [items]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <main className="admin-main-content">
        <div className="admin-lost-found-container">
          
          {/* Header */}
          <header className="admin-page-header">
            <div>
              <h1>Manage Lost & Found</h1>
              <p>Oversee all reported items across the campus ecosystem</p>
            </div>
            <div className="header-actions-main">
              <button 
                className={`toggle-view-btn ${showAnalytics ? 'active' : ''}`}
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? (
                  <><Filter size={18} /> <span>Show Table</span></>
                ) : (
                  <><BarChart2 size={18} /> <span>Show Analytics</span></>
                )}
              </button>
            </div>
          </header>

          {/* Stats Bar */}
          <div className="admin-summary-grid">
            <div className="summary-card all">
              <div className="card-icon"><Package size={24} /></div>
              <div className="card-info">
                <span>Total Items</span>
                <h3>{stats.total}</h3>
              </div>
            </div>
            <div className="summary-card lost">
              <div className="card-icon"><AlertCircle size={24} /></div>
              <div className="card-info">
                <span>Lost Reports</span>
                <h3>{stats.lost}</h3>
              </div>
            </div>
            <div className="summary-card found">
              <div className="card-icon"><CheckCircle size={24} /></div>
              <div className="card-info">
                <span>Found Items</span>
                <h3>{stats.found}</h3>
              </div>
            </div>
            <div className="summary-card reclaimed">
              <div className="card-icon"><Clock size={24} /></div>
              <div className="card-info">
                <span>Reclaimed</span>
                <h3>{stats.reclaimed}</h3>
              </div>
            </div>
          </div>

          {/* Filters Area */}
          <div className="admin-filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters-group">
              <div className="filter-select">
                <Tag size={16} />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                  <option value="Reclaimed">Reclaimed</option>
                </select>
              </div>
              <div className="filter-select">
                <Filter size={16} />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data Table or Analytics */}
          {showAnalytics ? (
            <LostFoundAnalytics stats={statsData} />
          ) : (
            <div className="admin-table-card">
              {error && <div className="error-banner">{error}</div>}
              
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item Info</th>
                      <th>Category & Location</th>
                      <th>Reporter</th>
                      <th>Status</th>
                      <th>Date Reported</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="loading-state">
                          <div className="spinner"></div>
                          <p>Loading items...</p>
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          <Package size={48} />
                          <p>No items found matching your criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map(item => (
                        <tr key={item._id} className="item-row">
                          <td>
                            <div className="item-cell">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="item-thumb" />
                              ) : (
                                <div className="item-thumb-placeholder"><Package size={16} /></div>
                              )}
                              <div>
                                <span className="item-title">{item.title}</span>
                                <span className="item-desc">{item.description.substring(0, 40)}...</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="meta-cell">
                              <span className="category-label">{item.category}</span>
                              <span className="location-label"><MapPin size={12} /> {item.location}</span>
                            </div>
                          </td>
                          <td>
                            <div className="reporter-info">
                              <span className="reporter-name">{item.owner?.name || 'Anonymous'}</span>
                              <span className="reporter-status">{item.owner ? 'Registered User' : 'Guest'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${item.itemType.toLowerCase()}`}>
                              {item.itemType}
                            </span>
                          </td>
                          <td>
                            <span className="date-label">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="text-right">
                            <div className="action-btns">
                              {item.itemType !== 'Reclaimed' && (
                                <button 
                                  className="btn-icon check" 
                                  title="Mark as Reclaimed"
                                  onClick={() => handleStatusUpdate(item._id, 'Reclaimed')}
                                  disabled={actionLoading === item._id}
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              <button 
                                className="btn-icon delete" 
                                title="Delete Item"
                                onClick={() => handleDelete(item._id)}
                                disabled={actionLoading === item._id}
                              >
                                <Trash2 size={16} />
                              </button>
                              <a 
                                href={`/item/${item._id}`} 
                                target="_blank" 
                                className="btn-icon view" 
                                title="View Public Page"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLostFound;
