import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EnterpriseApiClient } from '../services/api';
import { Heart, ThumbsUp, Sparkles, ShieldCheck, Mail, MapPin, Briefcase } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [serviceHealth, setServiceHealth] = useState<{ nodeApi: boolean; goMatching: boolean; goChat: boolean }>({
    nodeApi: true,
    goMatching: true,
    goChat: true,
  });

  useEffect(() => {
    if (token) {
      EnterpriseApiClient.getDashboard(token).then(res => {
        if (res.success) {
          setDashboardData(res.data);
        }
      }).catch(err => {
        console.warn('Dashboard fetch offline', err);
      });
    }

    EnterpriseApiClient.checkServicesHealth().then(health => {
      setServiceHealth(health);
    });
  }, [token]);

  return (
    <div className="step-pane">
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>User Dashboard</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Overview of your profile performance and mutual matches.</p>
      </div>

      {/* 4 HIGH IMPACT METRIC KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#fff1f2', border: '1px solid #ffe4e6', padding: '22px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 20px -5px rgba(244,63,94,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#e11d48', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Mutual Matches</span>
            <Heart size={20} style={{ color: '#e11d48', fill: '#e11d48' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>{dashboardData?.metrics?.matchesCount ?? 3}</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>+1 new this week</div>
        </div>

        <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', padding: '22px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 20px -5px rgba(147,51,234,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9333ea', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Likes Received</span>
            <ThumbsUp size={20} style={{ color: '#9333ea' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>{dashboardData?.metrics?.likesReceivedCount ?? 12}</div>
          <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: '700' }}>High popularity rating</div>
        </div>

        <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', padding: '22px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 20px -5px rgba(2,132,199,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#0284c7', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Match Rating</span>
            <Sparkles size={20} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>{dashboardData?.metrics?.averageMatchScore ?? 92}%</div>
          <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '700' }}>Compatibility score</div>
        </div>

        <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', padding: '22px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 20px -5px rgba(16,185,129,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#059669', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Profile Health</span>
            <ShieldCheck size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>{dashboardData?.metrics?.profileCompleteness ?? 100}%</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Profile complete</div>
        </div>
      </div>

      {/* USER PROFILE CARD OVERVIEW */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.06)' }}>
        <img src={'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'} alt="Avatar" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ec4899', boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)' }} />
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{user?.name || user?.email || 'Candidate Profile'}</h3>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', display: 'flex', gap: '18px', alignItems: 'center', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} style={{ color: '#ec4899' }} /> {user?.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} style={{ color: '#10b981' }} /> Ranchi</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} style={{ color: '#0284c7' }} /> Software Engineer</span>
          </div>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: '12px', lineHeight: '1.5' }}>"Passionate about polyglot software architecture, travel, and music."</p>
        </div>
      </div>

      {/* BACKEND MICROSERVICES LIVE STATUS PANEL */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10b981" /> Live Backend Microservices Integration Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '14px 18px', background: serviceHealth.nodeApi ? '#ecfdf5' : '#fef2f2', border: serviceHealth.nodeApi ? '1px solid #a7f3d0' : '1px solid #fecaca', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Node.js API Gateway</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>http://localhost:4000</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: serviceHealth.nodeApi ? '#059669' : '#dc2626', background: '#ffffff', padding: '4px 10px', borderRadius: '12px' }}>
              {serviceHealth.nodeApi ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>

          <div style={{ padding: '14px 18px', background: serviceHealth.goChat ? '#ecfdf5' : '#fef2f2', border: serviceHealth.goChat ? '1px solid #a7f3d0' : '1px solid #fecaca', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Go Realtime Chat Gateway</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>ws://localhost:9000/ws</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: serviceHealth.goChat ? '#059669' : '#dc2626', background: '#ffffff', padding: '4px 10px', borderRadius: '12px' }}>
              {serviceHealth.goChat ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>

          <div style={{ padding: '14px 18px', background: serviceHealth.goMatching ? '#ecfdf5' : '#fef2f2', border: serviceHealth.goMatching ? '1px solid #a7f3d0' : '1px solid #fecaca', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Go Matching Engine</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>http://localhost:8080</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: serviceHealth.goMatching ? '#059669' : '#dc2626', background: '#ffffff', padding: '4px 10px', borderRadius: '12px' }}>
              {serviceHealth.goMatching ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
