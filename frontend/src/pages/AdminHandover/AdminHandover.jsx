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
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    if (!useManual) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(result) {
        scanner.clear();
        setScanResult(result);
        handleCheckToken(result);
      }

      function onScanError(err) {}

      return () => {
        try { scanner.clear(); } catch(e) {}
      };
    }
  }, [useManual]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken.trim()) {
      setScanResult(manualToken);
      handleCheckToken(manualToken);
    }
  };

  const handleCheckToken = async (result) => {
    let token = result;
    if (result.includes('/verify-claim/')) {
      token = result.split('/verify-claim/')[1];
    }

    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const tokenAuth = user?.token;
      
      const { data } = await axios.get(`http://localhost:5050/api/claims/token/${token}`, {
        headers: { Authorization: `Bearer ${tokenAuth}` }
      });
      
      setVerificationData({ ...data, token });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!verificationData?.token) return;
    
    setVerifying(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const tokenAuth = user?.token;
      
      await axios.patch(`http://localhost:5050/api/claims/verify/${verificationData.token}`, {}, {
        headers: { Authorization: `Bearer ${tokenAuth}` }
      });
      
      setHandoverComplete(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete handover.');
    } finally {
      setVerifying(false);
    }
  };

  const resetScanner = () => {
    window.location.reload();
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
                <div className="handover-mode-toggle">
                  <button 
                    className={!useManual ? 'active' : ''} 
                    onClick={() => setUseManual(false)}
                  >
                    Use Camera
                  </button>
                  <button 
                    className={useManual ? 'active' : ''} 
                    onClick={() => setUseManual(true)}
                  >
                    Manual Entry
                  </button>
                </div>

                {!useManual ? (
                  <>
                    <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}></div>
                    <div className="scanner-hint">
                      <p>Position the QR code within the frame to scan</p>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleManualSubmit} className="manual-entry-form">
                    <input 
                      type="text" 
                      placeholder="Enter 16-character token..." 
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="token-input"
                    />
                    <button type="submit" className="btn-verify-manual">
                      Verify Token
                    </button>
                    <p className="manual-hint">The token is displayed under the QR code on the student's dashboard.</p>
                  </form>
                )}
              </div>
            )}

            {(loading || verifying) && (
              <div className="verification-loading">
                <RefreshCw className="spinner" size={48} />
                <p>{loading ? 'Checking token...' : 'Processing handover...'}</p>
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

            {verificationData && !handoverComplete && !verifying && (
              <div className="verification-result info">
                <CheckCircle size={64} color="#3b82f6" />
                <h2>Token Validated</h2>
                <p>Verify the following details with the student before handing over the item.</p>
                
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
                      <span>Expires At</span>
                      <strong style={{ color: '#ef4444' }}>
                        {new Date(verificationData.expiresAt).toLocaleTimeString()}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="handover-actions">
                  <button onClick={handleConfirmHandover} className="btn-confirm">
                    Confirm Handover (Handed Over)
                  </button>
                  <button onClick={resetScanner} className="btn-cancel">
                    Cancel / Not Yet
                  </button>
                </div>
              </div>
            )}

            {handoverComplete && (
              <div className="verification-result success">
                <CheckCircle size={64} />
                <h2>Handover Complete!</h2>
                <p>The item has been marked as Handed Over. It will no longer appear in the public list.</p>
                <button onClick={resetScanner} className="btn-done">Scan Next</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHandover;
