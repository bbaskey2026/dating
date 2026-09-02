import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Flame, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Heart,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HeaderBarProps {
  candidatesCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ candidatesCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount, wsConnected } = useNotifications();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <aside className={`left-sidebar-nav ${isCollapsed ? 'collapsed' : ''}`}>
      {/* TOGGLE OPEN/CLOSE BUTTON */}
      <button 
        className="sidebar-toggle-btn" 
        onClick={toggleSidebar}
        title={isCollapsed ? "Open Sidebar" : "Close Sidebar"}
        aria-label={isCollapsed ? "Open Sidebar" : "Close Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* BRAND LOGO TOP */}
      <div className="sidebar-brand-box" onClick={() => navigate('/')}>
        <div className="brand-icon">
          <Zap style={{ fill: '#ffffff', color: '#ffffff' }} size={22} />
        </div>
        {!isCollapsed && (
          <div className="brand-text-box">
            <span className="brand-title">Topolgira</span>
            <small className="brand-subtitle">
              Dating App <Heart size={11} fill="#ec4899" color="#ec4899" />
            </small>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="sidebar-sla-tag" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={13} /> SLA 99.99%
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: wsConnected ? '#10b981' : '#f59e0b', fontWeight: '800' }}>
            <span className="online-indicator-dot" style={{ width: '6px', height: '6px', background: wsConnected ? '#10b981' : '#f59e0b' }}></span>
            {wsConnected ? 'LIVE' : 'SYNC'}
          </span>
        </div>
      )}

      {/* VERTICAL NAVIGATION LIST */}
      <nav className="sidebar-nav-list">
        {!isCollapsed && <div className="sidebar-section-label">NAVIGATION</div>}
        
        <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Home" end>
          <Home size={20} />
          {!isCollapsed && <span>Home</span>}
        </NavLink>

        {user ? (
          <>
            <NavLink to="/swipe" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Swipe Deck">
              <Flame size={20} />
              {!isCollapsed && <span>Swipe Deck</span>}
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Dashboard">
              <LayoutDashboard size={20} />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/catalog" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title={`Candidates (${candidatesCount})`}>
              <Users size={20} />
              {!isCollapsed && <span>Candidates ({candidatesCount})</span>}
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Live Chat">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MessageSquare size={20} />
                {unreadCount > 0 && isCollapsed && (
                  <span className="sidebar-badge-dot-compact"></span>
                )}
              </div>
              {!isCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Live Chat</span>
                  {unreadCount > 0 && (
                    <span className="sidebar-unread-pill">{unreadCount}</span>
                  )}
                </div>
              )}
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Settings">
              <Settings size={20} />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
            <NavLink to="/showcase" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="All Views">
              <Layers size={20} />
              {!isCollapsed && <span>All Views</span>}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Login">
              <LogIn size={20} />
              {!isCollapsed && <span>Login</span>}
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Register">
              <UserPlus size={20} />
              {!isCollapsed && <span>Register</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* BOTTOM USER PROFILE CARD */}
      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-user-card">
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name || user.email}</span>
                <span className="sidebar-user-status">
                  <span className="online-indicator-dot"></span> Online
                </span>
              </div>
            )}
            <button className="btn-logout-pill" onClick={logout} title="Sign Out">
              <LogOut size={16} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => navigate('/login')} title="Sign In">
              <LogIn size={16} />
              {!isCollapsed && <span>Sign In</span>}
            </button>
            <button className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => navigate('/register')} title="Register">
              <UserPlus size={16} />
              {!isCollapsed && <span>Register</span>}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
