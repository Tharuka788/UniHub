import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ItemForm.css';

const ItemForm = ({ formType }) => { // 'Lost' or 'Found'
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    data.append('description', formData.description);
    data.append('itemType', formType);
    if (image) {
      data.append('image', image);
    }

    try {
      await axios.post('http://localhost:5050/api/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/lost-and-found'); // redirect back to dashboard
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="" disabled>Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Documents">Documents/IDs</option>
              <option value="Wallet">Wallet</option>
              <option value="Keys">Keys</option>
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
              required 
            ></textarea>
          </div>

          <div className="form-group">
            <label>Upload Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="file-input"
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
