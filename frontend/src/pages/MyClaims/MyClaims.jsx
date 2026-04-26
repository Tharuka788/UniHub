import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, QrCode } from 'lucide-react';
import './MyClaims.css';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    const fetchMyClaims = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const { data } = await axios.get('http://localhost:5050/api/claims/my-claims', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setClaims(data);
        console.log('Fetched My Claims:', data);
      } catch (error) {
        console.error('Error fetching my claims:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyClaims();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="status-icon success" size={18} />;
      case 'Rejected': return <XCircle className="status-icon danger" size={18} />;
      default: return <Clock className="status-icon pending" size={18} />;
    }
  };

  return (
    <div className="my-claims-container">
      <div className="page-header">
        <h1>My Claim Requests</h1>
        <p>Track the status of items you have claimed.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading your claims...</div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <p>You haven't submitted any claim requests yet.</p>
        </div>
      ) : (
        <div className="claims-grid">
          {claims.map((claim) => (
            <div key={claim._id} className={`claim-card ${claim.status.toLowerCase()}`}>
              <div className="claim-card-header">
                <div className="item-preview">
                  <div className="item-img-container">
                    {claim.item?.image ? (
                      <img src={claim.item.image.startsWith('http') ? claim.item.image : `http://localhost:5050${claim.item.image}`} alt="" />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  <div>
                    <h3>{claim.item?.title || 'Unknown Item'}</h3>
                    <span className="claim-date">Requested on {new Date(claim.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`status-badge ${claim.status.toLowerCase()}`}>
                  {getStatusIcon(claim.status)}
                  {claim.status}
                </div>
              </div>

              <div className="claim-card-body">
                <p className="proof-text"><strong>Your Proof:</strong> {claim.proofText}</p>
                
                {(claim.status === 'Accepted' && (claim.qrCode || claim.verificationToken)) && (
                  <div className="qr-section">
                    <div className="qr-hint">
                      <QrCode size={16} />
                      <span>{claim.qrCode ? 'Approved! Show this QR to the Guard' : 'Approved! Show this Token to the Guard'}</span>
                    </div>
                    <button className="btn-show-qr" onClick={() => setSelectedQR(claim)}>
                      {claim.qrCode ? 'View Verification QR' : 'View Verification Token'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <div className="qr-modal-overlay" onClick={() => setSelectedQR(null)}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedQR(null)}>×</button>
            <h3>Verification {selectedQR.qrCode ? 'QR Code' : 'Token'}</h3>
            <p>Show this to the administrator to verify your identity and collect your item.</p>
            
            {selectedQR.qrCode ? (
              <div className="qr-display">
                <img src={selectedQR.qrCode} alt="Verification QR" />
                <div className="token-display">
                  <span>Token:</span>
                  <code>{selectedQR.verificationToken}</code>
                </div>
              </div>
            ) : (
              <div className="token-only-display">
                <div className="token-badge">{selectedQR.verificationToken}</div>
                <p>QR generation failed, but you can use this token for manual verification.</p>
              </div>
            )}
            
            <button className="btn-close" onClick={() => setSelectedQR(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClaims;
