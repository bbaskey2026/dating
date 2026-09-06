import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { MatchesService } from '../api';
import type { Candidate } from '../api';
import { notificationAudio } from '../utils/notificationAudio';

export interface ToastNotification {
  id: string;
  type: 'message' | 'match' | 'like' | 'info';
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  avatarUrl?: string;
  candidate?: Candidate;
  timestamp: number;
}

interface NotificationContextType {
  notifications: ToastNotification[];
  unreadCount: number;
  unreadMap: Record<string, number>;
  activeMatch: Candidate | null;
  wsConnected: boolean;
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  triggerMatchCelebration: (candidate: Candidate) => void;
  closeMatchModal: () => void;
  markConversationRead: (contactId: string) => void;
  sendWebSocketEvent: (payload: any) => boolean;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => boolean;
  subscribeToMessages: (cb: (msg: any) => void) => () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode; candidates?: Candidate[] }> = ({ 
  children,
  candidates = []
}) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [activeMatch, setActiveMatch] = useState<Candidate | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const knownMatchIdsRef = useRef<Set<string>>(new Set());
  const messageListenersRef = useRef<Set<(msg: any) => void>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const candidatesRef = useRef<Candidate[]>(candidates);

  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  const subscribeToMessages = useCallback((cb: (msg: any) => void) => {
    messageListenersRef.current.add(cb);
    return () => {
      messageListenersRef.current.delete(cb);
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: Date.now(),
    };

    setNotifications(prev => [newToast, ...prev.slice(0, 4)]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  }, [dismissToast]);

  const triggerMatchCelebration = useCallback((candidate: Candidate) => {
    setActiveMatch(candidate);
    notificationAudio.playMatchCelebration();
    showToast({
      type: 'match',
      title: "🎉 It's a Mutual Match!",
      message: `You and ${candidate.name} matched! Send a greeting now.`,
      senderName: candidate.name,
      avatarUrl: candidate.photos?.[0],
      candidate,
    });
  }, [showToast]);

  const closeMatchModal = useCallback(() => {
    setActiveMatch(null);
  }, []);

  const markConversationRead = useCallback((contactId: string) => {
    setUnreadMap(prev => {
      if (!prev[contactId]) return prev;
      const next = { ...prev };
      delete next[contactId];
      return next;
    });
  }, []);

  const handleIncomingEvent = useCallback((data: any) => {
    if (!data || typeof data !== 'object') return;

    // Notify all subscribed listeners (e.g. ChatPage)
    messageListenersRef.current.forEach(listener => {
      try { listener(data); } catch {}
    });

    // 1. Handle incoming chat message
    if (data.type === 'message' && data.senderId && data.senderId !== user?.id) {
      const partnerId = data.senderId;
      const matchingCand = candidatesRef.current.find(c => c.id === partnerId);
      const senderName = data.senderName || matchingCand?.name || 'New Message';
      const avatar = data.avatarUrl || matchingCand?.photos?.[0];

      // Increment unread count
      setUnreadMap(prev => ({
        ...prev,
        [partnerId]: (prev[partnerId] || 0) + 1,
      }));

      // Play audio chime
      notificationAudio.playMessageChime();

      // Show floating toast alert
      showToast({
        type: 'message',
        title: senderName,
        message: data.content || 'Sent you a message',
        senderId: partnerId,
        senderName,
        avatarUrl: avatar,
        candidate: matchingCand,
      });
    }

    // 2. Handle incoming match alert
    if (data.type === 'match' && (data.receiverId === user?.id || data.receiverId === '*')) {
      const partnerId = data.senderId;
      let matchingCand = candidatesRef.current.find(c => c.id === partnerId);
      if (!matchingCand && data.candidate) {
        matchingCand = data.candidate;
      } else if (!matchingCand) {
        matchingCand = {
          id: partnerId,
          name: data.senderName || 'Your Match',
          photos: [data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
          age: 24,
          matchScore: 94,
          gender: 'female',
          city: 'Ranchi',
          profession: 'Topolgira Member',
          relationshipGoal: 'marriage',
          bio: 'Mutual match on Topolgira!',
          interests: ['Music', 'Travel', 'Art'],
          verified: true,
        };
      }
      if (matchingCand) {
        triggerMatchCelebration(matchingCand);
      }
    }

    // 3. Handle incoming like alert
    if (data.type === 'like' && data.receiverId === user?.id) {
      const partnerId = data.senderId;
      const matchingCand = candidatesRef.current.find(c => c.id === partnerId);
      const name = data.senderName || matchingCand?.name || 'Someone';
      notificationAudio.playMessageChime();
      showToast({
        type: 'like',
        title: '💖 New Like!',
        message: `${name} liked your profile. Check your swipe deck!`,
        senderId: partnerId,
        senderName: name,
        avatarUrl: matchingCand?.photos?.[0],
        candidate: matchingCand,
      });
    }
  }, [user?.id, showToast, triggerMatchCelebration]);

  // Inter-tab BroadcastChannel Bridge for multi-tab testing
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('topolgira_sync_bus');
      bc.onmessage = (event) => {
        handleIncomingEvent(event.data);
      };
    } catch {}

    return () => {
      try { bc?.close(); } catch {}
    };
  }, [handleIncomingEvent]);

  const sendWebSocketEvent = useCallback((payload: any): boolean => {
    // Inter-tab bridge
    try {
      const bc = new BroadcastChannel('topolgira_sync_bus');
      bc.postMessage(payload);
      bc.close();
    } catch {}

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return true;
  }, []);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean): boolean => {
    if (!user?.id || !receiverId) return false;
    return sendWebSocketEvent({
      type: 'typing',
      senderId: user.id,
      receiverId,
      isTyping,
      timestamp: Math.floor(Date.now() / 1000),
    });
  }, [user?.id, sendWebSocketEvent]);

  // Global WebSocket Connection
  useEffect(() => {
    if (!user?.id) {
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      try {
        ws = new WebSocket('ws://localhost:9000/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) return;
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: 'auth', senderId: user.id }));
        };

        ws.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const data = JSON.parse(event.data);
            handleIncomingEvent(data);
          } catch (e) {
            console.error('Error decoding WS event', e);
          }
        };

        ws.onclose = () => {
          if (isDisposed) return;
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          if (isDisposed) return;
          setWsConnected(false);
        };
      } catch (err) {
        if (!isDisposed) {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 4000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            try { ws?.close(); } catch {}
          };
        }
      }
    };
  }, [user?.id, handleIncomingEvent]);

  // Background Match Polling: Detects matches created by either user in real-time
  useEffect(() => {
    if (!user?.id || !token) return;

    const checkMatches = async () => {
      try {
        const res = await MatchesService.getMatches();
        if (res.success && Array.isArray(res.data)) {
          const currentMatches = res.data;
          const prev = knownMatchIdsRef.current;
          currentMatches.forEach((m: any) => {
            if (!prev.has(m.id)) {
              prev.add(m.id);
              // If this is a new match, celebrate it!
              if (prev.size > 1) { // only trigger on new subsequent matches
                const partnerId = m.userAId === user.id ? m.userBId : m.userAId;
                const partnerCandidate = candidatesRef.current.find(c => c.id === partnerId);
                if (partnerCandidate) {
                  triggerMatchCelebration(partnerCandidate);
                }
              }
            }
          });
        }
      } catch {
        // Backend polling fallback
      }
    };

    checkMatches();
    const interval = setInterval(checkMatches, 6000);
    return () => clearInterval(interval);
  }, [user?.id, triggerMatchCelebration]);

  const totalUnreadCount = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: totalUnreadCount,
        unreadMap,
        activeMatch,
        wsConnected,
        showToast,
        dismissToast,
        triggerMatchCelebration,
        closeMatchModal,
        markConversationRead,
        sendWebSocketEvent,
        sendTypingIndicator,
        subscribeToMessages,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
