import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from '../../components/Chat/Chat';
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
  Package,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import './ItemDetails.css';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const currentUserId = localStorage.getItem('userId') || 'mockUserId123';
  const token = localStorage.getItem('token') || 'mock-jwt-token';

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
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
  };

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
  const canSeeContact = item.isContactShared || isOwner;

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

          {/* Identity Masking Section */}
          <div className="lf-contact-section">
            <div className="lf-contact-header">
              <h3><User size={18} /> Contact Information</h3>
              {item.isContactShared ? (
                <span className="lf-status-tag shared"><Unlock size={14} /> Identity Shared</span>
              ) : (
                <span className="lf-status-tag masked"><Lock size={14} /> Identity Masked</span>
              )}
            </div>

            <div className={`lf-contact-card ${!canSeeContact ? 'blurred' : ''}`}>
              {!canSeeContact && (
                <div className="lf-contact-overlay">
                  <Lock size={32} />
                  <p>Contact information is hidden for privacy.</p>
                  <p className="subtext">The owner must share their identity first.</p>
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

            {isOwner ? (
              <div className="lf-owner-actions">
                <p className="lf-help-text">
                  {item.isContactShared 
                    ? "Your contact information is currently visible to everyone." 
                    : "Only you can see your contact info. Share it to help others reach you."}
                </p>
                <div className="lf-owner-btn-group">
                  <button 
                    className={`lf-handshake-btn ${item.isContactShared ? 'undo' : 'share'}`}
                    onClick={handleToggleShare}
                    disabled={sharing}
                  >
                    {item.isContactShared ? <Lock size={18} /> : <Unlock size={18} />}
                    {sharing ? 'Updating...' : (item.isContactShared ? 'Mask Identity' : 'Share Contact Info')}
                  </button>
                  <button className="lf-chat-toggle-btn" onClick={() => setShowChat(!showChat)}>
                    <MessageSquare size={18} /> {showChat ? 'Close Chat' : 'View Messages'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="lf-viewer-actions">
                {!item.isContactShared && (
                  <button className="lf-request-btn" onClick={() => alert('Handshake request sent to owner!')}>
                    <CheckCircle size={18} /> Request Contact Handshake
                  </button>
                )}
                <button className={`lf-chat-toggle-btn ${showChat ? 'active' : ''}`} onClick={() => setShowChat(!showChat)}>
                  <MessageSquare size={18} /> {showChat ? 'Close Chat' : 'Anonymous Chat'}
                </button>
              </div>
            )}

            {showChat && (
              <div className="lf-chat-section">
                <Chat 
                  itemId={item._id} 
                  receiverId={isOwner ? 'finder' : (item.owner?._id || 'owner')} 
                  currentUserId={currentUserId} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
