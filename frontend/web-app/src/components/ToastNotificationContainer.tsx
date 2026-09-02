import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, type ToastNotification } from '../context/NotificationContext';
import type { Candidate } from '../api';
import { MessageSquare, Sparkles, Heart, X, ArrowRight } from 'lucide-react';

interface ToastContainerProps {
  onStartChat?: (candidate: Candidate) => void;
  onInspectProfile?: (candidate: Candidate) => void;
}

export const ToastNotificationContainer: React.FC<ToastContainerProps> = ({
  onStartChat,
  onInspectProfile,
}) => {
  const { notifications, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (notifications.length === 0) return null;

  const handleAction = (toast: ToastNotification) => {
    dismissToast(toast.id);
    if (toast.candidate) {
      if (toast.type === 'message' || toast.type === 'match') {
        if (onStartChat) {
          onStartChat(toast.candidate);
        } else {
          navigate('/chat');
        }
      } else if (toast.type === 'like') {
        if (onInspectProfile) {
          onInspectProfile(toast.candidate);
        } else {
          navigate('/swipe');
        }
      }
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="toast-notifications-container" aria-live="polite">
      {notifications.map((toast) => {
        const isMatch = toast.type === 'match';
        const isLike = toast.type === 'like';

        return (
          <div 
            key={toast.id} 
            className={`live-toast-card ${toast.type}`}
            onClick={() => handleAction(toast)}
            role="alert"
          >
            {/* AVATAR / ICON */}
            <div className="toast-avatar-box">
              {toast.avatarUrl ? (
                <img 
                  src={toast.avatarUrl} 
                  alt={toast.senderName || 'Avatar'} 
                  className="toast-avatar-img" 
                />
              ) : (
                <div className="toast-icon-placeholder">
                  {isMatch ? <Sparkles size={18} /> : isLike ? <Heart size={18} /> : <MessageSquare size={18} />}
                </div>
              )}
              <span className={`toast-badge-dot ${toast.type}`}>
                {isMatch ? '🎉' : isLike ? '💖' : '💬'}
              </span>
            </div>

            {/* CONTENT */}
            <div className="toast-content-box">
              <div className="toast-header-row">
                <span className="toast-title">{toast.title}</span>
                <span className="toast-time">Just now</span>
              </div>
              <p className="toast-message-text">{toast.message}</p>
              
              <div className="toast-action-row">
                <span className="toast-action-btn">
                  {isMatch ? 'Open Chat' : isLike ? 'View Profile' : 'Reply'} <ArrowRight size={12} />
                </span>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button 
              className="toast-close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
