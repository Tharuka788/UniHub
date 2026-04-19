import React, { useState } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, MessageSquare, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Support.css';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchMyTickets = async (e) => {
    if (e) e.preventDefault();
    if (!user || !user.token) {
      alert('You must be logged in to view your requests.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5050/admin-support/my-tickets`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTickets(data.tickets || []);
      setTotalTickets(data.total || 0);
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
      {/* Header */}
      <div className="tickets-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="support-title">My Support Tickets</h2>
          {searched && (
             <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
               Total Requests: <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{totalTickets}</span>
             </p>
          )}
        </div>
        
        <button
          onClick={fetchMyTickets}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Inbox size={20} />
          {loading ? 'Retrieving...' : 'My Requests'}
        </button>
      </div>

      {/* No Results */}
      {searched && tickets.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}
        >
          You haven't submitted any support requests yet.
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