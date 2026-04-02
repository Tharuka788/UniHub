import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  FileText,
  Users,
  ArrowRight,
  Eye,
  AlertCircle,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminPayments.css';

const AdminPayments = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [remarksInput, setRemarksInput] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchPayments = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5050/api/payments?page=${pageNum}&limit=6`, {
        headers: { Authorization: 'Bearer mock-jwt-admin-token' }
      });
      setPayments(res.data.payments);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
      setTotalRecords(res.data.total || res.data.payments.length);
    } catch (err) {
      setError('Unable to fetch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const stats = useMemo(() => {
    const pending = payments.filter(p => p.status === 'pending').length;
    const approved = payments.filter(p => p.status === 'approved').length;
    return {
      total: totalRecords,
      pending: pending,
      approved: approved,
      revenue: payments.reduce((acc, curr) => curr.status === 'approved' ? acc + curr.amount : acc, 0)
    };
  }, [payments, totalRecords]);

  const handleStatusUpdate = async (id, status) => {
    const remarks = remarksInput[id] || '';
    setActionLoading(id);
    try {
      await axios.put(
        `http://localhost:5050/api/payments/${id}`,
        { status, remarks },
        { headers: { Authorization: 'Bearer mock-jwt-admin-token' } }
      );
      fetchPayments(page);
      setRemarksInput({ ...remarksInput, [id]: '' });
    } catch (err) {
      alert('Error updating status.');
    } finally {
      setActionLoading(null);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const tableColumn = ["Student ID", "Date", "Amount (Rs.)", "Payment For", "Status", "Remarks"];
    const tableRows = [];

    payments.forEach(payment => {
      const paymentData = [
        payment.userId,
        new Date(payment.createdAt).toLocaleDateString(),
        payment.amount.toFixed(2),
        payment.paymentFor,
        payment.status.toUpperCase(),
        payment.remarks || "No remarks"
      ];
      tableRows.push(paymentData);
    });

    // Add UniHub Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("UniHub", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text("Financial Review Board - Payment Report", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    // Add Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        valign: 'middle',
        overflow: 'linebreak',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [15, 23, 42], // Slate-900
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Slate-50
      },
      margin: { top: 45 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`UniHub_Payments_Report_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="admin-dashboard-container animate-fade-in">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <header className="admin-header animate-slide-up stagger-1">
              <div className="header-title">
                <h1>Financial Review Board</h1>
                <p>Monitor and validate student payment submissions</p>
              </div>
              <div className="header-actions">
                <button
                  onClick={generatePDFReport}
                  disabled={payments.length === 0}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={18} />
                  Export PDF
                </button>
                <button
                  onClick={() => navigate('/admin-kuppi')}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                >
                  <BookOpen size={18} />
                  Manage Kuppi
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <section className="stats-grid-admin animate-slide-up stagger-2">
              <div className="admin-stat-card">
                <div className="stat-icon-box total">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h4>Total Records</h4>
                  <span className="stat-value">{stats.total}</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box pending">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>Pending Review</h4>
                  <span className="stat-value">{stats.pending}</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box approved">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <h4>Approved Total</h4>
                  <span className="stat-value">{stats.approved}</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-box total" style={{ background: '#f8fafc', color: '#1a3646' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h4>Page Revenue</h4>
                  <span className="stat-value">Rs. {stats.revenue.toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Table Panel */}
            <div className="payments-table-panel animate-slide-up stagger-3">
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 flex items-center gap-3 border-b border-rose-100 font-bold text-sm">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="table-header-modern">
                    <tr>
                      <th>Student & Date</th>
                      <th>Payment Details</th>
                      <th className="text-center">Verification Slip</th>
                      <th className="text-center">Status</th>
                      <th className="text-right">Review Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <div className="inline-flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading records...</span>
                          </div>
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <FileText size={48} strokeWidth={1} />
                            <p className="font-bold text-sm">No payment records found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment._id} className="payment-row group">
                          <td className="td-content">
                            <div className="student-info">
                              <div className="student-avatar">
                                {payment.userId.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="student-name">{payment.userId}</span>
                                <span className="student-date">{new Date(payment.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              </div>
                            </div>
                          </td>

                          <td className="td-content">
                            <div className="amount-value">Rs. {payment.amount.toFixed(2)}</div>
                            <span className="payment-for-tag">{payment.paymentFor}</span>
                          </td>

                          <td className="td-content text-center">
                            <img
                              src={`http://localhost:5050/${payment.slipImage}`}
                              alt="Slip"
                              className="slip-thumbnail mx-auto"
                              onClick={() => setSelectedImage(`http://localhost:5050/${payment.slipImage}`)}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                            />
                          </td>

                          <td className="td-content text-center">
                            <span className={`status-chip ${payment.status}`}>
                              {payment.status === 'approved' && <CheckCircle size={12} />}
                              {payment.status === 'rejected' && <XCircle size={12} />}
                              {payment.status === 'pending' && <Clock size={12} className="animate-spin-slow" />}
                              {payment.status}
                            </span>
                          </td>

                          <td className="td-content text-right">
                            {payment.status === 'pending' ? (
                              <div className="action-pane opacity-0 group-hover:opacity-100 transition-opacity">
                                <input
                                  type="text"
                                  className="remarks-input"
                                  placeholder="Add reviewer notes..."
                                  value={remarksInput[payment._id] || ''}
                                  onChange={(e) => setRemarksInput({ ...remarksInput, [payment._id]: e.target.value })}
                                />
                                <div className="action-buttons">
                                  <button
                                    onClick={() => handleStatusUpdate(payment._id, 'approved')}
                                    disabled={actionLoading === payment._id}
                                    className="btn-action btn-approve"
                                  >
                                    {actionLoading === payment._id ? '...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(payment._id, 'rejected')}
                                    disabled={actionLoading === payment._id}
                                    className="btn-action btn-reject"
                                  >
                                    {actionLoading === payment._id ? '...' : 'Reject'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="remarks-display">
                                <span className="note-label">Reviewer Note:</span>
                                <span className="note-text">{payment.remarks || 'No remarks provided.'}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-50 p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Page <span className="text-slate-900">{page}</span> of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${page === i + 1
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Modal */}
          {selectedImage && (
            <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
              <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
                  <XCircle size={32} />
                </button>
                <img src={selectedImage} alt="Payment Verification Slip" />
                <div className="p-4 bg-slate-50 mt-2 rounded flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verification Slip View</span>
                  <button
                    className="text-xs font-bold text-indigo-600 hover:underline"
                    onClick={() => window.open(selectedImage, '_blank')}
                  >
                    Open in new tab
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPayments;
