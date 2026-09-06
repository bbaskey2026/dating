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
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
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
              Meaningful Connections <Heart size={11} fill="#ec4899" color="#ec4899" />
            </small>
          </div>
        )}
      </div>

      {/* VERTICAL NAVIGATION LIST */}
      <nav className="sidebar-nav-list">

        <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Home" end>
          <Home size={20} />
          {!isCollapsed && <span>Home</span>}
        </NavLink>

        {user ? (
          <>
            <NavLink to="/swipe" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Discover">
              <Flame size={20} />
              {!isCollapsed && <span>Discover</span>}
            </NavLink>
            <NavLink to="/catalog" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title={`Explore (${candidatesCount})`}>
              <Users size={20} />
              {!isCollapsed && <span>Explore ({candidatesCount})</span>}
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Messages">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MessageSquare size={20} />
                {unreadCount > 0 && isCollapsed && (
                  <span className="sidebar-badge-dot-compact"></span>
                )}
              </div>
              {!isCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="sidebar-unread-pill">{unreadCount}</span>
                  )}
                </div>
              )}
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Activity">
              <LayoutDashboard size={20} />
              {!isCollapsed && <span>Activity</span>}
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Preferences">
              <Settings size={20} />
              {!isCollapsed && <span>Preferences</span>}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Sign In">
              <LogIn size={20} />
              {!isCollapsed && <span>Sign In</span>}
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} title="Sign Up">
              <UserPlus size={20} />
              {!isCollapsed && <span>Sign Up</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* BOTTOM USER PROFILE CARD */}
      <div className="sidebar-footer">
        {user ? (
          <div 
            className="sidebar-user-card" 
            onClick={() => navigate('/settings')} 
            title="View Profile & Settings"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', width: '100%' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img 
                  src={user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                  alt={user.name || 'User'} 
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '2px solid #ec4899',
                    boxShadow: '0 2px 8px rgba(236,72,153,0.3)',
                    display: 'block'
                  }} 
                />
                <span 
                  className="online-indicator-dot" 
                  style={{ 
                    position: 'absolute', 
                    bottom: '0', 
                    right: '0', 
                    width: '9px', 
                    height: '9px', 
                    border: '2px solid #ffffff' 
                  }} 
                />
              </div>

              {!isCollapsed && (
                <div className="sidebar-user-info" style={{ flex: 1 }}>
                  <span className="sidebar-user-name" style={{ fontSize: '13.5px', fontWeight: 800 }}>{user.name || user.email}</span>
                  <span className="sidebar-user-status" style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="online-indicator-dot" style={{ width: '6px', height: '6px' }}></span> View Profile
                  </span>
                </div>
              )}
            </div>
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
