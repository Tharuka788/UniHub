import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = 'user123';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/payments/user/${userId}`, {
          headers: { Authorization: 'Bearer mock-jwt-token' }
        });
        setPayments(res.data);
      } catch (err) {
        setError('Unable to load your payment history. Please try again.');
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
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-200/50 shadow-sm backdrop-blur-md">
            <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100/90 text-rose-800 border border-rose-200/50 shadow-sm backdrop-blur-md">
            <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100/90 text-amber-800 border border-amber-200/50 shadow-sm backdrop-blur-md">
            <svg className="w-2.5 h-2.5 mr-1 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Reviewing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative opacity-0 animate-fade-in">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-200/50 pb-5 glass rounded-2xl p-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">Payment History</h2>
          </div>
          <Link to="/pay" className="mt-4 md:mt-0 group relative inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-xl hover:bg-indigo-600 focus:outline-none shadow-md overflow-hidden">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span className="relative">New Slip</span>
          </Link>
        </div>
        
        {error && (
          <div className="glass bg-rose-50/80 text-rose-800 p-3 rounded-xl mb-6 border-l-4 border-rose-500 shadow-sm flex items-center animate-slide-up text-sm">
            <svg className="w-4 h-4 mr-2 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass rounded-2xl overflow-hidden p-3 animate-pulse">
                <div className="h-32 bg-slate-200/50 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200/50 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-slate-200/50 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-slate-200/50 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50/50 text-indigo-300 mb-4 shadow-inner border border-white/50">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">No Payments Found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">You haven't submitted any payment slips yet.</p>
            <Link to="/pay" className="inline-flex items-center px-6 py-2 border border-transparent text-xs font-bold rounded-lg shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-all">
              Make Your First Submission
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {payments.map((payment, idx) => (
              <div key={payment._id} className="glass rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 relative opacity-0 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="h-40 relative overflow-hidden bg-slate-100/50 p-2">
                  <div className="w-full h-full rounded-xl overflow-hidden relative shadow-inner">
                    <img 
                      src={`http://localhost:5050/${payment.slipImage}`} 
                      alt="Bank Slip" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Error'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
                
                <div className="p-5 relative bg-white/40">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold tracking-widest uppercase rounded mb-2 shadow-sm border border-indigo-100/50">
                        {payment.paymentFor}
                      </span>
                      <p className="text-2xl font-extrabold text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
                        <span className="text-base text-slate-400 font-medium mr-1 tracking-normal">$</span>
                        {payment.amount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-[11px] font-semibold text-slate-500 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                    <svg className="w-3 h-3 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {payment.remarks && (
                    <div className="mt-4 p-3 bg-amber-50/80 rounded-lg text-xs text-slate-700 border border-amber-200/60 shadow-inner relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                      <span className="font-bold text-amber-900 flex items-center mb-1 text-[10px] uppercase tracking-widest">
                         <svg className="w-3 h-3 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                         Note
                      </span>
                      <p className="italic text-amber-800/80 pl-4 leading-tight">{payment.remarks}</p>
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
