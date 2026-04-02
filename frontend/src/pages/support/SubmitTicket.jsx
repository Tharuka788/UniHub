import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
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
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="support-container animate-slide-up">
          <h1 className="support-title">Submit a Support Ticket</h1>
          <p className="support-subtitle">Please provide details of your issue, and our team will get back to you shortly.</p>
          
          {feedbackMsg && (
            <div style={{ 
              padding: '1rem', 
              background: feedbackMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', 
              color: feedbackMsg.includes('Error') ? '#991b1b' : '#166534', 
              borderRadius: '12px', 
              marginBottom: '2rem', 
              textAlign: 'center',
              fontWeight: '600',
              border: `1px solid ${feedbackMsg.includes('Error') ? '#fecaca' : '#bbf7d0'}`
            }}>
              {feedbackMsg}
            </div>
          )}

        <form onSubmit={handleSubmit} className="support-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Doe" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
          </div>

          <div className="form-group full-width">
            <label>Subject</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Brief description of the issue" />
          </div>

          <div className="form-group full-width">
            <label>Detailed Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Please explain your issue in detail..."></textarea>
          </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitTicket;
