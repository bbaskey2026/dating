import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, LogIn, UserPlus } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, featureName = 'Feature' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="step-pane" style={{ maxWidth: '480px', margin: 'auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', border: '1px solid rgba(244,63,94,0.3)' }}>
          <Lock size={30} style={{ color: '#f43f5e' }} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc' }}>Please Sign In</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>
          Sign in or create an account to access <strong style={{ color: '#f43f5e' }}>{featureName}</strong> and chat with candidates.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/login')}>
            <LogIn size={16} /> Sign In
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/register')}>
            <UserPlus size={16} /> Register
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
