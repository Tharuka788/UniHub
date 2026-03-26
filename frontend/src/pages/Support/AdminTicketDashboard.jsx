import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Support.css';

const AdminTicketDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/support-login');
        return;
      }
      
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const { data } = await axios.get('http://localhost:5000/api/support/tickets', config);
        setTickets(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets', error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/support-login');
        }
      }
    };
    
    fetchTickets();
  }, [navigate]);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.put(`http://localhost:5000/api/support/tickets/${id}/status`, { status: newStatus }, config);
      
      setTickets(tickets.map(ticket => 
        ticket._id === id ? { ...ticket, status: newStatus } : ticket
      ));
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update status.');
    }
  };

  const getStatusClass = (status) => {
    return `status-${status.replace(' ', '')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/support-login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Tickets...</div>;

  return (
    <div className="support-container" style={{ maxWidth: '1200px' }}>
      <div className="tickets-header">
        <h2 className="support-title">Admin Support Dashboard</h2>
        <button className="submit-btn" style={{ background: '#333', padding: '10px 20px' }} onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket._id}>
                <td>{ticket.name}</td>
                <td>{ticket.email}</td>
                <td>{ticket.subject}</td>
                <td>
                  <span className={`priority-badge priority-${ticket.priority}`}>{ticket.priority}</span>
                </td>
                <td>
                  <span className={`ticket-status ${getStatusClass(ticket.status)}`}>{ticket.status}</span>
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <select 
                    className="action-select"
                    value={ticket.status}
                    onChange={(e) => updateStatus(ticket._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTicketDashboard;
