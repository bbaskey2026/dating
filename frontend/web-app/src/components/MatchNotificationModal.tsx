import React from 'react';
import type { Candidate } from '../api';
import { Sparkles, MessageSquare, Heart, X, Flame } from 'lucide-react';

interface MatchNotificationModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (candidate: Candidate) => void;
}

export const MatchNotificationModal: React.FC<MatchNotificationModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onStartChat
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div className="match-modal-backdrop" onClick={onClose}>
      <div className="match-celebration-card" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE */}
        <button className="match-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* TOP GLOW ICON */}
        <div className="match-glow-icon">
          <Sparkles size={36} className="match-sparkle-spin" />
        </div>

        <div className="match-headline">
          <h2 className="match-title">It's a Mutual Match!</h2>
          <p className="match-subtitle">
            You and <span className="match-partner-name">{candidate.name}</span> liked each other on Topolgira!
          </p>
        </div>

        {/* MATCH AVATAR CIRCLES */}
        <div className="match-avatars-row">
          <div className="match-avatar-ring me">
            <div className="avatar-initials">YOU</div>
          </div>
          <div className="match-heart-pulse">
            <Heart size={28} fill="#ec4899" color="#ec4899" />
          </div>
          <div className="match-avatar-ring partner">
            <img 
              src={candidate.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
              alt={candidate.name} 
              className="match-avatar-img"
            />
          </div>
        </div>

        <div className="match-compat-badge">
          <Flame size={16} /> Compatibility Score: <strong>{candidate.matchScore}%</strong>
        </div>

        {/* ACTION BUTTONS */}
        <div className="match-actions-row">
          <button 
            className="btn-match-chat"
            onClick={() => {
              onStartChat(candidate);
              onClose();
            }}
          >
            <MessageSquare size={18} /> Send First Message
          </button>
          <button className="btn-match-continue" onClick={onClose}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};
