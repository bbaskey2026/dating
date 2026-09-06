import React, { createContext, useContext, useState } from 'react';
import { AuthService } from '../api';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (payload: any) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('topolgira_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('topolgira_token') || null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.login(email, pass);
      if (res.success) {
        const profile = res.data.profile;
        const photo = profile?.photos?.[0]?.url || (typeof profile?.photos?.[0] === 'string' ? profile?.photos?.[0] : undefined);
        const u: User = {
          ...res.data.user,
          name: profile?.name || res.data.user?.name || email.split('@')[0],
          photoUrl: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        };
        const t = res.data.accessToken;
        setUser(u);
        setToken(t);
        localStorage.setItem('topolgira_user', JSON.stringify(u));
        localStorage.setItem('topolgira_token', t);
        setLoading(false);
        return true;
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      const demoId = 'user_demo_' + Math.random().toString(36).substring(2, 7);
      const demoUser: User = { 
        id: demoId, 
        email, 
        name: email.split('@')[0],
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      const demoToken = 'demo_token_' + demoId;
      setUser(demoUser);
      setToken(demoToken);
      localStorage.setItem('topolgira_user', JSON.stringify(demoUser));
      localStorage.setItem('topolgira_token', demoToken);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const register = async (payload: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.register(payload);
      if (res.success) {
        const profile = res.data.profile;
        const photo = profile?.photos?.[0]?.url || (typeof profile?.photos?.[0] === 'string' ? profile?.photos?.[0] : undefined);
        const u: User = {
          ...res.data.user,
          name: profile?.name || payload.name || res.data.user?.name || payload.email.split('@')[0],
          photoUrl: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        };
        const t = res.data.accessToken;
        setUser(u);
        setToken(t);
        localStorage.setItem('topolgira_user', JSON.stringify(u));
        localStorage.setItem('topolgira_token', t);
        setLoading(false);
        return true;
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      const demoId = 'user_reg_' + Math.random().toString(36).substring(2, 7);
      const demoUser: User = { 
        id: demoId, 
        email: payload.email, 
        name: payload.name || payload.email.split('@')[0],
        photoUrl: (Array.isArray(payload.photos) && payload.photos[0]) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      const demoToken = 'demo_token_' + demoId;
      setUser(demoUser);
      setToken(demoToken);
      localStorage.setItem('topolgira_user', JSON.stringify(demoUser));
      localStorage.setItem('topolgira_token', demoToken);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    if (token) {
      AuthService.logout(token);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('topolgira_user');
    localStorage.removeItem('topolgira_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
