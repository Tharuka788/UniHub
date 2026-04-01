import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Support.css';

const AdminTicketDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');

  // Modal states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  // Report states
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const fetchTickets = async (emailQuery = '') => {
    setLoading(true);
    try {
      let url = 'http://localhost:5050/admin-support/tickets';
      if (emailQuery) {
        url += `?email=${encodeURIComponent(emailQuery)}`;
      }
      const { data } = await axios.get(url);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const { data } = await axios.get('http://localhost:5050/admin-support/reports');
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await axios.get('http://localhost:5050/admin-support/reports/pdf', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Support_Ticket_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF', error);
      alert('Failed to download PDF report');
    } finally {
      setDownloadingPDF(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTickets(searchEmail);
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    fetchTickets('');
  };

  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status);
    setResponseMsg(ticket.response || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/admin-support/update/${selectedTicket._id}`, {
        status,
        response: responseMsg
      });
      alert('Ticket updated successfully!');
      closeModal();
      fetchTickets(searchEmail);
    } catch (error) {
      console.error('Error updating ticket', error);
      alert('Failed to update ticket');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await axios.delete(`http://localhost:5050/admin-support/delete/${id}`);
        fetchTickets(searchEmail);
      } catch (error) {
        console.error('Error deleting ticket', error);
        alert('Failed to delete ticket');
      }
    }
  };

  const getStatusClass = (statusQuery) => {
    if (!statusQuery) return '';
    return `status-${statusQuery.replace(' ', '')}`;
  };

  return (
    <div className="support-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div className="tickets-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="support-title">Admin Ticket Management Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            style={{ padding: '10px 20px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            style={{ padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {downloadingPDF ? 'Downloading...' : 'Download Report (PDF)'}
          </button>
        </div>
      </div>

      {reportData && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Ticket Report Summary</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', flex: 1, minWidth: '150px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Tickets</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{reportData.totalTickets}</div>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', flex: 1, minWidth: '150px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '4px solid #ffc107' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Pending</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{reportData.breakdown?.Pending || 0}</div>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', flex: 1, minWidth: '150px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '4px solid #17a2b8' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>In Progress</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{reportData.breakdown?.['In Progress'] || 0}</div>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', flex: 1, minWidth: '150px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '4px solid #28a745' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Resolved</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{reportData.breakdown?.Resolved || 0}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="email"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{ padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
        {searchEmail && (
          <button type="button" onClick={handleClearSearch} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
        )}
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading Tickets...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Subject</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map(ticket => (
                <tr key={ticket._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{ticket.name}</td>
                  <td style={{ padding: '12px' }}>{ticket.email}</td>
                  <td style={{ padding: '12px' }}>{ticket.subject}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`ticket-status ${getStatusClass(ticket.status)}`} style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => openModal(ticket)}
                      style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View / Update
                    </button>
                    <button
                      onClick={() => handleDelete(ticket._id)}
                      style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing and updating ticket */}
      {isModalOpen && selectedTicket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <h3>Ticket Details</h3>
            <p><strong>Name:</strong> {selectedTicket.name}</p>
            <p><strong>Email:</strong> {selectedTicket.email}</p>
            <p><strong>Subject:</strong> {selectedTicket.subject}</p>
            <p><strong>Message:</strong></p>
            <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
              {selectedTicket.message}
            </div>

            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Admin Response</label>
                <textarea
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder="Type your response here..."
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketDashboard;
