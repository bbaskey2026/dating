import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

// MATERIAL-UI COMPONENTS
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Fade,
  ThemeProvider,
  createTheme
} from '@mui/material';

// ICONS
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Heart, 
  Zap, 
  ShieldCheck, 
  KeyRound
} from 'lucide-react';

// CUSTOM MUI THEME MATCHING TOPOLGIRA AESTHETICS (GEIST FONT)
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
          padding: '13px 28px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error: authError } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // FORMIK & YUP INITIALIZATION
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Please enter a valid email address').required('Email address is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      setSuccessMsg('');
      const ok = await login(values.email, values.password);
      if (ok) {
        setSuccessMsg('Authentication successful! Launching Dashboard...');
        setTimeout(() => navigate('/dashboard'), 800);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="split-onboarding-screen">
        <div className="split-onboarding-container">
          
          {/* LEFT PANE: LOGIN FORM (FORMIK + YUP + MATERIAL UI) */}
          <form className="split-form-pane" onSubmit={formik.handleSubmit}>
            
            {/* BRAND HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} fill="#ffffff" color="#ffffff" />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px' }}>
                  Topolgira
                </span>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', background: '#dcfce7', padding: '4px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> 256-Bit SSL Secured
              </div>
            </div>

            {/* FORM BODY */}
            <div className="step-fixed-body" style={{ gap: '20px' }}>
              <div className="onboarding-header">
                <span className="onboarding-step-counter">Sign In • Topolgira Account</span>
                <h2 className="onboarding-title">Welcome back to your feed.</h2>
                <p className="onboarding-subtitle">Log in to view high-affinity matches, active chats, and your live discovery deck.</p>
              </div>

              {/* TEXTFIELDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="name@topolgira.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={loading}
                  autoFocus
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

              {/* FEEDBACK ALERTS */}
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
            </div>

            {/* ACTION FOOTER */}
            <div className="onboarding-footer">
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Don't have an account?{' '}
                <span 
                  style={{ color: '#0f172a', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => !loading && navigate('/register')}
                >
                  Create account
                </span>
              </div>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <KeyRound size={16} />}
                endIcon={!loading ? <ArrowRight size={16} /> : undefined}
                sx={{ backgroundColor: '#ff4458', minWidth: '150px' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>

          </form>

          {/* RIGHT PANE: EDITORIAL VISUAL HERO SHOWCASE */}
          <div className="split-image-pane">
            <img 
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80" 
              alt="Editorial Atmosphere" 
              className="split-image-bg"
            />
            <div className="split-image-overlay" />

            {/* Top Pill */}
            <div className="split-image-top-pill">
              <Heart size={14} style={{ color: '#ff4458' }} />
              Spark Authentic Chemistry
            </div>

            {/* Bottom Card */}
            <div className="split-image-bottom-card">
              <p className="split-image-quote">
                “Every meaningful story on Topolgira begins with a single authentic conversation.”
              </p>
              <div className="split-image-author">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                  alt="Topolgira Community" 
                  className="split-image-author-avatar"
                />
                <div>
                  <strong style={{ color: '#ffffff' }}>Topolgira Community</strong>
                  <span style={{ margin: '0 6px', opacity: 0.6 }}>•</span>
                  <span>Curated Verified Matches</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ThemeProvider>
  );
};

export default LoginPage;
