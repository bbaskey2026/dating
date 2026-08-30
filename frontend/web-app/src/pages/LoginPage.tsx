import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Zap, Heart } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('bhima@topolgira.com');
  const [password, setPassword] = useState('user123');
  const { login, loading, error } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    const ok = await login(email, password);
    if (ok) {
      setSuccessMsg('Authentication successful! Opening Dashboard...');
      setTimeout(() => navigate('/dashboard'), 800);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: 'auto', width: '100%', padding: '20px' }}>
      <div style={{ background: '#ffffff', padding: '40px 36px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -15px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 8px 24px rgba(236,72,153,0.3)' }}>
            <Zap size={26} style={{ color: '#ffffff', fill: '#ffffff' }} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            Welcome to Topolgira <Heart size={20} fill="#ec4899" color="#ec4899" />
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Sign in to make the first move and chat with candidates.</p>
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px 16px', borderRadius: '14px', marginBottom: '18px' }}>{error}</div>}
        {successMsg && <div style={{ color: '#16a34a', fontSize: '13px', fontWeight: '600', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '14px', marginBottom: '18px' }}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
              <Mail size={14} style={{ color: '#ec4899' }} /> Email Address
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your.email@example.com" />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
              <Lock size={14} style={{ color: '#ec4899' }} /> Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
            {loading ? 'Signing In...' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b', marginTop: '24px' }}>
          Don't have an account?{' '}
          <span style={{ color: '#ec4899', cursor: 'pointer', fontWeight: '800' }} onClick={() => navigate('/register')}>
            Register here
          </span>
        </div>
      </div>
    </div>
  );
};
