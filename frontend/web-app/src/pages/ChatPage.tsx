import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import type { Candidate } from '../api';
import { ChatsService, MatchesService } from '../api';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Search, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  MessageSquare, 
  CheckCheck, 
  Maximize2,
  Lock,
  Heart,
  Flame
} from 'lucide-react';

interface ChatPageProps {
  selectedCandidate?: Candidate | null;
  candidates?: Candidate[];
  onSelectCandidate?: (cand: Candidate) => void;
  onInspectProfile?: (cand: Candidate) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ 
  selectedCandidate, 
  candidates = [], 
  onSelectCandidate,
  onInspectProfile
}) => {
  const { user } = useAuth();
  const { 
    markConversationRead, 
    wsConnected, 
    sendWebSocketEvent, 
    sendTypingIndicator, 
    subscribeToMessages,
    triggerMatchCelebration,
    showToast
  } = useNotifications();
  const navigate = useNavigate();

  // Matched / friended candidates list
  const [matches, setMatches] = useState<Candidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);

  // Active contact selection
  const [activeContact, setActiveContact] = useState<Candidate | null>(selectedCandidate || null);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Per-contact chat messages history
  const [chatStore, setChatStore] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({});

  const [chatInput, setChatInput] = useState('');
  const [partnerIsTyping, setPartnerIsTyping] = useState<boolean>(false);
  const [isSendingLike, setIsSendingLike] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<any>(null);

  // 1. Fetch real mutual matches / friended contacts from backend
  const fetchMutualMatches = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await MatchesService.getMatches();
      if (res?.success && Array.isArray(res.data)) {
        const mappedMatches: Candidate[] = res.data.map((m: any, idx: number) => {
          const p = m.partner || {};
          const partnerId = p.userId || p.id || m.matchId;
          // Cross-reference with candidate deck for rich photos and interests if available
          const foundInDeck = candidates.find(c => c.id === partnerId);
          if (foundInDeck) return foundInDeck;

          return {
            id: partnerId,
            name: p.name || 'Matched Contact',
            age: p.age || 24,
            gender: p.gender || 'female',
            city: p.city || 'Ranchi',
            profession: p.profession || 'Professional',
            relationshipGoal: p.relationshipGoal || 'marriage',
            bio: p.bio || 'Mutual connection on Topolgira.',
            matchScore: p.matchScore || Math.floor(85 + (idx * 3) % 15),
            interests: Array.isArray(p.interests) && p.interests.length ? p.interests : ['Music', 'Travel', 'Art'],
            photos: Array.isArray(p.photos) && p.photos.length ? p.photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
            verified: true,
          };
        });

        if (mappedMatches.length > 0) {
          setMatches(mappedMatches);
        } else if (candidates.length > 0) {
          setMatches(candidates.slice(0, 4));
        }

        // If no active contact selected yet, select first match if present
        setActiveContact(prev => {
          if (prev) return prev;
          if (selectedCandidate) return selectedCandidate;
          if (mappedMatches.length > 0) return mappedMatches[0];
          return candidates.length > 0 ? candidates[0] : null;
        });
      } else if (candidates.length > 0) {
        setMatches(candidates.slice(0, 4));
        setActiveContact(prev => prev || selectedCandidate || candidates[0]);
      }
    } catch (err) {
      console.warn('Error loading mutual matches:', err);
      if (candidates.length > 0) {
        setMatches(candidates.slice(0, 4));
        setActiveContact(prev => prev || selectedCandidate || candidates[0]);
      }
    } finally {
      setIsLoadingMatches(false);
    }
  }, [user?.id, candidates, selectedCandidate]);

  // 2. Fetch message history from REST backend for active contact
  const fetchMessagesForContact = useCallback(async (contactId: string) => {
    if (!contactId || contactId === 'default' || !user?.id) return;
    try {
      const res = await ChatsService.getChatHistory(contactId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((m: any) => ({
          sender: m.senderId === user.id ? 'me' : 'them',
          text: m.content,
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setChatStore(prev => {
          const existing = prev[contactId] || [];
          const combined = [...formatted];
          existing.forEach(localMsg => {
            if (!combined.some(s => s.text === localMsg.text && s.sender === localMsg.sender)) {
              combined.push(localMsg);
            }
          });
          return {
            ...prev,
            [contactId]: combined.length > 0 ? combined : existing,
          };
        });
      }
    } catch (err) {
      console.warn('Could not load chat history from server', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMutualMatches();
    const interval = setInterval(fetchMutualMatches, 6000);
    return () => clearInterval(interval);
  }, [fetchMutualMatches]);

  // Synchronize when parent updates selectedCandidate
  useEffect(() => {
    if (selectedCandidate) {
      setActiveContact(selectedCandidate);
      fetchMutualMatches();
      if (selectedCandidate.id) {
        fetchMessagesForContact(selectedCandidate.id);
      }
    }
  }, [selectedCandidate, fetchMutualMatches, fetchMessagesForContact]);

  // Check if active contact is a mutual match / friended
  const isMatchedWithActive = activeContact ? (
    matches.some(m => m.id === activeContact.id) || (selectedCandidate && selectedCandidate.id === activeContact.id && activeContact.id !== 'default')
  ) : false;

  // Mark conversation read on contact select
  useEffect(() => {
    if (activeContact?.id) {
      markConversationRead(activeContact.id);
    }
  }, [activeContact?.id, markConversationRead]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatStore, activeContact, partnerIsTyping]);

  // Poll backend for consistency between users
  useEffect(() => {
    if (activeContact?.id && isMatchedWithActive) {
      fetchMessagesForContact(activeContact.id);
    }
    const interval = setInterval(() => {
      if (activeContact?.id && isMatchedWithActive) {
        fetchMessagesForContact(activeContact.id);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeContact?.id, isMatchedWithActive, fetchMessagesForContact]);

  // Subscribe to real-time incoming messages & typing indicators via global NotificationContext
  useEffect(() => {
    const unsubscribe = subscribeToMessages((data: any) => {
      // 1. Incoming real-time message
      if (data.type === 'message' && data.content && data.senderId && data.senderId !== user?.id) {
        const partnerId = data.senderId;
        const newIncomingMsg = {
          sender: 'them',
          text: data.content,
          time: new Date(data.timestamp ? data.timestamp * 1000 : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatStore(prev => {
          const currentList = prev[partnerId] || [];
          const isDuplicate = currentList.some(
            m => m.text === newIncomingMsg.text && m.sender === 'them' && m.time === newIncomingMsg.time
          );
          if (isDuplicate) return prev;
          return {
            ...prev,
            [partnerId]: [...currentList, newIncomingMsg],
          };
        });
        setPartnerIsTyping(false);
      }

      // 2. Incoming typing indicator
      if (data.type === 'typing' && data.senderId === activeContact?.id) {
        setPartnerIsTyping(!!data.isTyping);
      }
    });
    return unsubscribe;
  }, [subscribeToMessages, user?.id, activeContact?.id]);

  // Handle typing change in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    if (!activeContact?.id || !isMatchedWithActive) return;

    sendTypingIndicator(activeContact.id, true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingIndicator(activeContact.id, false);
    }, 2000);
  };

  const sendChatMessage = async (customText?: string) => {
    const textToSend = customText || chatInput.trim();
    if (!textToSend || !user || !activeContact) return;

    if (!isMatchedWithActive) {
      showToast({
        type: 'info',
        title: 'Mutual Match Required',
        message: 'You must mutually match with this profile before sending direct chat messages.',
      });
      return;
    }

    const contactId = activeContact.id;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistic UI update
    const newMsg = {
      sender: 'me',
      text: textToSend,
      time: timeStr,
    };

    setChatStore(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg]
    }));

    setChatInput('');
    sendTypingIndicator(contactId, false);

    // 1. Send live via shared Go WebSocket Gateway
    sendWebSocketEvent({
      type: 'message',
      chatId: 'chat_' + [user.id, contactId].sort().join('_'),
      senderId: user.id,
      receiverId: contactId,
      content: textToSend,
      timestamp: Math.floor(Date.now() / 1000),
    });

    // 2. Persist to Node.js backend database
    try {
      await ChatsService.sendMessage(contactId, textToSend);
    } catch (err) {
      console.error('Failed to persist chat message to API:', err);
    }
  };

  const handleSelectContact = (cand: Candidate) => {
    setActiveContact(cand);
    setPartnerIsTyping(false);
    if (onSelectCandidate) {
      onSelectCandidate(cand);
    }
  };

  // Handle Like action to unlock chat with an unmatched candidate
  const handleSendLikeToUnlock = async () => {
    if (!activeContact || isSendingLike) return;
    setIsSendingLike(true);
    try {
      const res = await MatchesService.sendLike(activeContact.id);
      
      // Broadcast WebSocket like event
      if (user?.id) {
        sendWebSocketEvent({
          type: 'like',
          senderId: user.id,
          receiverId: activeContact.id,
        });
      }

      if (res?.message === 'ITS_A_MATCH' || res?.data?.isMatch) {
        triggerMatchCelebration(activeContact);
        if (user?.id) {
          sendWebSocketEvent({
            type: 'match',
            senderId: user.id,
            receiverId: activeContact.id,
          });
        }
        await fetchMutualMatches();
      } else {
        showToast({
          type: 'like',
          title: '💖 Like Sent!',
          message: `You liked ${activeContact.name}. Once they like you back, direct chat will unlock immediately!`,
        });
      }
    } catch (err) {
      console.error('Error sending like:', err);
    } finally {
      setIsSendingLike(false);
    }
  };

  // Filter contacts by search query
  const filteredMatches = matches.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = activeContact ? (chatStore[activeContact.id] || []) : [];

  return (
    <div style={{ display: 'flex', height: '100vh', maxHeight: '100vh', width: '100%', background: '#ffffff', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR: MATCHED / FRIENDED CONTACTS LIST */}
      <div style={{ 
        width: '320px', 
        minWidth: '300px', 
        borderRight: '1px solid #e2e8f0', 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#ffffff',
        height: '100vh',
        maxHeight: '100vh',
        minHeight: 0
      }}>
        {/* CONTACTS HEADER */}
        <div style={{ padding: '20px 20px 14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="#ec4899" /> Messages
            </h2>
            <span style={{ background: '#fce7f3', color: '#ec4899', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '14px' }}>
              {matches.length} Matches
            </span>
          </div>

          {/* SEARCH BAR */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search mutual matches..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* MUTUAL MATCHES CONVERSATIONS LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {isLoadingMatches ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: '13px' }}>
              Loading mutual connections...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Heart size={24} color="#ec4899" />
              </div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>No Matches Yet</h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
                Only mutual matches can direct chat. Swipe on profiles to find connections!
              </p>
              <button 
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }}
                onClick={() => navigate('/swipe')}
              >
                <Flame size={14} /> Start Swiping
              </button>
            </div>
          ) : (
            filteredMatches.map((cand) => {
              const isSelected = activeContact?.id === cand.id;
              const history = chatStore[cand.id] || [];
              const lastMsg = history.length > 0 ? history[history.length - 1] : null;

              return (
                <div 
                  key={cand.id}
                  onClick={() => handleSelectContact(cand)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: isSelected ? '#f1f5f9' : 'transparent',
                    borderLeft: isSelected ? '4px solid #ec4899' : '4px solid transparent',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={cand.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
                      alt={cand.name} 
                      style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: isSelected ? '2px solid #ec4899' : '1px solid #e2e8f0' 
                      }} 
                    />
                    <span 
                      className="online-indicator-dot" 
                      style={{ 
                        position: 'absolute', 
                        bottom: '2px', 
                        right: '2px', 
                        width: '10px', 
                        height: '10px',
                        border: '2px solid #ffffff',
                        background: wsConnected ? '#10b981' : '#cbd5e1'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: isSelected ? '800' : '700', fontSize: '14px', color: '#0f172a' }}>
                        {cand.name}
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#ec4899', fontWeight: '800' }}>
                        {cand.matchScore}% Match
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {lastMsg ? (
                        <>
                          {lastMsg.sender === 'me' && <CheckCheck size={13} color="#ec4899" />}
                          <span>{lastMsg.text}</span>
                        </>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Start conversation...</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: LIVE CHAT OR MUTUAL MATCH LOCK SCREEN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', minHeight: 0, background: '#ffffff', overflow: 'hidden' }}>
        
        {!activeContact ? (
          /* NO CONTACT SELECTED EMPTY STATE */
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px', maxWidth: '420px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <MessageSquare size={32} color="#ec4899" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Your Direct Messages</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
              Select a mutual match from the left sidebar to start live chatting in real-time.
            </p>
            <button 
              className="btn-primary" 
              style={{ padding: '10px 22px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => navigate('/swipe')}
            >
              <Flame size={16} /> Discover More Profiles
            </button>
          </div>
        ) : !isMatchedWithActive ? (
          /* UNMATCHED PROFILE: DIRECT CHAT LOCKED SCREEN */
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px', maxWidth: '460px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 20px auto' }}>
              <img 
                src={activeContact.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
                alt={activeContact.name}
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ec4899' }}
              />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#0f172a', borderRadius: '50%', padding: '6px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={16} color="#f59e0b" />
              </div>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              Direct Chat Locked
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
              Only <strong>mutual matches (friended profiles)</strong> can direct chat. Both you and <strong style={{ color: '#0f172a' }}>{activeContact.name}</strong> must like each other to unlock 1-on-1 chatting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '12px 28px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '16px' }}
                onClick={handleSendLikeToUnlock}
                disabled={isSendingLike}
              >
                <Heart size={18} fill="#ffffff" /> {isSendingLike ? 'Sending Like...' : `Like & Match with ${activeContact.name}`}
              </button>

              {onInspectProfile && (
                <button 
                  className="btn-secondary" 
                  style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '14px' }}
                  onClick={() => onInspectProfile(activeContact)}
                >
                  <Maximize2 size={14} /> View Full Profile
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MUTUAL MATCH LIVE CHAT SCREEN */
          <>
            {/* ACTIVE CONTACT HEADER */}
            <div style={{ 
              padding: '16px 24px', 
              background: '#ffffff', 
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src={activeContact.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
                  alt={activeContact.name} 
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ec4899', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }} 
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeContact.name}, {activeContact.age}
                    <span style={{ fontSize: '11px', background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                      {activeContact.matchScore}% Match
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: wsConnected ? '#10b981' : '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <span className="online-indicator-dot" style={{ background: wsConnected ? '#10b981' : '#cbd5e1' }}></span> 
                    {wsConnected ? 'Connected via Go WebSocket' : 'Connecting to chat...'} • {activeContact.profession} ({activeContact.city})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {onInspectProfile && (
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: '#ec4899', borderColor: '#fbcfe8', background: '#fdf2f8' }} 
                    title="View Full Profile"
                    onClick={() => onInspectProfile(activeContact)}
                  >
                    <Maximize2 size={14} /> Full Profile
                  </button>
                )}
                <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '12px' }} title="Voice Call">
                  <Phone size={16} color="#64748b" />
                </button>
                <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '12px' }} title="Video Call">
                  <Video size={16} color="#64748b" />
                </button>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }} onClick={() => navigate('/swipe')}>
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
            </div>

            {/* CHAT MESSAGE STREAM */}
            <div style={{ 
              flex: 1, 
              padding: '24px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '14px', 
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(/chat-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: 0 
            }}>
              <div style={{ textAlign: 'center', margin: '4px 0 12px 0' }}>
                <span style={{ background: '#ffffff', padding: '6px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  ✨ Mutual Match with {activeContact.name} ({activeContact.matchScore}% Compatibility)
                </span>
              </div>

              {activeMessages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '400px' }}>
                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                    <Sparkles size={28} color="#f59e0b" style={{ margin: '0 auto 12px auto' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Say Hello to {activeContact.name}!</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Break the ice with one of these quick openers:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button className="btn-secondary" style={{ fontSize: '12.5px', padding: '8px 14px', textAlign: 'left' }} onClick={() => sendChatMessage(`Hey ${activeContact.name}! 👋 Great to connect with you.`)}>
                        "Hey {activeContact.name}! 👋 Great to connect with you."
                      </button>
                      <button className="btn-secondary" style={{ fontSize: '12.5px', padding: '8px 14px' }} onClick={() => sendChatMessage(`Hi ${activeContact.name}, loved your photos! How's your week going? ☕`)}>
                        "Hi {activeContact.name}, loved your photos! How's your week going? ☕"
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                activeMessages.map((m, idx) => (
                  <div key={idx} className={`chat-bubble ${m.sender === 'me' ? 'me' : 'them'}`}>
                    <div>{m.text}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      {m.time} {m.sender === 'me' && <CheckCheck size={12} />}
                    </div>
                  </div>
                ))
              )}
              {partnerIsTyping && (
                <div className="chat-bubble them" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', width: 'fit-content' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{activeContact.name} is typing</span>
                  <span className="dot-flashing" style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#ec4899' }}></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT FOOTER */}
            <div style={{ 
              padding: '16px 20px', 
              background: '#ffffff', 
              borderTop: '1px solid #e2e8f0', 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 10
            }}>
              <button className="btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} title="Attach media">
                <Paperclip size={18} color="#64748b" />
              </button>
              <button className="btn-secondary" style={{ padding: '10px', borderRadius: '12px' }} title="Add emoji">
                <Smile size={18} color="#64748b" />
              </button>
              <input 
                type="text" 
                placeholder={`Message ${activeContact.name}...`} 
                value={chatInput} 
                onChange={handleInputChange} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }} 
                style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }}
              />
              <button className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '14px' }} onClick={() => sendChatMessage()}>
                Send <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

