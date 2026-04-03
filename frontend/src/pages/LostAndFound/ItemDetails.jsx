import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  Unlock,
  ArrowLeft,
  MessageSquare,
  ClipboardCheck,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Info,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ClaimModal from '../../components/ClaimModal/ClaimModal';
import './ItemDetails.css';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chatWith = queryParams.get('chatWith');

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [claims, setClaims] = useState([]);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [fetchingClaims, setFetchingClaims] = useState(false);

  const currentUserId = localStorage.getItem('userId') || 'mockUserId123';
  const token = localStorage.getItem('token') || 'mock-jwt-token';

  const fetchItemDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5050/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItem(response.data);
    } catch (err) {
      setError('Failed to load item details.');
      console.error(err);
    }
    setLoading(false);
  }, [id, token]);

  const fetchClaims = useCallback(async () => {
    setFetchingClaims(true);
    try {
      const response = await axios.get(`http://localhost:5050/api/claims/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(response.data);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setFetchingClaims(false);
    }
  }, [id, token]);

  const handleToggleShare = async () => {
    setSharing(true);
    try {
      await axios.patch(`http://localhost:5050/api/items/${id}/share-contact`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItemDetails(); // Refresh data
    } catch (err) {
      alert('Failed to update sharing status.');
      console.error(err);
    }
    setSharing(false);
  };

  const handleRequestHandshake = async () => {
    try {
      await axios.post(`http://localhost:5050/api/connections/${id}/request-handshake`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Handshake request sent to owner!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request handshake.');
    }
  };

  const handleAcceptHandshake = async () => {
    if (!chatWith) return alert('No requester identified in current context.');
    try {
      await axios.post(`http://localhost:5050/api/connections/${id}/accept-handshake/${chatWith}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Handshake accepted! Identity revealed.');
      fetchItemDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept handshake.');
    }
  };

  const handleClaimSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5050/api/claims', {
        itemId: id,
        ...data
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateClaimStatus = async (claimId, status) => {
    try {
      await axios.patch(`http://localhost:5050/api/claims/${claimId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Claim ${status.toLowerCase()} successfully!`);
      fetchClaims();
      fetchItemDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim status.');
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

  useEffect(() => {
    if (item && (item.owner?._id === currentUserId || item.owner === currentUserId)) {
      fetchClaims();
    }
  }, [item, currentUserId, fetchClaims]);

  if (loading) return (
    <div className="lf-details-loading">
      <div className="lf-spinner"></div>
      <p>Loading item details...</p>
    </div>
  );

  if (error || !item) return (
    <div className="lf-details-error">
      <AlertCircle size={48} />
      <h2>Error</h2>
      <p>{error || 'Item not found.'}</p>
      <button onClick={() => navigate('/lost-and-found')} className="lf-back-btn">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
    </div>
  );

  const isOwner = item.owner && (item.owner._id === currentUserId || item.owner === currentUserId);
  const isClaimedByMe = item.claimedBy === currentUserId;
  const canSeeContact = item.isContactShared || isOwner || isClaimedByMe;

  return (
    <div className="lf-details-container">
      <button onClick={() => navigate('/lost-and-found')} className="lf-back-link">
        <ArrowLeft size={18} /> Back to Hub
      </button>

      <div className="lf-details-wrapper">
        <div className="lf-details-image">
          {item.image ? (
            <img 
              src={item.image.startsWith('http') ? item.image : `http://localhost:5050${item.image}`} 
              alt={item.title} 
            />
          ) : (
            <div className="lf-details-img-placeholder">
              <Package size={80} />
            </div>
          )}
          <span className={`lf-details-badge badge-${item.itemType.toLowerCase()}`}>
            {item.itemType}
          </span>
          {item.status !== 'Available' && (
            <span className="lf-status-banner">{item.status}</span>
          )}
        </div>

        <div className="lf-details-info">
          <div className="lf-details-header">
            <span className="lf-details-category">{item.category}</span>
            <h1>{item.title}</h1>
          </div>

          <div className="lf-details-meta">
            <div className="lf-meta-row">
              <MapPin size={20} />
              <div>
                <label>Location</label>
                <span>{item.location || 'Campus'}</span>
              </div>
            </div>
            <div className="lf-meta-row">
              <Calendar size={20} />
              <div>
                <label>Date Reported</label>
                <span>{new Date(item.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          <div className="lf-details-description">
            <label>Description</label>
            <p>{item.description}</p>
          </div>

          {/* Identity Masking / Contact Section */}
          <div className="lf-contact-section">
            <div className="lf-contact-header">
              <h3><User size={18} /> Contact Information</h3>
              {canSeeContact ? (
                <span className="lf-status-tag shared"><Unlock size={14} /> Identity Revealed</span>
              ) : (
                <span className="lf-status-tag masked"><Lock size={14} /> Identity Masked</span>
              )}
            </div>

            <div className={`lf-contact-card ${!canSeeContact ? 'blurred' : ''}`}>
              {!canSeeContact && (
                <div className="lf-contact-overlay">
                  <Lock size={32} />
                  <p>Contact information is hidden for privacy.</p>
                  <p className="subtext">
                    {item.status === 'Reclaimed' || item.status === 'HandedOver' 
                      ? "Item already claimed." 
                      : "Submit a verified claim to see the owner's identity."}
                  </p>
                </div>
              )}
              
              <div className="lf-contact-item">
                <User size={18} />
                <span>{item.owner ? item.owner.name : 'Unknown User'}</span>
              </div>
              <div className="lf-contact-item">
                <Mail size={18} />
                <span>{canSeeContact && item.owner ? item.owner.email : '••••••••@unihub.com'}</span>
              </div>
              <div className="lf-contact-item">
                <Phone size={18} />
                <span>{canSeeContact && item.owner ? item.owner.phoneNumber : '+94 ••• ••• ••••'}</span>
              </div>
            </div>
          </div>

          {/* Claims Management Section (Owner Only) */}
          {isOwner && (
            <div className="lf-claims-section animate-fade-in">
              <div className="lf-section-header">
                <h3><ClipboardCheck size={20} /> Formal Claim Requests</h3>
                <span className="lf-claim-count">{claims.length} Received</span>
              </div>
              
              <div className="lf-claims-list">
                {fetchingClaims ? (
                  <p className="lf-empty-text">Loading claims...</p>
                ) : claims.length > 0 ? (
                  claims.map(claim => (
                    <div key={claim._id} className={`lf-claim-card status-${claim.status.toLowerCase()}`}>
                      <div className="claim-header">
                        <div className="requester-info">
                          <span className="requester-name">{claim.requester.name}</span>
                          <span className="claim-date">{new Date(claim.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`claim-status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                      </div>
                      
                      <div className="claim-proof">
                        <label>Submitted Proof:</label>
                        <p>{claim.proofText}</p>
                      </div>

                      {claim.status === 'Pending' && (
                        <div className="claim-actions">
                          <button 
                            className="claim-action-btn accept"
                            onClick={() => handleUpdateClaimStatus(claim._id, 'Accepted')}
                          >
                            <ThumbsUp size={16} /> Accept
                          </button>
                          <button 
                            className="claim-action-btn reject"
                            onClick={() => handleUpdateClaimStatus(claim._id, 'Rejected')}
                          >
                            <ThumbsDown size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="lf-empty-claims">
                    <ShieldCheck size={40} />
                    <p>No claims received yet. Verified claims will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Viewer Actions */}
          {!isOwner && (
            <div className="lf-viewer-claims-section">
              {item.status === 'Available' ? (
                <button 
                  className="lf-claim-button-large" 
                  onClick={() => setIsClaimModalOpen(true)}
                >
                  <ShieldCheck size={20} /> This is mine - Claim Item
                </button>
              ) : (
                <div className="lf-claim-status-info">
                  <Info size={18} />
                  <span>This item has been reclaimed or is already in the process.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ClaimModal 
        isOpen={isClaimModalOpen} 
        onClose={() => setIsClaimModalOpen(false)}
        onSubmit={handleClaimSubmit}
        itemName={item.title}
      />
    </div>
  );
};

export default ItemDetails;
