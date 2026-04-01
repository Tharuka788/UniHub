import React, { useState } from 'react';
import axios from 'axios';
import './Support.css';

const MyTickets = () => {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTickets = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5050/admin-support/tickets?email=${encodeURIComponent(email)}`);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Error fetching tickets. Please check the backend.');
    }
    setLoading(false);
    setSearched(true);
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status.replace(' ', '')}`;
  };

  return (
    <div className="support-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div className="tickets-header">
        <h2 className="support-title">My Support Tickets</h2>
      </div>

      <form onSubmit={fetchTickets} className="search-bar" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="email"
          placeholder="Enter your email to view tickets..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Searching...' : 'Search Tickets'}
        </button>
      </form>

      {searched && tickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
          No tickets found for this email.
        </div>
      )}

      {tickets.map(ticket => (
        <div key={ticket._id} className="ticket-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{ticket.subject}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}><strong>Submitted:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`ticket-status ${getStatusClass(ticket.status)}`} style={{ padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85em', textTransform: 'capitalize' }}>
              {ticket.status}
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#444' }}>Message:</p>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>
              {ticket.message}
            </div>
          </div>

          <div style={{ background: '#eef2f5', padding: '15px', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '16px' }}>Admin Response:</h4>
            {ticket.response ? (
              <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>
                {ticket.response}
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                No response yet. Support will reply soon.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyTickets;
