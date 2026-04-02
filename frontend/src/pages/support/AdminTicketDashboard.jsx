import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Download, 
  X, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
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
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="support-container animate-slide-up">
          <div className="tickets-header">
            <div className="header-text">
              <h1 className="support-title">Ticket Management</h1>
              <p className="support-subtitle">Monitor and resolve student queries efficiently</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                <FileText size={18} />
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Download size={18} />
                {downloadingPDF ? 'Download' : 'Export PDF'}
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

      <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="email"
            placeholder="Search by student email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ padding: '0.85rem 1rem 0.85rem 2.8rem', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
          />
        </div>
        <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all">
          Find Ticket
        </button>
        {searchEmail && (
          <button type="button" onClick={handleClearSearch} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all">
            Reset
          </button>
        )}
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading Tickets...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Subject & Query</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map(ticket => (
                <tr key={ticket._id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{ticket.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ticket.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#334155' }}>{ticket.subject}</div>
                  </td>
                  <td>
                    <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
                      {ticket.status === 'Resolved' && <CheckCircle2 size={12} style={{ marginRight: '6px' }} />}
                      {ticket.status === 'Pending' && <Clock size={12} style={{ marginRight: '6px' }} />}
                      {ticket.status}
                    </span>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openModal(ticket)}
                        className="btn-icon-action edit"
                        title="View Details"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket._id)}
                        className="btn-icon-action delete"
                        title="Delete Ticket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={closeModal}>
          <div className="modal-content" style={{ background: '#fff', padding: '32px', width: '550px', maxWidth: '95%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Review Ticket</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Student Name</label>
                <div style={{ fontWeight: '600' }}>{selectedTicket.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Email Address</label>
                <div style={{ fontWeight: '600' }}>{selectedTicket.email}</div>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Subject</label>
              <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedTicket.subject}</div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Student Message</label>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', color: '#334155', fontSize: '0.95rem', marginTop: '4px', border: '1px solid #e2e8f0' }}>
                {selectedTicket.message}
              </div>
            </div>

            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem' }}>Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="action-select"
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem' }}>Admin Official Response</label>
                <textarea
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder="Provide a detailed response to the student..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', minHeight: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={closeModal} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  Discard
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all">
                  Commit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default AdminTicketDashboard;
