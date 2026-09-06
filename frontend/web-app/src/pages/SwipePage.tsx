import React, { useState } from 'react';
import type { Candidate } from '../api';
import { MatchesService } from '../api';
import { 
  X, 
  Heart, 
  MessageSquare, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  Maximize2, 
  GraduationCap, 
  Globe, 
  ShieldCheck 
} from 'lucide-react';

interface SwipePageProps {
  candidates: Candidate[];
  isLoading?: boolean;
  onStartChat: (cand: Candidate) => void;
  onInspectProfile: (cand: Candidate) => void;
  onMatchTriggered: (cand: Candidate) => void;
}

export const SwipePage: React.FC<SwipePageProps> = ({ 
  candidates, 
  isLoading = false,
  onStartChat, 
  onInspectProfile,
  onMatchTriggered
}) => {
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [likeToast, setLikeToast] = useState<{ name: string; isMatch: boolean } | null>(null);

  const activeCandidate = candidates[currentSwipeIndex] || candidates[0];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!activeCandidate) return;
    setSwipeAnimation(direction);

    if (direction === 'right') {
      try {
        const res = await MatchesService.sendLike(activeCandidate.id);
        if (res?.message === 'ITS_A_MATCH' || res?.data?.isMatch) {
          onMatchTriggered(activeCandidate);
          setLikeToast({ name: activeCandidate.name, isMatch: true });
        } else {
          setLikeToast({ name: activeCandidate.name, isMatch: false });
        }
        setTimeout(() => setLikeToast(null), 3500);
      } catch (e) {
        console.error('Error swiping right:', e);
      }
    }

    setTimeout(() => {
      setSwipeAnimation(null);
      setCurrentSwipeIndex(prev => (prev + 1) % (candidates.length || 1));
      setIsEntering(true);
      setTimeout(() => setIsEntering(false), 280);
    }, 260);
  };

  if (isLoading && candidates.length === 0) {
    return (
      <div className="empty-state-pane">
        <div className="spinner-glow" />
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '16px' }}>
          Finding Compatible Matches...
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Analyzing preferences and curating compatible singles
        </p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="empty-state-pane">
        <Sparkles size={48} color="#ec4899" />
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '16px' }}>
          You're All Caught Up!
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', maxWidth: '400px' }}>
          You've viewed all current recommendations. Check back soon or broaden your search preferences!
        </p>
      </div>
    );
  }

  return (
    <div className="swipe-deck-container">
      {/* LIKE / MATCH TOAST NOTIFICATION */}
      {likeToast && (
        <div className={`swipe-toast-banner ${likeToast.isMatch ? 'match' : 'like'}`}>
          <Sparkles size={18} />
          <span>
            {likeToast.isMatch 
              ? `🎉 It's a Mutual Match with ${likeToast.name}! Chat unlocked!`
              : `💖 You liked ${likeToast.name}!`
            }
          </span>
        </div>
      )}

      {/* TOP HEADER STATUS BAR */}
      <div className="swipe-top-bar">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>Discover Matches</h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '2px' }}>
            Curated recommendations for your vibe • Tap profile to view full bio & photos
          </p>
        </div>
        <div className="profiles-counter-badge">
          <ShieldCheck size={14} /> {candidates.length} Profiles Near You
        </div>
      </div>

      {/* SPLIT HORIZONTAL CARD */}
      <div className={`swipe-card-split ${swipeAnimation === 'right' ? 'swipe-right' : swipeAnimation === 'left' ? 'swipe-left' : isEntering ? 'swipe-enter' : ''}`}>
        {/* LEFT SIDE DETAILS COLUMN */}
        <div className="swipe-left-details">
          {/* TOP BADGES ROW */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="badge-match-pill">
              <Sparkles size={13} /> {activeCandidate.matchScore}% Compatibility
            </div>

            {activeCandidate.relationshipGoal && (
              <div className="badge-goal-pill">
                {activeCandidate.relationshipGoal === 'marriage' ? '💍 Marriage' : '❤️ Serious'}
              </div>
            )}

            <button 
              className="btn-inspect-pill" 
              onClick={() => onInspectProfile(activeCandidate)}
              title="Inspect Full Profile Details"
            >
              <Maximize2 size={13} /> See Everything
            </button>
          </div>

          {/* CANDIDATE MAIN INFO */}
          <div style={{ marginTop: '12px', cursor: 'pointer' }} onClick={() => onInspectProfile(activeCandidate)}>
            <h2 className="swipe-candidate-name">
              {activeCandidate.name}, <span className="swipe-candidate-age">{activeCandidate.age}</span>
            </h2>
            <div className="swipe-candidate-subinfo">
              <span className="subinfo-item">
                <MapPin size={15} color="#ec4899" /> {activeCandidate.city}
              </span>
              <span>•</span>
              <span className="subinfo-item">
                <Briefcase size={15} color="#f59e0b" /> {activeCandidate.profession}
              </span>
              {activeCandidate.education && (
                <>
                  <span>•</span>
                  <span className="subinfo-item">
                    <GraduationCap size={15} color="#8b5cf6" /> {activeCandidate.education}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* BIO & QUOTE */}
          {activeCandidate.bio && (
            <div 
              className="swipe-bio-box"
              onClick={() => onInspectProfile(activeCandidate)}
              title="Click to view full profile"
            >
              <p className="swipe-bio-text">"{activeCandidate.bio}"</p>
            </div>
          )}

          {/* INTERESTS & SPOKEN LANGUAGES */}
          <div className="swipe-chips-section">
            <div className="chips-title">
              <Globe size={13} /> Interests & Spoken Languages
            </div>
            <div className="chips-container">
              {activeCandidate.interests?.map(int => (
                <span key={int} className="chip-tag interest">#{int}</span>
              ))}
              {activeCandidate.languages?.map(lang => (
                <span key={lang} className="chip-tag lang">{lang}</span>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="swipe-actions">
            <div 
              className="action-circle pass" 
              title="Pass (Swipe Left)" 
              onClick={() => handleSwipe('left')}
            >
              <X size={24} />
            </div>
            <div 
              className="action-circle chat" 
              title="Instant Direct Chat" 
              onClick={() => onStartChat(activeCandidate)}
            >
              <MessageSquare size={22} />
            </div>
            <div 
              className="action-circle like" 
              title="Right Swipe (Send Like)" 
              onClick={() => handleSwipe('right')}
            >
              <Heart size={24} fill="#ffffff" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE CANDIDATE PHOTO */}
        <div 
          className="swipe-right-photo" 
          onClick={() => onInspectProfile(activeCandidate)} 
          title="Click to inspect all photos & full profile"
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={activeCandidate.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'} 
            alt={activeCandidate.name} 
            className="swipe-photo-split" 
          />
          <div className="photo-expand-badge">
            <Maximize2 size={14} /> Click to expand
          </div>
        </div>
      </div>
    </div>
  );
};
