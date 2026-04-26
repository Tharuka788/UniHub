import React from 'react';
import { X, User, MessageSquare, Image as ImageIcon } from 'lucide-react';

const AdminClaimReviewModal = ({ claim, onClose, onAction }) => {
  if (!claim) return null;

  return (
    <div className="admin-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="admin-modal-content" style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Review Claim Request</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Item: <strong style={{ color: '#334155' }}>{claim.item?.title || 'Unknown Item'}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          
          {/* Requester Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1rem', 
            background: '#f0f7ff', 
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <User size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requester</p>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{claim.requester?.name || 'Unknown'}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{claim.requester?.email}</p>
            </div>
          </div>

          {/* Proof Text */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '10px' }}>
              <MessageSquare size={16} style={{ color: '#64748b' }} />
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proof Description</h3>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: '1.25rem', 
              borderRadius: '12px', 
              fontSize: '0.95rem', 
              color: '#334155', 
              border: '1px solid #e2e8f0', 
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {claim.proofText || "No description provided."}
            </div>
          </div>

          {/* Proof Image */}
          {(claim.proofImage || claim.item?.image) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '10px' }}>
                <ImageIcon size={16} style={{ color: '#64748b' }} />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Proof</h3>
              </div>
              <div style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                maxHeight: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={claim.proofImage ? (claim.proofImage.startsWith('http') ? claim.proofImage : `http://localhost:5050${claim.proofImage}`) : (claim.item?.image?.startsWith('http') ? claim.item.image : `http://localhost:5050${claim.item.image}`)} 
                  alt="Proof" 
                  style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ 
          padding: '1.5rem', 
          borderTop: '1px solid #f1f5f9', 
          display: 'flex', 
          gap: '1rem',
          background: '#f8fafc'
        }}>
          <button 
            onClick={() => onAction(claim._id, 'Rejected')}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              borderRadius: '12px', 
              border: '2px solid #ef4444', 
              background: 'white', 
              color: '#ef4444', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              cursor: 'pointer', 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => { e.target.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.target.style.background = 'white'; }}
          >
            Reject Claim
          </button>
          <button 
            onClick={() => onAction(claim._id, 'Accepted')}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              borderRadius: '12px', 
              border: 'none', 
              background: '#3b82f6', 
              color: 'white', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              cursor: 'pointer', 
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => { e.target.style.background = '#2563eb'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = '#3b82f6'; e.target.style.transform = 'translateY(0)'; }}
          >
            Approve Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminClaimReviewModal;
