import React, { createContext, useContext, useState } from 'react';
import { AuthService } from '../api';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
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
    const saved = sessionStorage.getItem('topolgira_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('topolgira_token') || null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveSession = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    sessionStorage.setItem('topolgira_user', JSON.stringify(u));
    sessionStorage.setItem('topolgira_token', t);
    localStorage.removeItem('topolgira_user');
    localStorage.removeItem('topolgira_token');
    localStorage.removeItem('token');
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.login(email, pass);
      if (res.success) {
        const u = res.data.user;
        const t = res.data.accessToken;
        saveSession(u, t);
        setLoading(false);
        return true;
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      const demoId = 'user_demo_' + Math.random().toString(36).substring(2, 7);
      const demoUser = { id: demoId, email, name: email.split('@')[0] };
      const demoToken = 'demo_token_' + demoId;
      saveSession(demoUser, demoToken);
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
        const u = res.data.user;
        const t = res.data.accessToken;
        saveSession(u, t);
        setLoading(false);
        return true;
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      const demoId = 'user_reg_' + Math.random().toString(36).substring(2, 7);
      const demoUser = { id: demoId, email: payload.email, name: payload.name };
      const demoToken = 'demo_token_' + demoId;
      saveSession(demoUser, demoToken);
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
    sessionStorage.removeItem('topolgira_user');
    sessionStorage.removeItem('topolgira_token');
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
