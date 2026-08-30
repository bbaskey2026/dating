import React from 'react';
import type { Candidate } from '../services/api';
import { RefreshCw, Sparkles, MapPin, Briefcase, Heart, MessageSquare } from 'lucide-react';

interface CatalogPageProps {
  candidates: Candidate[];
  onRefresh: () => void;
  onStartChat: (cand: Candidate) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ candidates, onRefresh, onStartChat }) => {
  return (
    <div className="step-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>Registered Candidates Catalog</h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>Browse registered profiles and start instant live chats.</p>
        </div>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={onRefresh}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {candidates.map(cand => (
          <div key={cand.id} style={{ background: '#ffffff', borderRadius: '24px', border: cand.isRecentlyRegistered ? '2px solid #10b981' : '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'relative', height: '190px' }}>
              <img src={cand.photos[0]} alt={cand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: '800', fontSize: '12px', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}>
                {cand.matchScore}% Match
              </div>
              {cand.isRecentlyRegistered && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '14px', fontWeight: '800', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                  <Sparkles size={11} /> NEW
                </div>
              )}
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{cand.name}, {cand.age}</h3>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {cand.city}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <Briefcase size={13} color="#ea580c" /> {cand.profession} • <Heart size={13} color="#ec4899" /> {cand.relationshipGoal}
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>"{cand.bio}"</p>

              <button className="btn-primary" style={{ marginTop: 'auto', padding: '12px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => onStartChat(cand)}>
                <MessageSquare size={15} /> Start Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
