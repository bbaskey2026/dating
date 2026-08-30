import React from 'react';
import { SwipePage } from './SwipePage';
import { DashboardPage } from './DashboardPage';
import { CatalogPage } from './CatalogPage';
import { ChatPage } from './ChatPage';
import { SettingsPage } from './SettingsPage';
import type { Candidate } from '../services/api';
import { Layers } from 'lucide-react';

interface ShowcasePageProps {
  candidates: Candidate[];
  selectedCandidate: Candidate;
  onRefresh: () => void;
  onStartChat: (cand: Candidate) => void;
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ candidates, selectedCandidate, onRefresh, onStartChat }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '24px', overflowY: 'auto' }}>
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Layers size={22} color="#ec4899" /> All Application Views
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Explore all components stacked sequentially below.
        </p>
      </div>

      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ec4899', marginBottom: '14px' }}>1. Candidate Swipe Deck</h3>
        <SwipePage candidates={candidates} onStartChat={onStartChat} />
      </div>

      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7', marginBottom: '14px' }}>2. User Dashboard</h3>
        <DashboardPage />
      </div>

      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', marginBottom: '14px' }}>3. Candidate Catalog</h3>
        <CatalogPage candidates={candidates} onRefresh={onRefresh} onStartChat={onStartChat} />
      </div>

      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '30px', minHeight: '500px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#8b5cf6', marginBottom: '14px' }}>4. Live Chat</h3>
        <ChatPage selectedCandidate={selectedCandidate} candidates={candidates} onSelectCandidate={onStartChat} />
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c', marginBottom: '14px' }}>5. Settings & Preferences</h3>
        <SettingsPage />
      </div>
    </div>
  );
};
