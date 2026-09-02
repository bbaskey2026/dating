import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
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
import { ProfileDetailsModal } from './components/ProfileDetailsModal';
import { MatchNotificationModal } from './components/MatchNotificationModal';
import { ToastNotificationContainer } from './components/ToastNotificationContainer';
import type { Candidate } from './api';
import { MatchesService } from './api';

export function AppContent() {
  const { user } = useAuth();
  const { activeMatch, triggerMatchCelebration, closeMatchModal, sendWebSocketEvent } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [inspectingCandidate, setInspectingCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLiveCandidates = useCallback(async () => {
    try {
      const data = await MatchesService.getProfiles();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped: Candidate[] = data.data.map((p: any, idx: number) => ({
          id: p.userId || p.id,
          name: p.name || 'Candidate',
          age: p.age || 24,
          gender: p.gender || 'female',
          city: p.city || 'Ranchi',
          profession: p.profession || 'Professional',
          education: p.education || '',
          relationshipGoal: p.relationshipGoal || 'marriage',
          bio: p.bio || 'Exploring meaningful connections on Topolgira.',
          matchScore: p.matchScore || Math.floor(78 + (idx * 3) % 20),
          interests: Array.isArray(p.interests) && p.interests.length ? p.interests : ['Music', 'Travel', 'Art'],
          languages: Array.isArray(p.languages) && p.languages.length ? p.languages : ['Hindi', 'English'],
          hobbies: Array.isArray(p.hobbies) && p.hobbies.length ? p.hobbies : ['Photography', 'Music'],
          foodPreferences: Array.isArray(p.foodPreferences) && p.foodPreferences.length ? p.foodPreferences : ['Street Food', 'Biryani'],
          musicInterests: Array.isArray(p.musicInterests) && p.musicInterests.length ? p.musicInterests : ['Indie', 'Bollywood'],
          photos: Array.isArray(p.photos) && p.photos.length ? p.photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'],
          isRecentlyRegistered: idx < 3,
          verified: true,
        }));

        setCandidates(mapped);
        if (!selectedCandidate && mapped.length > 0) {
          setSelectedCandidate(mapped[0]);
        }
      }
    } catch (err) {
      console.warn('Backend API offline or fetching error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCandidate]);

  useEffect(() => {
    fetchLiveCandidates();
    const interval = setInterval(fetchLiveCandidates, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveCandidates]);

  const handleStartChat = (cand: Candidate) => {
    setSelectedCandidate(cand);
    navigate('/chat');
  };

  const handleAddCandidate = (newCand: Candidate) => {
    setCandidates(prev => [newCand, ...prev]);
  };

  const handleInspectProfile = (cand: Candidate) => {
    setInspectingCandidate(cand);
  };

  const handleLikeFromModal = async (cand: Candidate) => {
    try {
      const res = await MatchesService.sendLike(cand.id);
      // Broadcast live real-time like event
      if (user?.id) {
        sendWebSocketEvent({
          type: 'like',
          senderId: user.id,
          receiverId: cand.id,
        });
      }

      if (res?.message === 'ITS_A_MATCH' || res?.data?.isMatch) {
        triggerMatchCelebration(cand);
        // Broadcast live match celebration event to partner
        if (user?.id) {
          sendWebSocketEvent({
            type: 'match',
            senderId: user.id,
            receiverId: cand.id,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMatchTriggered = (cand: Candidate) => {
    triggerMatchCelebration(cand);
    if (user?.id) {
      sendWebSocketEvent({
        type: 'match',
        senderId: user.id,
        receiverId: cand.id,
      });
    }
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
          <Route 
            path="/swipe" 
            element={
              <ProtectedRoute featureName="Candidate Swipe Deck">
                <SwipePage 
                  candidates={candidates} 
                  isLoading={isLoading}
                  onStartChat={handleStartChat} 
                  onInspectProfile={handleInspectProfile}
                  onMatchTriggered={handleMatchTriggered}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute featureName="User Dashboard & SLA Analytics">
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/catalog" 
            element={
              <ProtectedRoute featureName="Registered Profiles Catalog">
                <CatalogPage 
                  candidates={candidates} 
                  isLoading={isLoading}
                  onRefresh={fetchLiveCandidates} 
                  onStartChat={handleStartChat}
                  onInspectProfile={handleInspectProfile}
                  onMatchTriggered={handleMatchTriggered}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute featureName="Realtime WebSocket Chat">
                <ChatPage 
                  selectedCandidate={selectedCandidate || candidates[0] || null} 
                  candidates={candidates} 
                  onSelectCandidate={setSelectedCandidate}
                  onInspectProfile={handleInspectProfile}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute featureName="Profile & Discovery Settings">
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/showcase" 
            element={
              <ProtectedRoute featureName="All Components Showcase">
                <ShowcasePage 
                  candidates={candidates} 
                  selectedCandidate={selectedCandidate || candidates[0]} 
                  onRefresh={fetchLiveCandidates} 
                  onStartChat={handleStartChat} 
                />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {/* FULL PROFILE DETAILS INSPECTOR MODAL */}
      <ProfileDetailsModal 
        candidate={inspectingCandidate}
        isOpen={!!inspectingCandidate}
        onClose={() => setInspectingCandidate(null)}
        onLike={handleLikeFromModal}
        onStartChat={handleStartChat}
      />

      {/* MUTUAL MATCH CELEBRATION MODAL */}
      <MatchNotificationModal 
        candidate={activeMatch}
        isOpen={!!activeMatch}
        onClose={closeMatchModal}
        onStartChat={handleStartChat}
      />

      {/* REALTIME TOAST NOTIFICATIONS POPUPS */}
      <ToastNotificationContainer 
        onStartChat={handleStartChat}
        onInspectProfile={handleInspectProfile}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

