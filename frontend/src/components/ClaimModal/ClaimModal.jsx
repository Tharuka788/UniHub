import React, { useState } from 'react';
import { X, Upload, Send, AlertCircle, CheckCircle } from 'lucide-react';
import './ClaimModal.css';

const ClaimModal = ({ isOpen, onClose, onSubmit, itemName }) => {
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ proofText });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setProofText('');
      }, 2000);
    } catch (error) {
      console.error('Claim submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="claim-modal-overlay">
      <div className="claim-modal-content animate-scale-in">
        <button className="claim-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {submitted ? (
          <div className="claim-success-view">
            <CheckCircle size={64} className="success-icon" />
            <h2>Claim Submitted!</h2>
            <p>The owner has been notified. They will review your proof and get back to you shortly.</p>
          </div>
        ) : (
          <>
            <div className="claim-modal-header">
              <div className="claim-header-icon">
                <Send size={24} />
              </div>
              <h2>Claim Request</h2>
              <p>Prove that <strong>{itemName}</strong> belongs to you.</p>
            </div>

            <form onSubmit={handleSubmit} className="claim-form">
              <div className="claim-form-group">
                <label>Proof of Ownership</label>
                <textarea
                  placeholder="Describe unique details only the owner would know (e.g., serial number, specific marks, internal contents...)"
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  required
                  rows={5}
                />
                <span className="claim-form-hint">
                  <AlertCircle size={12} />
                  Only the person who found the item will see this information.
                </span>
              </div>

              <div className="claim-modal-footer">
                <button 
                  type="button" 
                  className="claim-cancel-btn"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="claim-submit-btn"
                  disabled={isSubmitting || !proofText.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Send Claim Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimModal;
