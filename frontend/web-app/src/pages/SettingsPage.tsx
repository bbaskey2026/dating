import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Check, 
  MapPin, 
  Target, 
  Lock, 
  Bell, 
  RotateCcw,
  Save,
  User,
  LogOut
} from 'lucide-react';

interface PreferencesState {
  showMe: 'men' | 'women' | 'everyone';
  distanceKm: number;
  minAge: number;
  maxAge: number;
  location: string;
  incognito: boolean;
  pushNotifications: boolean;
}

const INITIAL_PREFERENCES: PreferencesState = {
  showMe: 'women',
  distanceKm: 50,
  minAge: 20,
  maxAge: 35,
  location: 'San Francisco, CA',
  incognito: true,
  pushNotifications: true,
};

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Saved state (for discard support)
  const [savedPrefs, setSavedPrefs] = useState<PreferencesState>(() => {
    try {
      const saved = localStorage.getItem('topolgira_user_prefs');
      return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
    } catch {
      return INITIAL_PREFERENCES;
    }
  });

  // Current active form state
  const [prefs, setPrefs] = useState<PreferencesState>(savedPrefs);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [tempLocation, setTempLocation] = useState<string>(prefs.location);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Save changes handler
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavedPrefs(prefs);
    try {
      localStorage.setItem('topolgira_user_prefs', JSON.stringify(prefs));
    } catch {}
    setStatusFeedback({ type: 'success', message: 'Preferences saved successfully!' });
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Discard changes handler
  const handleDiscard = () => {
    setPrefs(savedPrefs);
    setTempLocation(savedPrefs.location);
    setIsEditingLocation(false);
    setStatusFeedback({ type: 'info', message: 'Changes discarded.' });
    setTimeout(() => setStatusFeedback(null), 2500);
  };

  // Age slider handler ensuring minAge <= maxAge
  const handleMinAgeChange = (val: number) => {
    if (val <= prefs.maxAge) {
      setPrefs(p => ({ ...p, minAge: val }));
    }
  };

  const handleMaxAgeChange = (val: number) => {
    if (val >= prefs.minAge) {
      setPrefs(p => ({ ...p, maxAge: val }));
    }
  };

  // Location change handler
  const handleSaveLocation = () => {
    if (tempLocation.trim()) {
      setPrefs(p => ({ ...p, location: tempLocation.trim() }));
    }
    setIsEditingLocation(false);
  };

  // Check if form has unsaved modifications
  const hasChanges = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  return (
    <div className="pref-page-container">
      {/* TOP HEADER BAR */}
      <div className="pref-header-bar">
        <div>
          <h1 className="pref-title">Preferences</h1>
          <p className="pref-subtitle">
            Fine-tune who you see, how you're discovered, and your account privacy.
          </p>
        </div>

        <div className="pref-header-actions">
          {statusFeedback && (
            <div 
              style={{ 
                background: statusFeedback.type === 'success' ? '#dcfce7' : '#f1f5f9', 
                color: statusFeedback.type === 'success' ? '#16a34a' : '#475569', 
                padding: '8px 16px', 
                borderRadius: '20px', 
                fontSize: '12.5px', 
                fontWeight: '800', 
                border: `1px solid ${statusFeedback.type === 'success' ? '#bbf7d0' : '#e2e8f0'}`,
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              {statusFeedback.type === 'success' ? <Check size={14} /> : <RotateCcw size={14} />}
              {statusFeedback.message}
            </div>
          )}

          <button 
            type="button" 
            className="pref-btn-discard" 
            onClick={handleDiscard}
            disabled={!hasChanges}
            style={{ opacity: hasChanges ? 1 : 0.6, cursor: hasChanges ? 'pointer' : 'default' }}
          >
            Discard
          </button>

          <button 
            type="button" 
            className="pref-btn-save" 
            onClick={() => handleSave()}
          >
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>

      {/* HORIZONTAL DIVIDER */}
      <div className="pref-divider" />

      {/* 2-COLUMN MAIN CONTENT GRID */}
      <div className="pref-columns-grid">
        
        {/* LEFT COLUMN: 🎯 DISCOVERY CRITERIA */}
        <div className="pref-column">
          <div>
            <div className="pref-section-heading">
              <Target size={16} color="#ec4899" /> Discovery Criteria
            </div>

            <div className="pref-card">
              {/* SHOW ME (RADIO PILLS) */}
              <div className="pref-group">
                <div className="pref-label-row">
                  <span className="pref-label">Show Me</span>
                </div>

                <div className="pref-radio-group">
                  <div 
                    className={`pref-radio-item ${prefs.showMe === 'men' ? 'active' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, showMe: 'men' }))}
                  >
                    <div className="pref-radio-dot">
                      {prefs.showMe === 'men' && <div className="pref-radio-dot-inner" />}
                    </div>
                    <span>Men</span>
                  </div>

                  <div 
                    className={`pref-radio-item ${prefs.showMe === 'women' ? 'active' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, showMe: 'women' }))}
                  >
                    <div className="pref-radio-dot">
                      {prefs.showMe === 'women' && <div className="pref-radio-dot-inner" />}
                    </div>
                    <span>Women</span>
                  </div>

                  <div 
                    className={`pref-radio-item ${prefs.showMe === 'everyone' ? 'active' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, showMe: 'everyone' }))}
                  >
                    <div className="pref-radio-dot">
                      {prefs.showMe === 'everyone' && <div className="pref-radio-dot-inner" />}
                    </div>
                    <span>Everyone</span>
                  </div>
                </div>
              </div>

              {/* DISTANCE RADIUS */}
              <div className="pref-group">
                <div className="pref-label-row">
                  <span className="pref-label">Distance Radius</span>
                  <span className="pref-badge">Up to {prefs.distanceKm} km</span>
                </div>

                <input 
                  type="range" 
                  min="5" 
                  max="150" 
                  value={prefs.distanceKm} 
                  onChange={e => setPrefs(p => ({ ...p, distanceKm: parseInt(e.target.value) }))}
                  className="pref-range-slider"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((prefs.distanceKm - 5) / 145) * 100}%, #e2e8f0 ${((prefs.distanceKm - 5) / 145) * 100}%, #e2e8f0 100%)`
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8', fontWeight: '700' }}>
                  <span>5 km</span>
                  <span>75 km</span>
                  <span>150 km</span>
                </div>
              </div>

              {/* AGE PREFERENCE */}
              <div className="pref-group">
                <div className="pref-label-row">
                  <span className="pref-label">Age Preference</span>
                  <span className="pref-badge">{prefs.minAge} - {prefs.maxAge}</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Min Age ({prefs.minAge})</div>
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={prefs.minAge} 
                      onChange={e => handleMinAgeChange(parseInt(e.target.value))}
                      className="pref-range-slider"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((prefs.minAge - 18) / 42) * 100}%, #e2e8f0 ${((prefs.minAge - 18) / 42) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Max Age ({prefs.maxAge})</div>
                    <input 
                      type="range" 
                      min="18" 
                      max="75" 
                      value={prefs.maxAge} 
                      onChange={e => handleMaxAgeChange(parseInt(e.target.value))}
                      className="pref-range-slider"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((prefs.maxAge - 18) / 57) * 100}%, #e2e8f0 ${((prefs.maxAge - 18) / 57) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* LOCATION MODE */}
              <div className="pref-group">
                <div className="pref-label-row">
                  <span className="pref-label">Location Mode</span>
                </div>

                {isEditingLocation ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={tempLocation} 
                      onChange={e => setTempLocation(e.target.value)}
                      placeholder="Enter city (e.g. San Francisco, CA)"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSaveLocation()}
                      style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px' }}
                    />
                    <button 
                      type="button" 
                      className="btn-primary" 
                      style={{ padding: '10px 16px', fontSize: '12.5px', borderRadius: '12px', flexShrink: 0 }}
                      onClick={handleSaveLocation}
                    >
                      Update
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '10px 14px', fontSize: '12.5px', borderRadius: '12px', flexShrink: 0 }}
                      onClick={() => setIsEditingLocation(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="pref-location-box">
                    <div className="pref-location-info">
                      <MapPin size={16} color="#ec4899" />
                      <span>Current Location: <strong style={{ color: '#0f172a' }}>{prefs.location}</strong></span>
                    </div>
                    <button 
                      type="button" 
                      className="pref-location-change-btn"
                      onClick={() => {
                        setTempLocation(prefs.location);
                        setIsEditingLocation(true);
                      }}
                    >
                      (Change)
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 👤 YOUR PROFILE + 🔒 PRIVACY & CONTROLS + 🔔 NOTIFICATIONS */}
        <div className="pref-column">
          
          {/* 👤 YOUR PROFILE */}
          <div>
            <div className="pref-section-heading">
              <User size={16} color="#ec4899" /> Your Profile
            </div>

            <div className="pref-card" style={{ gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img 
                    src={user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                    alt={user?.name || 'User Profile'} 
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      border: '2.5px solid #ec4899',
                      boxShadow: '0 4px 14px rgba(236, 72, 153, 0.25)' 
                    }} 
                  />
                  <span 
                    className="online-indicator-dot" 
                    style={{ 
                      position: 'absolute', 
                      bottom: '2px', 
                      right: '2px', 
                      width: '12px', 
                      height: '12px', 
                      border: '2px solid #ffffff',
                      background: '#10b981'
                    }} 
                  />
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {user?.name || user?.email?.split('@')[0] || 'Bhima Baskey'}
                    </h3>
                    <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </div>

              {/* LOGOUT BUTTON */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #fee2e2',
                  background: '#fff1f2',
                  color: '#e11d48',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '4px'
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#ffe4e6')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff1f2')}
              >
                <LogOut size={15} /> Log Out Account
              </button>
            </div>
          </div>

          {/* 🔒 PRIVACY & CONTROLS */}
          <div>
            <div className="pref-section-heading">
              <Lock size={16} color="#8b5cf6" /> Privacy & Controls
            </div>

            <div className="pref-card">
              <div className="pref-toggle-container">
                <div className="pref-toggle-details">
                  <div className="pref-toggle-title">Incognito Mode</div>
                  <div className="pref-toggle-description">
                    Only candidates you liked can see you.
                  </div>
                </div>

                <div className="pref-switch-box">
                  <label className="pref-switch">
                    <input 
                      type="checkbox" 
                      checked={prefs.incognito} 
                      onChange={e => setPrefs(p => ({ ...p, incognito: e.target.checked }))} 
                    />
                    <span className="pref-switch-track"></span>
                  </label>
                  <span className={`pref-switch-state-tag ${prefs.incognito ? 'on' : 'off'}`}>
                    {prefs.incognito ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 🔔 NOTIFICATIONS */}
          <div>
            <div className="pref-section-heading">
              <Bell size={16} color="#f59e0b" /> Notifications
            </div>

            <div className="pref-card">
              <div className="pref-toggle-container">
                <div className="pref-toggle-details">
                  <div className="pref-toggle-title">Match & Message Push</div>
                  <div className="pref-toggle-description">
                    Get instant alerts for activity.
                  </div>
                </div>

                <div className="pref-switch-box">
                  <label className="pref-switch">
                    <input 
                      type="checkbox" 
                      checked={prefs.pushNotifications} 
                      onChange={e => setPrefs(p => ({ ...p, pushNotifications: e.target.checked }))} 
                    />
                    <span className="pref-switch-track"></span>
                  </label>
                  <span className={`pref-switch-state-tag ${prefs.pushNotifications ? 'on' : 'off'}`}>
                    {prefs.pushNotifications ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default SettingsPage;
