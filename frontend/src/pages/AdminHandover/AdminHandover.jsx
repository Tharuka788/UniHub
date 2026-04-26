import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { CheckCircle, AlertCircle, RefreshCw, Package, User, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminTopBar from '../../components/AdminTopBar/AdminTopBar';
import './AdminHandover.css';

const AdminHandover = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(result) {
      scanner.clear();
      setScanResult(result);
      handleVerification(result);
    }

    function onScanError(err) {
      // console.warn(err);
    }

    return () => scanner.clear();
  }, []);

  const handleVerification = async (result) => {
    // Extract token from URL if necessary
    let token = result;
    if (result.includes('/verify-claim/')) {
      token = result.split('/verify-claim/')[1];
    }

    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const tokenAuth = user?.token;
      
      const { data } = await axios.patch(`http://localhost:5050/api/claims/verify/${token}`, {}, {
        headers: { Authorization: `Bearer ${tokenAuth}` }
      });
      
      setVerificationData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    window.location.reload(); // Simplest way to re-init scanner
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <AdminTopBar />
        <div className="handover-container">
          <div className="handover-header">
            <h1>Handover Verification</h1>
            <p>Scan the student's QR code to verify ownership and complete the handover.</p>
          </div>

          <div className="handover-content">
            {!scanResult && !error && (
              <div className="scanner-section">
                <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}></div>
                <div className="scanner-hint">
                  <p>Position the QR code within the frame to scan</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="verification-loading">
                <RefreshCw className="spinner" size={48} />
                <p>Verifying authenticity...</p>
              </div>
            )}

            {error && (
              <div className="verification-result error">
                <AlertCircle size={64} />
                <h2>Verification Failed</h2>
                <p>{error}</p>
                <button onClick={resetScanner} className="btn-retry">Try Again</button>
              </div>
            )}

            {verificationData && (
              <div className="verification-result success">
                <CheckCircle size={64} />
                <h2>Verified Successfully!</h2>
                <p>The identity has been confirmed. You can now hand over the item.</p>
                
                <div className="verification-details">
                  <div className="detail-item">
                    <Package size={18} />
                    <div>
                      <span>Item Name</span>
                      <strong>{verificationData.item}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <User size={18} />
                    <div>
                      <span>Authorized Owner</span>
                      <strong>{verificationData.owner}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Calendar size={18} />
                    <div>
                      <span>Verification Date</span>
                      <strong>{new Date().toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <button onClick={resetScanner} className="btn-done">Complete & Next</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHandover;
