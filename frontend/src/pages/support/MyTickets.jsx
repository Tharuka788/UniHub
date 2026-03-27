import React, { useState } from 'react';
import axios from 'axios';
import './Support.css';

const MyTickets = () => {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTickets = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/support/tickets/user/${email}`);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
    setLoading(false);
    setSearched(true);
  };

  const getStatusClass = (status) => {
    return `status-${status.replace(' ', '')}`;
  };

  return (
    <div className="support-container" style={{ maxWidth: '900px' }}>
      <div className="tickets-header">
        <h2 className="support-title">My Support Tickets</h2>
      </div>

      <form onSubmit={fetchTickets} className="search-bar">
        <input 
          type="email" 
          placeholder="Enter your email to view tickets..." 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Tools'}
        </button>
      </form>

      {searched && tickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No tickets found for this email.
        </div>
      )}

      {tickets.map(ticket => (
        <div key={ticket._id} className="ticket-card">
          <div className="ticket-info">
            <h3>{ticket.subject} <span className={`priority-badge priority-${ticket.priority}`}>{ticket.priority}</span></h3>
            <p><strong>Submitted:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
            <p><strong>Description:</strong> {ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}</p>
          </div>
          <div className="ticket-actions">
            <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyTickets;
