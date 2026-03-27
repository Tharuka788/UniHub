import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
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
    } catch (err) {
      setError('Unable to fetch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Mark payment as ${status.toUpperCase()}?`)) return;

    setActionLoading(id);
    try {
      const remarks = remarksInput[id] || '';
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 rounded-full bg-blue-500/20 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center glass p-5 rounded-2xl animate-slide-up">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-800 tracking-tight">
              Financial Review Board
            </h1>
            <p className="text-slate-500 mt-1 text-xs font-medium tracking-wide">
              Evaluate student manual payments.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={() => navigate('/admin-kuppi')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <BookOpen size={16} />
              Manage Kuppi Requests
            </button>

            <div className="flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </header>

        <div className="glass rounded-[1.5rem] overflow-hidden border border-white/60 shadow-xl animate-slide-up delay-100">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 border-b border-rose-100 text-sm font-semibold flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 backdrop-blur-sm">
                  <th className="py-4 px-5 font-bold tracking-widest text-[10px] text-slate-400 uppercase">Student</th>
                  <th className="py-4 px-5 font-bold tracking-widest text-[10px] text-slate-400 uppercase">Amount</th>
                  <th className="py-4 px-5 font-bold tracking-widest text-[10px] text-slate-400 uppercase text-center">Slip</th>
                  <th className="py-4 px-5 font-bold tracking-widest text-[10px] text-slate-400 uppercase text-center">Status</th>
                  <th className="py-4 px-5 font-bold tracking-widest text-[10px] text-slate-400 uppercase text-right">Review Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white/40">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="inline-flex flex-col items-center">
                        <svg className="animate-spin h-6 w-6 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500 font-medium text-sm">
                      <div className="flex flex-col items-center">
                        <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v1m-6 5h6m-6 4h6m-6 4h6" />
                        </svg>
                        No pending transactions.
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-indigo-50/40 transition-colors duration-200 group">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-3 border border-indigo-200 shadow-sm">
                            {payment.userId.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{payment.userId}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="text-sm font-extrabold text-slate-900 tracking-tight">
                          ${payment.amount.toFixed(2)}
                        </div>
                        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 bg-white inline-block px-1 rounded border border-slate-100">
                          {payment.paymentFor}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-center">
                        <div
                          className="inline-block relative group/img cursor-pointer"
                          onClick={() => setSelectedImage(`http://localhost:5050/${payment.slipImage}`)}
                        >
                          <div className="w-16 h-10 rounded-md overflow-hidden border border-slate-200 bg-slate-100 group-hover/img:border-indigo-400 transition-colors shadow-sm relative">
                            <img
                              src={`http://localhost:5050/${payment.slipImage}`}
                              alt="Slip"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=Err';
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm
                          ${
                            payment.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : payment.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 relative'
                          }`}
                        >
                          {payment.status === 'pending' && <span className="w-1 h-1 rounded-full bg-amber-500 mr-1 animate-ping absolute left-2"></span>}
                          {payment.status === 'pending' && <span className="w-1 h-1 rounded-full bg-amber-500 mr-1 relative"></span>}
                          {payment.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right w-64">
                        {payment.status === 'pending' ? (
                          <div className="flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <input
                              type="text"
                              className="text-[10px] border border-slate-200 bg-white/80 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full"
                              placeholder="Add reason..."
                              value={remarksInput[payment._id] || ''}
                              onChange={(e) => setRemarksInput({ ...remarksInput, [payment._id]: e.target.value })}
                            />
                            <div className="flex space-x-1.5 w-full">
                              <button
                                onClick={() => handleStatusUpdate(payment._id, 'approved')}
                                disabled={actionLoading === payment._id}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-1 rounded text-[10px] font-bold shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                              >
                                ✓ Apprv
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(payment._id, 'rejected')}
                                disabled={actionLoading === payment._id}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-1 rounded text-[10px] font-bold shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                              >
                                ✕ Rej
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-600 text-left bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="font-bold text-[8px] uppercase tracking-widest text-slate-400 block">Note:</span>
                            <span className="font-medium">{payment.remarks || <span className="italic opacity-50">None</span>}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-slate-50/80 px-5 py-3 flex items-center justify-between border-t border-slate-200 backdrop-blur-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Pg <span className="text-indigo-600">{page}</span> / <span className="text-slate-900">{totalPages}</span>
              </p>
              <nav className="inline-flex rounded-md shadow-sm">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1.5 text-xs font-bold transition-all first:rounded-l-md last:rounded-r-md border-y border-r first:border-l ${
                      page === i + 1
                        ? 'z-10 bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh] w-full animate-scale-in">
              <button
                className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-colors border border-white/20 shadow-md"
                onClick={() => setSelectedImage(null)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white p-1.5 rounded-xl shadow-2xl">
                <img
                  src={selectedImage}
                  alt="Zoomed Slip"
                  className="w-full h-full max-h-[75vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;