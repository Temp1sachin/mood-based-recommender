import { FiX, FiPhone, FiMessageSquare } from 'react-icons/fi';
import './SupportModal.css';

export default function SupportModal({ onClose }) {
  return (
    <div className="support-overlay">
      <div className="support-modal">
        <button onClick={onClose} className="support-close-button">
          <FiX />
        </button>
        <h2 className="support-title">It's Okay to Not Be Okay</h2>
        <p className="support-message">
          Taking a moment for your mental well-being is a sign of strength. Please remember that you're not alone and help is available.
        </p>
        <div className="support-actions">
          <div className="support-action-item">
            <FiPhone className="support-icon" />
            <div>
              <strong>Talk to Someone Now</strong>
              <p>Call KIRAN, the National Mental Health Helpline (India):</p>
              <a href="tel:1800-599-0019" className="support-link">1800-599-0019</a>
            </div>
          </div>
          <div className="support-action-item">
            <FiMessageSquare className="support-icon" />
            <div>
              <strong>Reach Out to a Friend</strong>
              <p>Connecting with someone you trust can make a world of difference. Consider sending a message or making a call.</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="support-ok-button">
          Okay, I understand
        </button>
      </div>
    </div>
  );
}