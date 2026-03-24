import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentFor: '',
    userId: 'user123'
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.paymentFor || !file) {
      setMessage({ type: 'error', text: 'Please fill all fields and upload a slip.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('userId', formData.userId);
    data.append('amount', formData.amount);
    data.append('paymentFor', formData.paymentFor);
    data.append('slipImage', file);

    try {
      await axios.post('http://localhost:5050/api/payments/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer mock-jwt-token'
        }
      });
      setMessage({ type: 'success', text: 'Payment slip uploaded successfully! It is now pending review.' });
      setFormData({ ...formData, amount: '', paymentFor: '' });
      setFile(null);
      setPreview(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error uploading payment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in">
      <div className="max-w-md w-full glass rounded-3xl p-6 sm:p-8 transform opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Submit Payment</h2>
          <p className="mt-2 text-xs text-slate-500 font-medium tracking-wide">Securely upload your bank transfer slip</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center shadow-sm opacity-0 animate-scale-in ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <span className="flex-shrink-0 mr-2">
                {message.type === 'error' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                )}
              </span>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div className="group relative">
              <label htmlFor="amount" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1 transition-colors group-focus-within:text-indigo-600">Amount Sent</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium text-sm">$</span>
                </div>
                <input id="amount" name="amount" type="number" required min="1" step="0.01" value={formData.amount} onChange={handleChange} 
                  className="glass-input block w-full pl-7 pr-3 py-2.5 rounded-xl text-slate-900 font-semibold text-sm placeholder-slate-300" 
                  placeholder="0.00" />
              </div>
            </div>

            <div className="group relative">
              <label htmlFor="paymentFor" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1 transition-colors group-focus-within:text-indigo-600">Purpose</label>
              <input id="paymentFor" name="paymentFor" type="text" required value={formData.paymentFor} onChange={handleChange} 
                className="glass-input block w-full px-3 py-2.5 rounded-xl text-slate-900 font-medium text-sm placeholder-slate-300" 
                placeholder="e.g., Spring Semester Tuition" />
            </div>

            <div className="pt-1">
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Payment Slip Image</label>
               <div className="relative group rounded-2xl overflow-hidden border border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-white hover:border-indigo-400 transition-all duration-300 cursor-pointer p-0.5">
                 <input id="file-upload" name="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" />
                 
                 {preview ? (
                   <div className="relative rounded-xl overflow-hidden bg-white shadow-sm h-32 flex items-center justify-center">
                     <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain p-1" />
                     <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                        <svg className="w-5 h-5 text-white mb-1 shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-white text-[10px] font-bold tracking-wide">Replace</span>
                     </div>
                   </div>
                 ) : (
                   <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                     <div className="w-10 h-10 mb-2 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-400">
                       <svg className="h-5 w-5 text-indigo-500 group-hover:text-white transition-colors" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                     </div>
                     <p className="text-[11px] font-semibold text-indigo-600 mb-0.5">Click or drag</p>
                     <p className="text-[10px] text-slate-500 font-medium">PNG, JPG up to 2MB</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} 
              className={`relative w-full overflow-hidden rounded-xl bg-slate-900 text-white font-bold py-3 px-4 shadow-md transition-all duration-300 
                ${loading ? 'opacity-80 cursor-wait' : 'hover:shadow-indigo-500/30 hover:-translate-y-0.5'}`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}></div>
              <span className="relative z-10 flex items-center justify-center text-sm tracking-wide">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Submit Payment'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
