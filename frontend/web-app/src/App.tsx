import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HeaderBar } from './components/HeaderBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SwipePage } from './pages/SwipePage';
import { CatalogPage } from './pages/CatalogPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { LandingPage } from './pages/LandingPage';
import type { Candidate } from './api';
import { MatchesService } from './api';

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'user_b',
    name: 'Ananya Sharma',
    age: 24,
    gender: 'female',
    city: 'Ranchi',
    profession: 'UI/UX Designer',
    relationshipGoal: 'marriage',
    bio: 'Loves classical music, weekend travel, and authentic street food.',
    matchScore: 94,
    interests: ['Music', 'Travel', 'Movies', 'Art'],
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'user_c',
    name: 'Priya Hansda',
    age: 23,
    gender: 'female',
    city: 'Jamshedpur',
    profession: 'Architect',
    relationshipGoal: 'serious_relationship',
    bio: 'Exploring heritage architecture, hiking, and acoustic guitar.',
    matchScore: 89,
    interests: ['Travel', 'Music', 'Cricket', 'Photography'],
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'user_d',
    name: 'Sneha Murmu',
    age: 25,
    gender: 'female',
    city: 'Ranchi',
    profession: 'Data Scientist',
    relationshipGoal: 'marriage',
    bio: 'AI enthusiast, loves cycling around Kanke Dam and listening to indie pop.',
    matchScore: 85,
    interests: ['Technology', 'Gaming', 'Music', 'Fitness'],
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'user_e',
    name: 'Rahul Soren',
    age: 26,
    gender: 'male',
    city: 'Dhanbad',
    profession: 'Software Engineer',
    relationshipGoal: 'marriage',
    bio: 'Avid coder, loves playing guitar and watching cricket matches.',
    matchScore: 78,
    interests: ['Cricket', 'Technology', 'Music', 'Gaming'],
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'],
  },
];

export function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(INITIAL_CANDIDATES[0]);

  const fetchLiveCandidates = async () => {
    try {
      const data = await MatchesService.getProfiles();
      if (data.success && data.data.length > 0) {
        const mapped: Candidate[] = data.data.map((p: any, idx: number) => ({
          id: p.userId || p.id,
          name: p.name || 'Candidate',
          age: p.age || 24,
          gender: p.gender || 'female',
          city: p.city || 'Ranchi',
          profession: p.profession || 'Software Engineer',
          relationshipGoal: p.relationshipGoal || 'marriage',
          bio: p.bio || 'Loves music and technology.',
          matchScore: Math.floor(75 + Math.random() * 23),
          interests: p.interests?.length ? p.interests : ['Music', 'Travel'],
          photos: p.photos?.length ? p.photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
          isRecentlyRegistered: idx < 3,
        }));

        setCandidates(() => {
          const existingIds = new Set(mapped.map(m => m.id));
          const filteredInitial = INITIAL_CANDIDATES.filter(ic => !existingIds.has(ic.id));
          return [...mapped, ...filteredInitial];
        });
      }
    } catch (err) {
      console.warn('Backend API offline, using initial candidates');
    }
  };

  useEffect(() => {
    fetchLiveCandidates();
    const interval = setInterval(fetchLiveCandidates, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartChat = (cand: Candidate) => {
    setSelectedCandidate(cand);
    navigate('/chat');
  };

  const handleAddCandidate = (newCand: Candidate) => {
    setCandidates(prev => [newCand, ...prev]);
  };

  return (
    <div className="card-container">
      {!isLandingPage && <HeaderBar candidatesCount={candidates.length} />}
      <main className="main-content">
        <Routes>
          {/* PUBLIC UNPROTECTED ROUTES */}
          <Route path="/" element={<LandingPage candidates={candidates} />} />
          <Route path="/landing" element={<LandingPage candidates={candidates} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage onCandidateAdded={handleAddCandidate} />} />

          {/* STRICTLY PROTECTED ROUTES - REQUIRES LOGIN */}
          <Route path="/swipe" element={<ProtectedRoute featureName="Candidate Swipe Deck"><SwipePage candidates={candidates} onStartChat={handleStartChat} /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute featureName="User Dashboard & SLA Analytics"><DashboardPage /></ProtectedRoute>} />
          <Route path="/catalog" element={<ProtectedRoute featureName="Registered Profiles Catalog"><CatalogPage candidates={candidates} onRefresh={fetchLiveCandidates} onStartChat={handleStartChat} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute featureName="Realtime WebSocket Chat"><ChatPage selectedCandidate={selectedCandidate} candidates={candidates} onSelectCandidate={setSelectedCandidate} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute featureName="Profile & Discovery Settings"><SettingsPage /></ProtectedRoute>} />
          <Route path="/showcase" element={<ProtectedRoute featureName="All Components Showcase"><ShowcasePage candidates={candidates} selectedCandidate={selectedCandidate} onRefresh={fetchLiveCandidates} onStartChat={handleStartChat} /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
