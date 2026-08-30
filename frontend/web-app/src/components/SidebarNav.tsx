import React from 'react';
import type { Candidate } from '../services/api';

interface SidebarProps {
  candidatesCount: number;
  matches: Candidate[];
  onSelectCandidateChat: (cand: Candidate) => void;
}

export const SidebarNav: React.FC<SidebarProps> = () => {
  // Navigation is driven by the Top Navbar Layout
  return null;
};
