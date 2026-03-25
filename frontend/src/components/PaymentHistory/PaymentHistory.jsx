import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { History, Plus, Search, Calendar, FileText, CheckCircle2, Clock3, XCircle, Info, Layers } from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const userId = 'user123';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/payments/user/${userId}`, {
          headers: { Authorization: 'Bearer mock-jwt-token' }
        });
        setPayments(res.data);
      } catch (err) {
        setError('Unable to load your payment history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [userId]);

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={14} className="mr-1.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 shadow-sm">
            <XCircle size={14} className="mr-1.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
            <Clock3 size={14} className="mr-1.5 animate-pulse" />
            Reviewing
          </span>
        );
    }
  };

  const filteredPayments = payments.filter(p => (p.paymentFor || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 payment-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 payment-blob delay-500"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mr-4">
              <History className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment History</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Track and manage your submitted payment slips</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative group flex-grow md:flex-grow-0 payment-input-focus rounded-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search payments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <Link to="/pay" className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
              <Plus size={18} className="mr-1.5" />
              New Slip
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl mb-8 border border-rose-100 shadow-sm flex items-start payment-slide-down">
            <Info className="flex-shrink-0 text-rose-500 mr-3 mt-0.5" size={20} />
            <span className="font-semibold text-sm">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl overflow-hidden p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-2xl mb-5"></div>
                <div className="h-5 bg-slate-100 rounded-md w-1/3 mb-4"></div>
                <div className="h-8 bg-slate-100 rounded-md w-1/2 mb-5"></div>
                <div className="h-4 bg-slate-100 rounded-md w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 payment-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6 shadow-inner border border-white">
              <Layers size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Payments Found</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 max-w-sm mx-auto">We couldn't find any payment slips matching your criteria. Have you made a payment yet?</p>
            <Link to="/pay" className="inline-flex items-center px-6 py-3 border-2 border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 shadow-sm">
              <Plus size={18} className="mr-2" /> Make a Submission
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPayments.map((payment, idx) => (
              <div key={payment._id} className={`bg-white rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-100 flex flex-col payment-fade-in delay-${(idx % 5 + 1) * 100}`}>
                
                {/* Image Section */}
                <div className="h-48 relative overflow-hidden bg-slate-100 p-2">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                    <img 
                      src={`http://localhost:5050/${payment.slipImage}`} 
                      alt="Bank Slip" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Slip+Not+Found'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  </div>
                  <div className="absolute top-5 right-5 z-10">
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-widest uppercase text-indigo-600 mb-2">
                       <FileText size={12} strokeWidth={3} className="mr-1" />
                       {payment.paymentFor || 'Unknown Purpose'}
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
                      <span className="text-xl text-slate-400 font-bold mr-1 align-baseline">$</span>
                      {payment.amount || 'N/A'}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center text-xs font-semibold text-slate-500">
                      <Calendar size={14} className="mr-1.5 text-slate-400" />
                      {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {payment.remarks && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 relative">
                      <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                         <Info size={12} className="mr-1" /> Remarks
                      </span>
                      <p className="font-medium text-slate-700">{payment.remarks}</p>
                    </div>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
