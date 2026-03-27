import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Support.css';

const SubmitTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    priority: 'Low'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/support/tickets', formData);
      setMessage('Ticket submitted successfully!');
      setTimeout(() => navigate('/support/my-tickets'), 2000);
    } catch (error) {
      setMessage('Error submitting ticket. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="support-container">
      <h2 className="support-title">Submit a Support Ticket</h2>
      {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
        </div>
        
        <div className="form-group">
          <label>Subject</label>
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Brief description of the issue" />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" placeholder="Detailed explanation..."></textarea>
        </div>
        
        <div className="form-group">
          <label>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default SubmitTicket;
