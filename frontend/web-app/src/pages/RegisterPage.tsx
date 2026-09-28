import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import type { RegisterPayload } from '../services/api';

// MATERIAL-UI COMPONENTS
import {
  TextField,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Fade,
  LinearProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';

// ICONS
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff, 
  Plus, 
  Sparkles, 
  Camera, 
  Heart, 
  Coffee, 
  Music, 
  ShieldCheck,
  Lock
} from 'lucide-react';

// CUSTOM MUI THEME MATCHING TOPOLGIRA AESTHETICS
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0f172a',
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4458',
      light: '#ff6b7d',
      dark: '#e0283e',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#10b981',
    },
  },
  typography: {
    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f8fafc',
            borderRadius: 14,
            transition: 'all 0.2s ease',
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#0f172a',
                borderWidth: 1.5,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b',
            '&.Mui-focused': {
              color: '#0f172a',
              fontWeight: 700,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          padding: '12px 28px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});

const CATEGORIZED_PASSIONS: Record<string, string[]> = {
  'Trending': ['Coffee Runs', 'Live Music', 'Deep Talks', 'Bouldering', 'Indie Films', 'Street Photography', 'Road Trips', 'Thrifting'],
  'Activities': ['Trekking', 'Guitar', 'Cycling', 'Cooking', 'Yoga', 'Badminton', 'Board Games', 'Baking', 'Camping'],
  'Vibes': ['Night Owl', 'Art Galleries', 'Vinyl Records', 'Sci-Fi', 'Podcasts', 'Astrology', 'Plant Parent', 'Concerts'],
  'Cuisines': ['Spicy Street Food', 'Specialty Coffee', 'Authentic Biryani', 'Ramen', 'Neapolitan Pizza', 'Matcha', 'Vegan Bites'],
};

const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
];

const STEP_VISUALS = [
  {
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    tag: 'Authentic Connections',
    icon: Heart,
    quote: '“Real connections begin when you show up as your authentic self.”',
    author: 'Maya & Rohan',
    city: 'Ranchi',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    tag: 'Shared Intentions',
    icon: Coffee,
    quote: '“Knowing what you want is the greatest dating superpower.”',
    author: 'Sunil & Ananya',
    city: 'Jamshedpur',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
    tag: 'Electric Chemistry',
    icon: Music,
    quote: '“Find someone whose passions make everyday conversations exciting.”',
    author: 'Priya & Deep',
    city: 'Kolkata',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    tag: 'Your Verified Identity',
    icon: Sparkles,
    quote: '“Your story in a single frame. Put your best foot forward.”',
    author: 'Topolgira Safety',
    city: 'Verified Profiles',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  },
];

const INTENTIONS = [
  { id: 'marriage', title: 'Marriage & Partnership', desc: 'Looking for a genuine life partner.' },
  { id: 'long_term', title: 'Committed Relationship', desc: 'Seeking something meaningful that grows.' },
  { id: 'casual', title: 'Casual Dating', desc: 'Meeting interesting people & exploring.' },
  { id: 'friendship', title: 'Expanding My Circle', desc: 'Connecting over passions & shared vibes.' },
];

const HINGE_PROMPTS = [
  "My ideal Sunday...",
  "Quickest way to my heart...",
  "A non-negotiable for me...",
];

// YUP STRICT STEP SCHEMAS
const validationSchemaStep1 = Yup.object().shape({
  name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  age: Yup.number().typeError('Age must be a number').min(18, 'Must be at least 18 years old').max(99, 'Enter a valid age').required('Age is required'),
  city: Yup.string().trim().min(2, 'City is required').required('City is required'),
  gender: Yup.string().required('Please select your gender'),
  email: Yup.string().email('Please enter a valid email address').required('Email address is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const validationSchemaStep2 = Yup.object().shape({
  relationshipGoal: Yup.string().required('Please select your dating intention'),
  profession: Yup.string().trim().required('Profession is required'),
  education: Yup.string().trim().required('Education is required'),
  bio: Yup.string().trim().min(10, 'Bio must be at least 10 characters').max(250, 'Bio cannot exceed 250 characters').required('Bio is required'),
});

const validationSchemaStep3 = Yup.object().shape({
  interests: Yup.array().of(Yup.string()).min(3, 'Please select at least 3 passions'),
});

const validationSchemaStep4 = Yup.object().shape({
  photos: Yup.array().of(Yup.string()).min(1, 'Please select or provide at least one photo'),
});

interface RegisterPageProps {
  onCandidateAdded: (newCandidate: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onCandidateAdded }) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const { register, loading, error: authError } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [customPhoto, setCustomPhoto] = useState('');
  const navigate = useNavigate();

  // FORMIK INITIALIZATION WITH RIGID INTEGRITY
  const formik = useFormik<RegisterPayload>({
    initialValues: {
      email: '',
      password: '',
      phoneNumber: '+91 99999 88888',
      name: '',
      age: 24,
      gender: 'female',
      city: 'Ranchi',
      education: 'Bachelor of Technology',
      profession: 'Software Engineer',
      relationshipGoal: 'long_term',
      bio: 'Looking for thoughtful conversations over coffee, mountain trails, and good music.',
      interests: ['Coffee Runs', 'Deep Talks', 'Live Music', 'Street Photography'],
      languages: ['Hindi', 'English', 'Santhali'],
      hobbies: ['Trekking', 'Guitar'],
      foodPreferences: ['Specialty Coffee', 'Spicy Street Food'],
      musicInterests: ['Indie Films', 'Vinyl Records'],
      photos: [PHOTO_PRESETS[0]],
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Full name is required'),
      age: Yup.number().typeError('Age must be a number').min(18, 'Must be at least 18 years old').max(99, 'Enter a valid age').required('Age is required'),
      city: Yup.string().trim().min(2, 'City is required').required('City is required'),
      gender: Yup.string().required('Please select your gender'),
      email: Yup.string().email('Please enter a valid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      relationshipGoal: Yup.string().required('Please select your dating intention'),
      profession: Yup.string().trim().required('Profession is required'),
      education: Yup.string().trim().required('Education is required'),
      bio: Yup.string().trim().min(10, 'Bio must be at least 10 characters').max(250, 'Max 250 characters').required('Bio is required'),
      interests: Yup.array().of(Yup.string()).min(3, 'Please select at least 3 passions'),
      photos: Yup.array().of(Yup.string()).min(1, 'Please provide at least 1 photo'),
    }),
    onSubmit: async (values) => {
      setStepError(null);
      setSuccessMsg('');
      const ok = await register(values);
      if (ok) {
        setSuccessMsg('Registration verified & profile launched!');
        onCandidateAdded({
          id: 'user_' + Math.random().toString(36).substring(2, 8),
          name: values.name || 'Topolgira User',
          age: values.age,
          gender: values.gender,
          city: values.city,
          profession: values.profession || 'Professional',
          education: values.education,
          relationshipGoal: values.relationshipGoal,
          bio: values.bio,
          matchScore: 98,
          interests: values.interests,
          languages: values.languages,
          hobbies: values.hobbies,
          foodPreferences: values.foodPreferences,
          musicInterests: values.musicInterests,
          photos: values.photos.length ? values.photos : [PHOTO_PRESETS[0]],
          isRecentlyRegistered: true,
          verified: true,
        });

        setTimeout(() => navigate('/dashboard'), 1000);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched } = formik;

  // STRICT STEP-GATING (USERS CANNOT BYPASS VALIDATION)
  const handleNextStep = async () => {
    setStepError(null);

    if (step === 1) {
      setFieldTouched('name', true);
      setFieldTouched('age', true);
      setFieldTouched('city', true);
      setFieldTouched('gender', true);
      setFieldTouched('email', true);
      setFieldTouched('password', true);

      try {
        await validationSchemaStep1.validate(values, { abortEarly: false });
        setStep(2);
      } catch (err: any) {
        if (err.inner && err.inner.length > 0) {
          setStepError(err.inner[0].message);
        }
      }
    } else if (step === 2) {
      setFieldTouched('relationshipGoal', true);
      setFieldTouched('profession', true);
      setFieldTouched('education', true);
      setFieldTouched('bio', true);

      try {
        await validationSchemaStep2.validate(values, { abortEarly: false });
        setStep(3);
      } catch (err: any) {
        if (err.inner && err.inner.length > 0) {
          setStepError(err.inner[0].message);
        }
      }
    } else if (step === 3) {
      setFieldTouched('interests', true);
      try {
        await validationSchemaStep3.validate(values, { abortEarly: false });
        setStep(4);
      } catch (err: any) {
        if (err.inner && err.inner.length > 0) {
          setStepError(err.inner[0].message);
        }
      }
    }
  };

  const toggleInterest = (tag: string) => {
    if (loading) return; // Prevent tampering while submitting
    const current = values.interests || [];
    if (current.includes(tag)) {
      setFieldValue('interests', current.filter(t => t !== tag));
    } else {
      setFieldValue('interests', [...current, tag]);
    }
    setFieldTouched('interests', true);
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const tag = customTagInput.trim();
      if (!values.interests.includes(tag)) {
        setFieldValue('interests', [...values.interests, tag]);
      }
      setCustomTagInput('');
    }
  };

  const currentVisual = STEP_VISUALS[step - 1] || STEP_VISUALS[0];
  const VisualIcon = currentVisual.icon;

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="split-onboarding-screen">
        <div className="split-onboarding-container">
          
          {/* LEFT PANE: FORMIK + YUP + MATERIAL UI INTEGRATED FORM */}
          <form className="split-form-pane" onSubmit={formik.handleSubmit}>
            
            {/* STORIES PROGRESS BAR */}
            <div className="stories-progress-track">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className={`stories-segment ${step === s ? 'active' : step > s ? 'filled' : ''}`} 
                />
              ))}
            </div>

            {/* STEP 1: THE BASICS (MATERIAL UI TEXTFIELDS) */}
            {step === 1 && (
              <div className="step-fixed-body" style={{ gap: '14px' }}>
                <div className="onboarding-header">
                  <span className="onboarding-step-counter">Step 1 of 4 • Welcome</span>
                  <h2 className="onboarding-title">First, what's your name?</h2>
                  <p className="onboarding-subtitle">Your basic details help establish your profile identity on Topolgira.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <TextField
                    label="Your Full Name"
                    name="name"
                    placeholder="e.g. Maya Murmu"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                    disabled={loading}
                    autoFocus
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <TextField
                      label="Age"
                      name="age"
                      type="number"
                      value={values.age}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.age && errors.age)}
                      helperText={touched.age && errors.age}
                      disabled={loading}
                      inputProps={{ min: 18, max: 99 }}
                    />
                    <TextField
                      label="Current City"
                      name="city"
                      placeholder="e.g. Ranchi"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.city && errors.city)}
                      helperText={touched.city && errors.city}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="editorial-label" style={{ display: 'block', marginBottom: '8px' }}>
                      I identify as
                    </label>
                    <div className="pill-options-grid">
                      {[
                        { id: 'female', label: 'Woman' },
                        { id: 'male', label: 'Man' },
                        { id: 'non_binary', label: 'Non-binary' },
                      ].map(g => (
                        <div 
                          key={g.id} 
                          className={`pill-option ${values.gender === g.id ? 'selected' : ''}`}
                          onClick={() => !loading && setFieldValue('gender', g.id)}
                        >
                          {g.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="your.email@topolgira.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={loading}
                  />

                  <TextField
                    label="Create Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: INTENTION & STORY (MATERIAL UI INPUTS) */}
            {step === 2 && (
              <div className="step-fixed-body" style={{ gap: '14px' }}>
                <div className="onboarding-header">
                  <span className="onboarding-step-counter">Step 2 of 4 • Your Story</span>
                  <h2 className="onboarding-title">What are your intentions?</h2>
                  <p className="onboarding-subtitle">Clear intentions lead to higher compatibility and authentic connections.</p>
                </div>

                <div className="intention-list">
                  {INTENTIONS.map(goal => (
                    <div 
                      key={goal.id} 
                      className={`intention-card ${values.relationshipGoal === goal.id ? 'selected' : ''}`}
                      onClick={() => !loading && setFieldValue('relationshipGoal', goal.id)}
                    >
                      <div>
                        <div className="intention-title">{goal.title}</div>
                        <div className="intention-desc">{goal.desc}</div>
                      </div>
                      <div className="intention-radio" />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <TextField
                    label="Profession"
                    name="profession"
                    placeholder="e.g. Software Architect"
                    value={values.profession || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.profession && errors.profession)}
                    helperText={touched.profession && errors.profession}
                    disabled={loading}
                  />
                  <TextField
                    label="Education"
                    name="education"
                    placeholder="e.g. B.Tech / MBA"
                    value={values.education || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.education && errors.education)}
                    helperText={touched.education && errors.education}
                    disabled={loading}
                  />
                </div>

                {/* HINGE PROMPT BIO */}
                <div className="prompt-card-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="prompt-card-tag">Profile Bio Prompt</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{(values.bio || '').length}/250</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {HINGE_PROMPTS.map((p, idx) => (
                      <Chip
                        key={idx}
                        label={p}
                        size="small"
                        clickable={!loading}
                        onClick={() => setSelectedPromptIdx(idx)}
                        sx={{
                          fontWeight: selectedPromptIdx === idx ? 700 : 500,
                          backgroundColor: selectedPromptIdx === idx ? '#0f172a' : '#f1f5f9',
                          color: selectedPromptIdx === idx ? '#ffffff' : '#64748b',
                          '&:hover': {
                            backgroundColor: selectedPromptIdx === idx ? '#0f172a' : '#e2e8f0',
                          },
                        }}
                      />
                    ))}
                  </div>

                  <TextField
                    name="bio"
                    multiline
                    rows={2}
                    placeholder="Share a glimpse of your personality and what you value..."
                    value={values.bio || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.bio && errors.bio)}
                    helperText={touched.bio && errors.bio}
                    disabled={loading}
                    inputProps={{ maxLength: 250 }}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: VIBE & PASSIONS (MATERIAL UI CHIPS) */}
            {step === 3 && (
              <div className="step-fixed-body" style={{ gap: '14px' }}>
                <div className="onboarding-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="onboarding-step-counter">Step 3 of 4 • Interests</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: values.interests.length >= 3 ? '#10b981' : '#ff4458' }}>
                      {values.interests.length} selected {values.interests.length >= 3 ? '✓' : '(Min 3)'}
                    </span>
                  </div>
                  <h2 className="onboarding-title">What gives you energy?</h2>
                  <p className="onboarding-subtitle">Choose tags that reflect your true lifestyle, passions, and culture.</p>
                </div>

                {/* Category Selector */}
                <div className="tag-category-bar">
                  {Object.keys(CATEGORIZED_PASSIONS).map(cat => (
                    <Chip
                      key={cat}
                      label={cat}
                      clickable={!loading}
                      onClick={() => setActiveCategory(cat)}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: activeCategory === cat ? '#0f172a' : '#ffffff',
                        color: activeCategory === cat ? '#ffffff' : '#64748b',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  ))}
                </div>

                {/* Passion Chips Mosaic */}
                <div className="vibe-tag-mosaic">
                  {CATEGORIZED_PASSIONS[activeCategory]?.map(tag => {
                    const isSelected = values.interests.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        icon={isSelected ? <Check size={14} color="#ffffff" /> : undefined}
                        clickable={!loading}
                        onClick={() => toggleInterest(tag)}
                        sx={{
                          padding: '18px 6px',
                          borderRadius: 999,
                          fontWeight: isSelected ? 700 : 600,
                          backgroundColor: isSelected ? '#ff4458' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: '1.5px solid',
                          borderColor: isSelected ? '#ff4458' : '#e2e8f0',
                          '&:hover': {
                            backgroundColor: isSelected ? '#e0283e' : '#ffffff',
                          },
                        }}
                      />
                    );
                  })}
                </div>

                {/* Custom Tag input */}
                <div style={{ marginTop: '6px' }}>
                  <TextField
                    label="Add Custom Passion Tag"
                    placeholder="e.g. Santhali Poetry, Pottery (Press Enter)"
                    value={customTagInput}
                    onChange={e => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              if (customTagInput.trim() && !values.interests.includes(customTagInput.trim())) {
                                setFieldValue('interests', [...values.interests, customTagInput.trim()]);
                                setCustomTagInput('');
                              }
                            }}
                            edge="end"
                          >
                            <Plus size={18} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: VISUALS & PORTRAITS */}
            {step === 4 && (
              <div className="step-fixed-body" style={{ gap: '14px' }}>
                <div className="onboarding-header">
                  <span className="onboarding-step-counter">Step 4 of 4 • Photos</span>
                  <h2 className="onboarding-title">Put a face to the name.</h2>
                  <p className="onboarding-subtitle">Select your featured portrait or paste a custom photo URL.</p>
                </div>

                <div className="photo-mosaic-layout">
                  {/* Primary Photo Slot */}
                  <div className="photo-primary-slot">
                    <img 
                      src={values.photos[0] || PHOTO_PRESETS[0]} 
                      alt={values.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PHOTO_PRESETS[0];
                      }}
                    />
                    <div className="photo-badge-main">
                      <Sparkles size={12} style={{ color: '#ff4458' }} />
                      Main Profile Photo
                    </div>
                  </div>

                  {/* Preset Gallery Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>Pick preset avatar:</span>
                    <div className="photo-gallery-grid">
                      {PHOTO_PRESETS.map((url, i) => (
                        <div 
                          key={i} 
                          className={`photo-thumbnail-pick ${values.photos[0] === url ? 'active' : ''}`}
                          onClick={() => {
                            if (!loading) {
                              setFieldValue('photos', [url]);
                              setCustomPhoto('');
                            }
                          }}
                        >
                          <img src={url} alt={`Option ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom URL */}
                <TextField
                  label="Custom Image URL"
                  placeholder="https://images.unsplash.com/..."
                  value={customPhoto || (PHOTO_PRESETS.includes(values.photos[0]) ? '' : values.photos[0])}
                  onChange={e => {
                    setCustomPhoto(e.target.value);
                    if (e.target.value.trim()) {
                      setFieldValue('photos', [e.target.value.trim()]);
                    }
                  }}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Camera size={18} color="#94a3b8" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            )}

            {/* ERROR AND STATUS ALERTS (MUI ALERT) */}
            {stepError && (
              <Fade in={Boolean(stepError)}>
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {stepError}
                </Alert>
              </Fade>
            )}
            {authError && (
              <Fade in={Boolean(authError)}>
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {authError}
                </Alert>
              </Fade>
            )}
            {successMsg && (
              <Fade in={Boolean(successMsg)}>
                <Alert severity="success" sx={{ borderRadius: 3 }}>
                  {successMsg}
                </Alert>
              </Fade>
            )}

            {/* BOTTOM ACTION BAR (MUI BUTTONS) */}
            <div className="onboarding-footer">
              {step > 1 ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setStepError(null);
                    setStep(prev => prev - 1);
                  }}
                  disabled={loading}
                  startIcon={<ArrowLeft size={16} />}
                  sx={{ borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  Back
                </Button>
              ) : (
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Already registered?{' '}
                  <span 
                    style={{ color: '#0f172a', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => !loading && navigate('/login')}
                  >
                    Sign in
                  </span>
                </div>
              )}

              {step < 4 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNextStep}
                  disabled={loading}
                  endIcon={<ArrowRight size={16} />}
                  sx={{ backgroundColor: '#0f172a' }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={16} />}
                  endIcon={!loading ? <ArrowRight size={16} /> : undefined}
                  sx={{ backgroundColor: '#ff4458' }}
                >
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              )}
            </div>

          </form>

          {/* RIGHT PANE: EDITORIAL VISUAL HERO SHOWCASE */}
          <div className="split-image-pane">
            <img 
              src={step === 4 ? (values.photos[0] || currentVisual.image) : currentVisual.image} 
              alt="Editorial atmosphere" 
              className="split-image-bg"
            />
            <div className="split-image-overlay" />

            {/* Top Pill */}
            <div className="split-image-top-pill">
              <VisualIcon size={14} style={{ color: '#ff4458' }} />
              {currentVisual.tag}
            </div>

            {/* Bottom Card */}
            <div className="split-image-bottom-card">
              <p className="split-image-quote">
                {step === 4 && values.name ? `“Ready to connect on Topolgira as ${values.name}, ${values.age}.”` : currentVisual.quote}
              </p>
              <div className="split-image-author">
                <img 
                  src={step === 4 ? (values.photos[0] || currentVisual.authorAvatar) : currentVisual.authorAvatar} 
                  alt={currentVisual.author} 
                  className="split-image-author-avatar"
                />
                <div>
                  <strong style={{ color: '#ffffff' }}>
                    {step === 4 && values.name ? values.name : currentVisual.author}
                  </strong>
                  <span style={{ margin: '0 6px', opacity: 0.6 }}>•</span>
                  <span>{step === 4 && values.city ? values.city : currentVisual.city}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ThemeProvider>
  );
};

export default RegisterPage;
