import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterPayload } from '../services/api';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const INTEREST_OPTIONS = ['Cricket', 'Travel', 'Music', 'Movies', 'Gaming', 'Technology', 'Fitness', 'Art', 'Photography', 'Cooking'];
const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Santhali', 'Bengali', 'Odia', 'Punjabi'];
const HOBBY_OPTIONS = ['Hiking', 'Reading', 'Guitar', 'Dancing', 'Blogging', 'Cycling'];
const FOOD_OPTIONS = ['Spicy', 'Vegetarian', 'Street Food', 'Italian', 'Asian', 'Desserts'];
const MUSIC_OPTIONS = ['Bollywood', 'Rock', 'Pop', 'Indie', 'EDM', 'Classical'];

interface RegisterPageProps {
  onCandidateAdded: (newCandidate: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onCandidateAdded }) => {
  const [onboardStep, setOnboardStep] = useState(1);
  const [form, setForm] = useState<RegisterPayload>({
    email: 'newuser@topolgira.com',
    password: 'password123',
    phoneNumber: '+919999922222',
    name: 'Bhima Baskey',
    age: 25,
    gender: 'male',
    city: 'Ranchi',
    education: 'B.Tech Computer Science',
    profession: 'Software Engineer',
    relationshipGoal: 'marriage',
    bio: 'Passionate about polyglot software architecture, travel, and music.',
    interests: ['Music', 'Travel', 'Cricket'],
    languages: ['Hindi', 'English', 'Santhali'],
    hobbies: ['Hiking', 'Guitar'],
    foodPreferences: ['Spicy', 'Street Food'],
    musicInterests: ['Bollywood', 'Rock'],
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'],
  });

  const { register, loading, error } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const toggleArrayItem = (field: keyof RegisterPayload, item: string) => {
    const current = (form[field] as string[]) || [];
    if (current.includes(item)) {
      setForm({ ...form, [field]: current.filter(x => x !== item) });
    } else {
      setForm({ ...form, [field]: [...current, item] });
    }
  };

  const handleRegisterSubmit = async () => {
    setSuccessMsg('');
    const ok = await register(form);
    if (ok) {
      setSuccessMsg('Registration successful!');
      onCandidateAdded({
        id: 'new_' + Math.random().toString(36).substring(2, 7),
        name: form.name,
        age: form.age,
        gender: form.gender,
        city: form.city,
        profession: form.profession,
        relationshipGoal: form.relationshipGoal,
        bio: form.bio,
        matchScore: 98,
        interests: form.interests,
        photos: form.photos.length ? form.photos : ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'],
        isRecentlyRegistered: true,
      });

      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  return (
    <div className="step-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>Create Your Profile</h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>Set up your profile, photos, and preferences.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ width: '32px', height: '32px', borderRadius: '50%', background: onboardStep === s ? 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)' : '#f1f5f9', color: onboardStep === s ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', border: onboardStep === s ? 'none' : '1px solid #e2e8f0', boxShadow: onboardStep === s ? '0 4px 12px rgba(236,72,153,0.3)' : 'none' }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {onboardStep === 1 && (
        <div className="form-grid">
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div className="form-group"><label>Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Age</label><input type="number" value={form.age} onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 18 })} /></div>
          <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div className="form-group"><label>City</label><input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        </div>
      )}

      {onboardStep === 2 && (
        <div className="form-grid">
          <div className="form-group"><label>Education</label><input type="text" value={form.education || ''} onChange={e => setForm({ ...form, education: e.target.value })} /></div>
          <div className="form-group"><label>Profession</label><input type="text" value={form.profession || ''} onChange={e => setForm({ ...form, profession: e.target.value })} /></div>
          <div className="form-group full"><label>Bio</label><textarea rows={3} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
        </div>
      )}

      {onboardStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Interests</label>
            <div className="chip-group">
              {INTEREST_OPTIONS.map(item => (
                <div key={item} className={`chip ${form.interests.includes(item) ? 'selected' : ''}`} onClick={() => toggleArrayItem('interests', item)}>{item}</div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Languages</label>
            <div className="chip-group">
              {LANGUAGE_OPTIONS.map(item => (
                <div key={item} className={`chip ${form.languages.includes(item) ? 'selected' : ''}`} onClick={() => toggleArrayItem('languages', item)}>{item}</div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Hobbies</label>
            <div className="chip-group">
              {HOBBY_OPTIONS.map(item => (
                <div key={item} className={`chip ${form.hobbies.includes(item) ? 'selected' : ''}`} onClick={() => toggleArrayItem('hobbies', item)}>{item}</div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Food Preferences</label>
            <div className="chip-group">
              {FOOD_OPTIONS.map(item => (
                <div key={item} className={`chip ${form.foodPreferences.includes(item) ? 'selected' : ''}`} onClick={() => toggleArrayItem('foodPreferences', item)}>{item}</div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Music Interests</label>
            <div className="chip-group">
              {MUSIC_OPTIONS.map(item => (
                <div key={item} className={`chip ${form.musicInterests.includes(item) ? 'selected' : ''}`} onClick={() => toggleArrayItem('musicInterests', item)}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {onboardStep === 4 && (
        <div className="form-group">
          <label>Photo URL</label>
          <input type="text" value={form.photos[0] || ''} onChange={e => setForm({ ...form, photos: [e.target.value] })} />
          {form.photos[0] && <img src={form.photos[0]} alt="Preview" style={{ width: '160px', height: '180px', objectFit: 'cover', borderRadius: '14px', marginTop: '12px' }} />}
        </div>
      )}

      {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginTop: '8px' }}>{error}</div>}
      {successMsg && <div style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', marginTop: '8px' }}>{successMsg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        {onboardStep > 1 ? (
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setOnboardStep(prev => prev - 1)}>
            <ArrowLeft size={14} /> Back
          </button>
        ) : <div />}
        {onboardStep < 4 ? (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setOnboardStep(prev => prev + 1)}>
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleRegisterSubmit} disabled={loading}>
            {loading ? 'Registering...' : <><CheckCircle2 size={14} /> Complete Profile</>}
          </button>
        )}
      </div>
    </div>
  );
};
