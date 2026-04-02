import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ItemForm.css';

const ItemForm = ({ formType }) => { // 'Lost' or 'Found'
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);

  const [titleError, setTitleError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      const regex = /^[a-zA-Z\s]*$/;
      if (!regex.test(value)) {
        setTitleError('Numbers and symbols are not allowed in titles.');
        return; // Prevent the character from being added
      } else {
        setTitleError('');
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('itemType', formType);
    if (image) {
      data.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5050/api/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.token}`
        },
      });
      
      if (formType === 'Lost' && response.data.matches && response.data.matches.length > 0) {
        setSuggestedMatches(response.data.matches);
        setShowMatches(true);
      } else {
        navigate('/lost-and-found'); // redirect back to dashboard
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showMatches) {
    return (
      <div className="lf-container">
        <div className="lf-header-new">
          <div className="lf-header-text">
            <h1>Potential Matches Found! 🎯</h1>
            <p>We found some items that look similar to the one you just reported. Is it one of these?</p>
          </div>
        </div>
        
        <div className="lf-items-grid">
          {suggestedMatches.map((match, idx) => (
            <div className="lf-item-card" key={match._id || idx}>
              <div className="lf-card-img-container">
                {match.image ? (
                  <img 
                    src={match.image.startsWith('http') ? match.image : `http://localhost:5050${match.image}`} 
                    alt={match.title} 
                  />
                ) : (
                  <div className="lf-img-placeholder">📦</div>
                )}
                <span className="lf-card-badge badge-found">Found</span>
              </div>
              <div className="lf-card-info">
                <span className="lf-card-category">{match.category}</span>
                <h3 className="lf-card-title">{match.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Match: {Math.round(match.similarityScore * 100)}%</p>
                <button className="lf-view-details" onClick={() => navigate('/lost-and-found')}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions" style={{ marginTop: '30px', justifyContent: 'center', display: 'flex' }}>
          <button 
            type="button" 
            className="lf-btn-report lost" 
            style={{ width: 'fit-content', padding: '0.75rem 2.5rem' }} 
            onClick={() => navigate('/lost-and-found')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-form-wrapper">
      <div className="item-form-container">
        <h2>Report a {formType} Item</h2>
        <p className="form-subtitle">Please provide details to help the community.</p>
        
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="lf-form">
          <div className="form-group">
            <label>Item Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. Blue Puma Backpack" 
              required 
            />
            {titleError && <small className="form-help-error" style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>{titleError}</small>}
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="" disabled>Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Documents">Documents/IDs</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Keys">Keys</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location</label>
            <select name="location" value={formData.location} onChange={handleChange} required>
              <option value="" disabled>Select a location</option>
              <option value="Library">Library</option>
              <option value="Engineering Faculty">Engineering Faculty</option>
              <option value="Canteen">Canteen</option>
              <option value="Gym">Gym</option>
              <option value="Hostel">Hostel</option>
              <option value="Computing Faculty">Computing Faculty</option>
              <option value="Science Faculty">Science Faculty</option>
              <option value="Main Hall">Main Hall</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder={`Where did you ${formType === 'Lost' ? 'lose' : 'find'} it? Any identifying marks?`} 
              rows="4" 
              maxLength="100"
              required 
            ></textarea>
            <div className="char-count" style={{ 
              textAlign: 'right', 
              fontSize: '0.8rem', 
              color: formData.description.length >= 100 ? '#ef4444' : '#64748b',
              marginTop: '4px' 
            }}>
              {formData.description.length}/100 characters
            </div>
          </div>

          <div className="form-group">
            <label>Upload Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="lf-file-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/lost-and-found')}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : `Submit ${formType} Item`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
