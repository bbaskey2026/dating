import React, { useState } from 'react';
import type { Candidate } from '../api';
import { 
  X, 
  Heart, 
  MessageSquare, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Utensils, 
  Music, 
  Smile, 
  Compass,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProfileDetailsModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (candidate: Candidate) => void;
  onPass?: (candidate: Candidate) => void;
  onStartChat?: (candidate: Candidate) => void;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onLike,
  onPass,
  onStartChat
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!isOpen || !candidate) return null;

  const photos = candidate.photos && candidate.photos.length > 0 
    ? candidate.photos 
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const relationshipGoalLabel = (goal: string) => {
    switch (goal) {
      case 'marriage': return '💍 Looking for Marriage';
      case 'serious_relationship': return '❤️ Serious Relationship';
      case 'casual': return '☕ Casual Dating';
      default: return '✨ Meaningful Connection';
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="profile-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Profile">
          <X size={20} />
        </button>

        {/* HERO PHOTO VIEWER */}
        <div className="modal-hero-gallery">
          <img 
            src={photos[activePhotoIdx]} 
            alt={candidate.name} 
            className="modal-gallery-img" 
          />
          <div className="gallery-gradient-overlay" />

          {photos.length > 1 && (
            <>
              <button className="gallery-nav-btn prev" onClick={prevPhoto} aria-label="Previous Photo">
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-nav-btn next" onClick={nextPhoto} aria-label="Next Photo">
                <ChevronRight size={20} />
              </button>
              <div className="gallery-pagination-dots">
                {photos.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`gallery-dot ${idx === activePhotoIdx ? 'active' : ''}`}
                    onClick={() => setActivePhotoIdx(idx)}
                  />
                ))}
              </div>
            </>
          )}

          {/* OVERLAY BADGES */}
          <div className="gallery-top-badges">
            <span className="badge-verified">
              <ShieldCheck size={14} /> Verified Member
            </span>
            <span className="badge-match-score">
              <Sparkles size={14} /> {candidate.matchScore}% Match
            </span>
          </div>

          <div className="gallery-bottom-info">
            <h2 className="modal-person-name">
              {candidate.name}, <span className="modal-person-age">{candidate.age}</span>
            </h2>
            <div className="modal-location-row">
              <MapPin size={15} /> {candidate.city}, India
            </div>
          </div>
        </div>

        {/* DETAILED CONTENT BODY */}
        <div className="modal-details-body">
          {/* RELATIONSHIP GOAL PILL */}
          <div className="modal-goal-banner">
            {relationshipGoalLabel(candidate.relationshipGoal)}
          </div>

          {/* ABOUT & BIO */}
          {candidate.bio && (
            <div className="detail-section">
              <h3 className="section-title">About Me</h3>
              <p className="bio-paragraph">"{candidate.bio}"</p>
            </div>
          )}

          {/* WORK & EDUCATION */}
          <div className="detail-section">
            <h3 className="section-title">Profession & Education</h3>
            <div className="attributes-grid">
              {candidate.profession && (
                <div className="attribute-card">
                  <Briefcase size={18} className="attr-icon orange" />
                  <div>
                    <div className="attr-label">Profession</div>
                    <div className="attr-value">{candidate.profession}</div>
                  </div>
                </div>
              )}
              {candidate.education && (
                <div className="attribute-card">
                  <GraduationCap size={18} className="attr-icon purple" />
                  <div>
                    <div className="attr-label">Education</div>
                    <div className="attr-value">{candidate.education}</div>
                  </div>
                </div>
              )}
              <div className="attribute-card">
                <Compass size={18} className="attr-icon pink" />
                <div>
                  <div className="attr-label">Location</div>
                  <div className="attr-value">{candidate.city}</div>
                </div>
              </div>
            </div>
          </div>

          {/* LANGUAGES SPOKEN */}
          {candidate.languages && candidate.languages.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">
                <Globe size={16} /> Spoken Languages
              </h3>
              <div className="chips-row">
                {candidate.languages.map((lang, i) => (
                  <span key={i} className="detail-chip language">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* INTERESTS & PASSIONS */}
          {candidate.interests && candidate.interests.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">
                <Smile size={16} /> Interests & Passions
              </h3>
              <div className="chips-row">
                {candidate.interests.map((interest, i) => (
                  <span key={i} className="detail-chip interest">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {/* HOBBIES */}
          {candidate.hobbies && candidate.hobbies.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">
                <Sparkles size={16} /> Hobbies & Activities
              </h3>
              <div className="chips-row">
                {candidate.hobbies.map((hobby, i) => (
                  <span key={i} className="detail-chip hobby">{hobby}</span>
                ))}
              </div>
            </div>
          )}

          {/* FOOD & MUSIC */}
          <div className="detail-section">
            <h3 className="section-title">Taste & Preferences</h3>
            <div className="taste-columns">
              {candidate.foodPreferences && candidate.foodPreferences.length > 0 && (
                <div className="taste-box">
                  <div className="taste-title"><Utensils size={15} /> Food Choices</div>
                  <div className="chips-row">
                    {candidate.foodPreferences.map((food, i) => (
                      <span key={i} className="detail-chip food">{food}</span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.musicInterests && candidate.musicInterests.length > 0 && (
                <div className="taste-box">
                  <div className="taste-title"><Music size={15} /> Music Taste</div>
                  <div className="chips-row">
                    {candidate.musicInterests.map((m, i) => (
                      <span key={i} className="detail-chip music">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="modal-bottom-actions">
          {onPass && (
            <button 
              className="modal-action-btn pass" 
              onClick={() => { onPass(candidate); onClose(); }}
              title="Pass Profile"
            >
              <X size={24} /> <span>Pass</span>
            </button>
          )}

          {onStartChat && (
            <button 
              className="modal-action-btn chat" 
              onClick={() => { onStartChat(candidate); onClose(); }}
              title="Message Profile"
            >
              <MessageSquare size={22} /> <span>Chat Directly</span>
            </button>
          )}

          {onLike && (
            <button 
              className="modal-action-btn like" 
              onClick={() => { onLike(candidate); onClose(); }}
              title="Right Swipe Like"
            >
              <Heart size={24} fill="#ffffff" /> <span>Right Swipe</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
