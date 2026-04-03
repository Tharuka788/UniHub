import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
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
      const { data } = await axios.get(
        `http://localhost:5050/admin-support/tickets?email=${encodeURIComponent(email)}`
      );
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
    <div className="support-container">
      {/* Header */}
      <div className="tickets-header">
        <h2 className="support-title">My Support Tickets</h2>
      </div>

      {/* Search */}
      <form
        onSubmit={fetchTickets}
        className="search-bar"
        style={{ display: 'flex', gap: '12px', marginBottom: '3rem' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Mail
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="email"
            placeholder="Enter your registered email to search..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '0.85rem 1rem 0.85rem 2.8rem',
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Retrieve Tickets'}
        </button>
      </form>

      {/* No Results */}
      {searched && tickets.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          No tickets found for this email.
        </div>
      )}

      {/* Tickets List */}
      <div className="tickets-list">
        {tickets.map((ticket, idx) => (
          <div
            key={ticket._id}
            className="ticket-card animate-slide-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Header */}
            <div className="ticket-card-header">
              <div>
                <h3 className="ticket-card-title">{ticket.subject}</h3>
                <div className="ticket-card-meta">
                  <Clock size={12} style={{ marginRight: '4px' }} />
                  Submitted on{' '}
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                    dateStyle: 'long',
                  })}
                </div>
              </div>

              <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
                {ticket.status === 'Resolved' ? (
                  <CheckCircle2 size={12} style={{ marginRight: '6px' }} />
                ) : (
                  <Clock size={12} style={{ marginRight: '6px' }} />
                )}
                {ticket.status}
              </span>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                }}
              >
                <MessageSquare size={14} />
                YOUR MESSAGE
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: '#334155',
                  border: '1px solid #f1f5f9',
                }}
              >
                {ticket.message}
              </div>
            </div>

            {/* Response */}
            <div className="ticket-response-box">
              <span className="response-label">
                Official Registry Response
              </span>

              {ticket.response ? (
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: '#1e293b',
                    lineHeight: '1.6',
                  }}
                >
                  {ticket.response}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    fontStyle: 'italic',
                  }}
                >
                  Our support team is currently reviewing your ticket. You will
                  see a response here as soon as it's processed.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTickets;