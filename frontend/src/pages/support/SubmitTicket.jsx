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
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg('');
    try {
      await axios.post('http://localhost:5050/admin-support/create', formData);
      setFeedbackMsg('Ticket submitted successfully!');
      setTimeout(() => navigate('/admin-support/tickets'), 2000);
    } catch (error) {
      console.error(error);
      setFeedbackMsg('Error submitting ticket. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="support-container">
      <h2 className="support-title">Submit a Support Ticket</h2>
      {feedbackMsg && <div style={{ padding: '10px', background: feedbackMsg.includes('Error') ? '#f8d7da' : '#d4edda', color: feedbackMsg.includes('Error') ? '#721c24' : '#155724', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{feedbackMsg}</div>}
      
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
          <label>Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Detailed explanation..."></textarea>
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default SubmitTicket;
