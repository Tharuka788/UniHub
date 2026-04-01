import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import './payment.css';

const PaymentForm = () => {
  const [formData, setFormData] = useState({ amount: '', paymentFor: '', userId: 'user123' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const processFile = (selected) => {
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.paymentFor || !file) {
      alert('Please fill all fields and attach the slip.');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('userId', formData.userId);
    data.append('amount', formData.amount);
    data.append('paymentFor', formData.paymentFor);
    data.append('slipImage', file);

    try {
      await axios.post('http://localhost:5050/api/payments/upload', data, {
        headers: { Authorization: 'Bearer mock-jwt-token' }
      });
      alert('Bank slip uploaded successfully!');
      setFormData({ amount: '', paymentFor: '', userId: 'user123' });
      setFile(null);
      setPreview(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h1>Submit Payment Slip</h1>
          <p>Please enter the payment details and upload your receipt below.</p>
        </div>

        <form className="payment-form" onSubmit={handleSubmit}>
          {/* Amount Paid Field */}
          <div className="input-group">
            <label>Amount Paid</label>
            <div className="input-wrapper">
              <span className="currency">LKR</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Purpose of Payment Field (Now Input) */}
          <div className="input-group">
            <label>Purpose of Payment</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="paymentFor"
                value={formData.paymentFor}
                onChange={handleChange}
                placeholder="e.g. Library Fine"
                required
              />
            </div>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            <div className="dropzone">
              <div className="upload-icon-circle">
                <UploadCloud size={24} color="#94a3b8" />
              </div>
              <p className="upload-text">Drag & Drop or <span className="blue-text">Click to Upload</span></p>
              <p className="upload-hint">JPG, PNG (max 5MB)</p>
              <button type="button" className="browse-btn">Browse Files</button>
              <input
                type="file"
                className="file-input"
                onChange={(e) => processFile(e.target.files[0])}
                accept="image/*"
              />
              {preview && <p className="file-selected-text">File selected! ✅</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Submit Slip"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => {
              setFormData({ amount: '', paymentFor: '', userId: 'user123' });
              setFile(null);
              setPreview(null);
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;