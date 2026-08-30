import React, { useState } from 'react';
import type { Candidate } from '../services/api';
import { EnterpriseApiClient } from '../services/api';
import { X, Heart, MessageSquare, MapPin, Briefcase, Sparkles } from 'lucide-react';

interface SwipePageProps {
  candidates: Candidate[];
  onStartChat: (cand: Candidate) => void;
}

export const SwipePage: React.FC<SwipePageProps> = ({ candidates, onStartChat }) => {
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | null>(null);
  const [matchBanner, setMatchBanner] = useState<string | null>(null);

  const activeCandidate = candidates[currentSwipeIndex] || candidates[0];

  const handleSwipe = async (direction: 'left' | 'right') => {
    setSwipeAnimation(direction);
    if (direction === 'right' && activeCandidate) {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await EnterpriseApiClient.sendLike(activeCandidate.id, token);
        if (res?.message === 'ITS_A_MATCH' || res?.data?.isMatch) {
          setMatchBanner(`🎉 It's a Mutual Match with ${activeCandidate.name}!`);
          setTimeout(() => setMatchBanner(null), 4000);
        }
      } catch (e) {
        // Fallback for offline mode
      }
    }

    setTimeout(() => {
      setSwipeAnimation(null);
      setCurrentSwipeIndex(prev => (prev + 1) % (candidates.length || 1));
    }, 300);
  };

  if (!activeCandidate) {
    return <div style={{ color: '#94a3b8', padding: '24px' }}>Loading candidate deck...</div>;
  }

  return (
    <div className="swipe-deck-container">
      {matchBanner && (
        <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)', color: '#ffffff', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', textAlign: 'center', boxShadow: '0 8px 24px rgba(236,72,153,0.35)', margin: '0 36px 12px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Sparkles size={18} /> {matchBanner}
        </div>
      )}

      <div style={{ width: '100%', padding: '24px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>Explore Registered Profiles</h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>Swipe left to Pass, right to Like, or click Chat to connect instantly.</p>
        </div>
        <div style={{ background: '#dcfce7', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#16a34a', fontWeight: '800', border: '1px solid #bbf7d0' }}>
          {candidates.length} Profiles Available
        </div>
      </div>

      <div className={`swipe-card-split ${swipeAnimation === 'right' ? 'swipe-right' : swipeAnimation === 'left' ? 'swipe-left' : ''}`}>
        {/* LEFT SIDE DETAILS COLUMN */}
        <div className="swipe-left-details">
          {/* TOP BADGES ROW */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 14px rgba(236,72,153,0.35)' }}>
              {activeCandidate.matchScore}% Match
            </div>

            {activeCandidate.isRecentlyRegistered && (
              <div style={{ background: '#10b981', color: 'white', padding: '5px 12px', borderRadius: '16px', fontWeight: '800', fontSize: '11px', boxShadow: '0 4px 10px rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Recently Registered
              </div>
            )}
          </div>

          {/* CANDIDATE MAIN INFO */}
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {activeCandidate.name}, {activeCandidate.age}
            </h2>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '14px', fontWeight: '600' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={15} color="#ec4899" /> {activeCandidate.city}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={15} color="#f59e0b" /> {activeCandidate.profession}
              </span>
            </div>
          </div>

          {/* BIO & QUOTE */}
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '18px', border: '1px solid #e2e8f0', margin: '14px 0' }}>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', fontStyle: 'italic' }}>
              "{activeCandidate.bio}"
            </p>
          </div>

          {/* INTEREST CHIPS */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Interests & Passion
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {activeCandidate.interests.map(int => (
                <span key={int} style={{ fontSize: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '5px 14px', borderRadius: '16px', color: '#475569', fontWeight: '700' }}>
                  #{int}
                </span>
              ))}
            </div>
          </div>

          {/* LEFT SIDE ACTION BUTTONS */}
          <div className="swipe-actions" style={{ background: 'transparent', borderTop: 'none', padding: '12px 0 0 0', justifyContent: 'flex-start', gap: '16px' }}>
            <div className="action-circle pass" title="Pass" onClick={() => handleSwipe('left')}>
              <X size={22} />
            </div>
            <div className="action-circle chat" title="Instant Chat" onClick={() => onStartChat(activeCandidate)}>
              <MessageSquare size={22} />
            </div>
            <div className="action-circle like" title="Like" onClick={() => handleSwipe('right')}>
              <Heart size={22} fill="#ffffff" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE CANDIDATE PHOTO */}
        <div className="swipe-right-photo">
          <img src={activeCandidate.photos[0]} alt={activeCandidate.name} className="swipe-photo-split" />
        </div>
      </div>
    </div>
  );
};
