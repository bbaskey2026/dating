import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import type { Candidate } from '../api';
import { ChatsService } from '../api';
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
  Maximize2
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
  const { markConversationRead, wsConnected, sendWebSocketEvent, subscribeToMessages } = useNotifications();
  const navigate = useNavigate();

  // Active contact selection
  const [activeContact, setActiveContact] = useState<Candidate>(
    selectedCandidate || candidates[0] || {
      id: 'default',
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
    }
  );

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Per-contact chat messages history
  const [chatStore, setChatStore] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({});

  const [chatInput, setChatInput] = useState('');
  const [isTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Synchronize when parent updates selectedCandidate
  useEffect(() => {
    if (selectedCandidate) {
      setActiveContact(selectedCandidate);
    }
  }, [selectedCandidate]);

  // Mark conversation read on contact select
  useEffect(() => {
    if (activeContact?.id) {
      markConversationRead(activeContact.id);
    }
  }, [activeContact?.id, markConversationRead]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatStore, activeContact]);

  // Fetch message history from REST backend for active contact
  const fetchMessagesForContact = useCallback(async (contactId: string) => {
    if (!contactId || contactId === 'default' || !user?.id) return;
    try {
      const res = await ChatsService.getChatHistory(contactId);
      if (res?.success && Array.isArray(res.data)) {
        const formatted = res.data.map((m: any) => ({
          sender: m.senderId === user.id ? 'me' : 'them',
          text: m.content,
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setChatStore(prev => ({
          ...prev,
          [contactId]: formatted,
        }));
      }
    } catch (err) {
      console.warn('Could not load chat history from server', err);
    }
  }, [user?.id]);

  // Poll backend for consistency between users
  useEffect(() => {
    if (activeContact?.id && activeContact.id !== 'default') {
      fetchMessagesForContact(activeContact.id);
    }
    const interval = setInterval(() => {
      if (activeContact?.id && activeContact.id !== 'default') {
        fetchMessagesForContact(activeContact.id);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeContact?.id, fetchMessagesForContact]);

  // Subscribe to real-time incoming messages via global NotificationContext
  useEffect(() => {
    const unsubscribe = subscribeToMessages((data: any) => {
      if (data.type === 'message' && data.senderId && data.senderId !== user?.id) {
        const partnerId = data.senderId;
        const newIncomingMsg = {
          sender: 'them',
          text: data.content,
          time: new Date(data.timestamp ? data.timestamp * 1000 : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatStore(prev => ({
          ...prev,
          [partnerId]: [...(prev[partnerId] || []), newIncomingMsg]
        }));
      }
    });
    return unsubscribe;
  }, [subscribeToMessages, user?.id]);

  const sendChatMessage = async (customText?: string) => {
    const textToSend = customText || chatInput.trim();
    if (!textToSend || !user) return;

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

    // 1. Send live via shared WebSocket
    sendWebSocketEvent({
      type: 'message',
      chatId: 'chat_' + [user.id, contactId].sort().join('_'),
      senderId: user.id,
      receiverId: contactId,
      content: textToSend,
      timestamp: Math.floor(Date.now() / 1000),
    });

    // 2. Persist to Node.js backend database
    if (contactId !== 'default') {
      try {
        await ChatsService.sendMessage(contactId, textToSend);
      } catch (err) {
        console.error('Failed to persist chat message to API:', err);
      }
    }
  };

  const handleSelectContact = (cand: Candidate) => {
    setActiveContact(cand);
    if (onSelectCandidate) {
      onSelectCandidate(cand);
    }
  };

  // Filter contacts by search query
  const filteredCandidates = candidates.length > 0 ? candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [activeContact];

  const activeMessages = chatStore[activeContact.id] || [];

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: '#ffffff', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR: CONTACTS & CHAT HISTORIES LIST (WHATSAPP STYLE) */}
      <div style={{ 
        width: '320px', 
        minWidth: '300px', 
        borderRight: '1px solid #e2e8f0', 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#ffffff',
        height: '100%'
      }}>
        {/* CONTACTS HEADER */}
        <div style={{ padding: '20px 20px 14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="#ec4899" /> Messages
            </h2>
            <span style={{ background: '#fce7f3', color: '#ec4899', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '14px' }}>
              {candidates.length} Matches
            </span>
          </div>

          {/* SEARCH BAR */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
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

        {/* RECENT CONVERSATIONS LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredCandidates.map((cand) => {
            const isSelected = cand.id === activeContact.id;
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
                    src={cand.photos[0]} 
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
                      border: '2px solid #ffffff'
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
          })}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: LIVE CHAT CONVERSATION */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
        {/* ACTIVE CONTACT HEADER */}
        <div style={{ 
          padding: '16px 24px', 
          background: '#ffffff', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={activeContact.photos[0]} 
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
                <span className="online-indicator-dot" style={{ background: wsConnected ? '#10b981' : '#94a3b8' }}></span> 
                {wsConnected ? `Online & Connected` : 'Offline (Local WS)'} • {activeContact.profession} ({activeContact.city})
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
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafa' }}>
          <div style={{ textAlign: 'center', margin: '4px 0 12px 0' }}>
            <span style={{ background: '#ffffff', padding: '6px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              Matched with {activeContact.name} ({activeContact.matchScore}% Compatibility)
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
          {isTyping && (
            <div className="chat-bubble them" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', width: 'fit-content' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{activeContact.name} is typing</span>
              <span className="dot-flashing" style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#ec4899' }}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FOOTER */}
        <div style={{ padding: '16px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            onChange={e => setChatInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && sendChatMessage()} 
            style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }}
          />
          <button className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '14px' }} onClick={() => sendChatMessage()}>
            Send <Send size={15} />
          </button>
        </div>
      </div>

    </div>
  );
};
