import React, { useState } from 'react';
import { Settings, Shield, Sliders, Check, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(50);
  const [minAge, setMinAge] = useState<number>(20);
  const [maxAge, setMaxAge] = useState<number>(35);
  const [preferredGender, setPreferredGender] = useState<string>('female');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [incognito, setIncognito] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('Settings saved successfully!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <div className="step-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings style={{ color: '#ec4899' }} /> Profile & Match Preferences
          </h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>Configure your matching filters, security controls, and notifications.</p>
        </div>
        {savedMsg && (
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} /> {savedMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* MATCH FILTERS */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899' }}>
            <Sliders size={18} /> Match Discovery Filters
          </h3>
          <div className="form-grid">
            <div className="form-group full">
              <label>Maximum Distance: <strong style={{ color: '#ec4899' }}>{distanceKm} km</strong></label>
              <input type="range" min="5" max="150" value={distanceKm} onChange={e => setDistanceKm(parseInt(e.target.value))} />
            </div>

            <div className="form-group">
              <label>Min Age Target: <strong style={{ color: '#ec4899' }}>{minAge} years</strong></label>
              <input type="range" min="18" max="50" value={minAge} onChange={e => setMinAge(parseInt(e.target.value))} />
            </div>

            <div className="form-group">
              <label>Max Age Target: <strong style={{ color: '#ec4899' }}>{maxAge} years</strong></label>
              <input type="range" min="20" max="70" value={maxAge} onChange={e => setMaxAge(parseInt(e.target.value))} />
            </div>

            <div className="form-group full">
              <label>Show Profiles</label>
              <select value={preferredGender} onChange={e => setPreferredGender(e.target.value)}>
                <option value="female">Women</option>
                <option value="male">Men</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECURITY & PRIVACY */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
            <Shield size={18} /> Security & Privacy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '14px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>Incognito Mode</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Only show my profile to candidates I have already liked.</div>
              </div>
              <input type="checkbox" checked={incognito} onChange={e => setIncognito(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '14px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>Push Notifications</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Get instant alerts for new mutual matches and live messages.</div>
              </div>
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} /> Save Settings & Update Filters
        </button>
      </form>
    </div>
  );
};
