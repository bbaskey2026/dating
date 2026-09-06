import React, { useState } from 'react';
import type { Candidate } from '../api';
import { MatchesService } from '../api';
import { 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  Heart, 
  MessageSquare, 
  Maximize2, 
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface CatalogPageProps {
  candidates: Candidate[];
  isLoading?: boolean;
  onRefresh: () => void;
  onStartChat: (cand: Candidate) => void;
  onInspectProfile: (cand: Candidate) => void;
  onMatchTriggered: (cand: Candidate) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  candidates, 
  isLoading = false,
  onRefresh, 
  onStartChat,
  onInspectProfile,
  onMatchTriggered
}) => {
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeToast, setLikeToast] = useState<{ name: string; isMatch: boolean } | null>(null);

  const handleLike = async (cand: Candidate, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLikedMap(prev => ({ ...prev, [cand.id]: true }));
      const res = await MatchesService.sendLike(cand.id);
      if (res?.message === 'ITS_A_MATCH' || res?.data?.isMatch) {
        onMatchTriggered(cand);
        setLikeToast({ name: cand.name, isMatch: true });
      } else {
        setLikeToast({ name: cand.name, isMatch: false });
      }
      setTimeout(() => setLikeToast(null), 3500);
    } catch (err) {
      console.error('Error liking profile:', err);
    }
  };

  return (
    <div className="step-pane">
      {/* TOAST ALERT */}
      {likeToast && (
        <div className={`swipe-toast-banner ${likeToast.isMatch ? 'match' : 'like'}`}>
          <Sparkles size={18} />
          <span>
            {likeToast.isMatch 
              ? `🎉 Mutual Match with ${likeToast.name}! Chat unlocked!`
              : `💖 You liked ${likeToast.name}!`
            }
          </span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="catalog-header-bar">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>
            Explore Verified Singles
          </h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>
            Browse active members in your area, view photos & stories, or start a conversation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="profiles-counter-badge">
            <ShieldCheck size={14} /> {candidates.length} Active Members
          </div>
          <button 
            className="btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} 
            onClick={onRefresh}
          >
            <RefreshCw size={14} className={isLoading ? 'spinner-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {isLoading && candidates.length === 0 ? (
        <div className="empty-state-pane">
          <div className="spinner-glow" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '16px' }}>
            Finding Nearby Members...
          </h3>
        </div>
      ) : candidates.length === 0 ? (
        <div className="empty-state-pane">
          <Sparkles size={40} color="#ec4899" />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '12px' }}>
            No Members Found in this Area
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Adjust your discovery preferences or check back later to meet new singles.
          </p>
        </div>
      ) : (
        <div className="catalog-cards-grid">
          {candidates.map(cand => (
            <div 
              key={cand.id} 
              className="catalog-profile-card"
              onClick={() => onInspectProfile(cand)}
            >
              {/* PHOTO HEADER */}
              <div className="catalog-card-media">
                <img 
                  src={cand.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'} 
                  alt={cand.name} 
                  className="catalog-card-img"
                />
                <div className="catalog-media-overlay" />
                
                {/* MATCH SCORE PILL */}
                <div className="catalog-match-pill">
                  <Sparkles size={11} /> {cand.matchScore}% Match
                </div>

                {cand.isRecentlyRegistered && (
                  <div className="catalog-new-pill">
                    <Sparkles size={10} /> RECENT
                  </div>
                )}

                <button 
                  className="catalog-expand-btn" 
                  onClick={(e) => { e.stopPropagation(); onInspectProfile(cand); }}
                  title="Inspect Full Profile Details"
                >
                  <Maximize2 size={14} /> Full Details
                </button>
              </div>

              {/* CARD DETAILS BODY */}
              <div className="catalog-card-content">
                <div className="catalog-name-row">
                  <h3 className="catalog-candidate-name">
                    {cand.name}, {cand.age}
                  </h3>
                  <span className="catalog-location-tag">
                    <MapPin size={12} color="#ec4899" /> {cand.city}
                  </span>
                </div>

                <div className="catalog-subinfo-row">
                  <span className="catalog-subinfo-item">
                    <Briefcase size={13} color="#f97316" /> {cand.profession}
                  </span>
                  {cand.education && (
                    <>
                      <span>•</span>
                      <span className="catalog-subinfo-item">
                        <GraduationCap size={13} color="#8b5cf6" /> {cand.education}
                      </span>
                    </>
                  )}
                </div>

                {cand.bio && (
                  <p className="catalog-bio-snippet">"{cand.bio}"</p>
                )}

                {/* TAGS ROW */}
                <div className="catalog-tags-row">
                  {cand.interests?.slice(0, 3).map(int => (
                    <span key={int} className="catalog-tag">#{int}</span>
                  ))}
                  {cand.languages?.slice(0, 2).map(l => (
                    <span key={l} className="catalog-tag lang">{l}</span>
                  ))}
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="catalog-card-actions">
                  <button 
                    className={`btn-catalog-like ${likedMap[cand.id] ? 'liked' : ''}`}
                    onClick={(e) => handleLike(cand, e)}
                    title="Send Like / Right Swipe"
                  >
                    <Heart size={16} fill={likedMap[cand.id] ? '#ffffff' : 'transparent'} /> 
                    {likedMap[cand.id] ? 'Liked' : 'Like'}
                  </button>

                  <button 
                    className="btn-catalog-chat" 
                    onClick={(e) => { e.stopPropagation(); onStartChat(cand); }}
                    title="Start Live Chat"
                  >
                    <MessageSquare size={16} /> Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
