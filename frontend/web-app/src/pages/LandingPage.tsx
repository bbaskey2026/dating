import './LandingPage.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Brain,
  Smile,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Flame,
  Play,
  ChevronRight,
  MapPin,
  Users,
  MessageCircleHeart,
  Crown,
  Verified,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Check,
  Globe,
  Lock,
  Eye,
  Coffee,
  Camera,
  Music,
  Compass,
  Send,
  MousePointerClick
} from 'lucide-react';
import type { Candidate } from '../api';

interface LandingPageProps {
  candidates?: Candidate[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ candidates: _candidates = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ members: 0, matches: 0, dates: 0, accuracy: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [heroCardIndex, setHeroCardIndex] = useState(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [particlePositions] = useState(() =>
    Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
    }))
  );

  const heroProfiles = [
    {
      name: 'Sneha', age: 24, location: '2 km away', role: 'Designer',
      img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      interests: ['Art', 'Travel', 'Coffee'], match: 96,
    },
    {
      name: 'Priya', age: 26, location: '5 km away', role: 'Developer',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      interests: ['Music', 'Hiking', 'Books'], match: 92,
    },
    {
      name: 'Ananya', age: 23, location: '3 km away', role: 'Photographer',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      interests: ['Photography', 'Yoga', 'Food'], match: 94,
    },
  ];

  const typingPhrases = ['Perfect Match', 'Real Love', 'True Connection', 'Soulmate'];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const phrase = typingPhrases[phraseIndex];
    let charIndex = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;
    const type = () => {
      if (!isDeleting) {
        setTypedText(phrase.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === phrase.length) { timeout = setTimeout(() => { isDeleting = true; type(); }, 2000); return; }
        timeout = setTimeout(type, 80);
      } else {
        setTypedText(phrase.substring(0, charIndex));
        charIndex--;
        if (charIndex === 0) { isDeleting = false; setPhraseIndex((prev) => (prev + 1) % typingPhrases.length); return; }
        timeout = setTimeout(type, 40);
      }
    };
    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, [phraseIndex]);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-section');
        if (id) {
          setVisibleSections((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) next.add(id);
            return next;
          });
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsVisible) setStatsVisible(true);
    }, { threshold: 0.5 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsVisible]);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 2500; const steps = 80;
    const targets = { members: 10847, matches: 8420, dates: 5230, accuracy: 96 };
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 4);
      setCounters({ members: Math.round(targets.members * ease), matches: Math.round(targets.matches * ease), dates: Math.round(targets.dates * ease), accuracy: Math.round(targets.accuracy * ease) });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [statsVisible]);

  useEffect(() => {
    const interval = setInterval(() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHeroCardIndex((prev) => (prev + 1) % heroProfiles.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCtaClick = () => { if (user) navigate('/swipe'); else navigate('/register'); };

  const handleLikeAnimation = () => {
    setIsLikeAnimating(true);
    setTimeout(() => { setIsLikeAnimating(false); setHeroCardIndex((prev) => (prev + 1) % heroProfiles.length); }, 800);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) { setEmailSubmitted(true); setTimeout(() => navigate('/register'), 1500); }
  };

  const testimonials = [
    { text: "After 2 years of mindless swiping, I tried Topolgira. Matched with Priya within 3 days — we're planning our wedding now!", name: 'Rahul Soren', location: 'Ranchi', time: '8 months ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', rating: 5, couple: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=200&q=80' },
    { text: "The AI match score was surprisingly accurate! We had so much in common from day one. Deleted all other dating apps immediately.", name: 'Ananya Sharma', location: 'Jamshedpur', time: '1 year ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', rating: 5, couple: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=200&q=80' },
    { text: "I was skeptical about dating apps, but Topolgira felt different. Real people, real conversations, and I found my person in 2 weeks.", name: 'Vikram Patel', location: 'Mumbai', time: '5 months ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', rating: 5, couple: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=200&q=80' },
    { text: "Best dating platform ever! The zero ghosting feature actually works. Everyone is so respectful and genuine here.", name: 'Meera Joshi', location: 'Delhi', time: '3 months ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', rating: 5, couple: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=200&q=80' },
  ];

  const faqs = [
    { q: 'How does the AI matching work?', a: 'Our neural engine analyzes 47+ dimensions of compatibility — from core values and lifestyle preferences to communication patterns and relationship goals.' },
    { q: 'Is Topolgira free to use?', a: 'Yes! Topolgira is free to join and start matching. We offer premium features for enhanced experience, but the core matching and messaging is completely free.' },
    { q: 'How do verified profiles work?', a: 'Every new member goes through a photo verification process using our AI facial recognition system. This ensures every profile is a real person.' },
    { q: "What's the Zero Ghosting Guarantee?", a: 'Our platform tracks response quality and timing. Members who consistently ghost matches receive reduced visibility.' },
    { q: 'How is this different from Tinder/Bumble?', a: "Those apps are designed to keep you swiping forever. Topolgira is built to get you off the app and into real life." },
  ];

  const currentProfile = heroProfiles[heroCardIndex];
  const isSectionVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="tpl-landing">
      

      <div className="tpl-scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {particlePositions.map((p, i) => (
        <div key={i} className="tpl-particle" style={{
          left: `${p.x}%`, bottom: '-10px', width: `${p.size}px`, height: `${p.size}px`,
          animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
          background: i % 3 === 0 ? 'var(--rose)' : i % 3 === 1 ? 'var(--purple)' : 'var(--blue)',
        }} />
      ))}

      {/* NAVBAR */}
      <header className={`tpl-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="tpl-nav-brand" onClick={() => navigate('/')}>
          <div className="tpl-nav-brand-icon">T</div>
          <span className="tpl-nav-brand-text">Topolgira</span>
        </div>
        <nav className="tpl-nav-links">
          <a href="#home" className="tpl-nav-link">Home</a>
          <a href="#features" className="tpl-nav-link">Features</a>
          <a href="#how-it-works" className="tpl-nav-link">How It Works</a>
          <a href="#stories" className="tpl-nav-link">Stories</a>
          <a href="#faq" className="tpl-nav-link">FAQ</a>
        </nav>
        <div className="tpl-nav-actions">
          {user ? (
            <button className="tpl-btn-primary" onClick={() => navigate('/swipe')}><Flame size={16} /> Open App</button>
          ) : (
            <>
              <button className="tpl-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
              <button className="tpl-btn-primary" onClick={() => navigate('/register')}>Get Started <ArrowRight size={14} /></button>
            </>
          )}
          <button className="tpl-nav-mobile-toggle" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
        </div>
      </header>

      <div className={`tpl-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="tpl-mobile-menu-close" onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
        <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
        <a href="#stories" onClick={() => setMobileMenuOpen(false)}>Stories</a>
        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
        {!user && (
          <button className="tpl-btn-primary" style={{ fontSize: 16, padding: '14px 32px', marginTop: 12 }}
            onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
            Get Started <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* HERO */}
      <section id="home" className="tpl-hero" ref={heroRef}>
        <div className="tpl-hero-bg">
          <div className="tpl-hero-orb tpl-hero-orb-1" style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -15}px)` }} />
          <div className="tpl-hero-orb tpl-hero-orb-2" style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 10}px)` }} />
          <div className="tpl-hero-orb tpl-hero-orb-3" style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * -8}px)` }} />
          <div className="tpl-hero-grid" />
        </div>
        <div className="tpl-hero-inner">
          <div className="tpl-hero-content">
            <div className="tpl-hero-badge">
              <div className="tpl-hero-badge-dot"><Sparkles size={14} /></div>
              #1 AI-Powered Dating Platform
            </div>
            <h1 className="tpl-hero-title">
              Find Your<br />
              <span className="tpl-hero-title-typed">{typedText}</span>
              <span className="tpl-hero-cursor" style={{ opacity: cursorVisible ? 1 : 0 }} /><br />
              In Real Life
            </h1>
            <p className="tpl-hero-subtitle">
              We built Topolgira to get you out of the comfort dating app zone
              and back to authentic, real-life connections that actually last.
            </p>
            <div className="tpl-hero-cta-row">
              <button className="tpl-btn-hero" onClick={handleCtaClick}>
                Start Matching Free <ArrowRight size={18} className="tpl-btn-hero-icon" />
              </button>
              <button className="tpl-btn-outline">
                <div className="tpl-btn-outline-play"><Play size={14} fill="white" /></div>
                Watch Demo
              </button>
            </div>
            <div className="tpl-hero-trust-row">
              <div className="tpl-hero-avatars">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="" />
              </div>
              <span className="tpl-hero-trust-text"><strong>10,000+</strong> found love<br />this month</span>
              <div className="tpl-hero-trust-divider" />
              <div className="tpl-hero-trust-rating">
                <div className="tpl-hero-trust-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <span className="tpl-hero-trust-rating-text">4.9/5 from 2,400+ reviews</span>
              </div>
            </div>
          </div>

          <div className="tpl-hero-visual" style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 3}deg) rotateX(${mousePos.y * -2}deg)` }}>
            <div className="tpl-float-card tpl-float-card-1">
              <div className="tpl-float-card-row">
                <div className="tpl-float-card-icon rose"><Heart size={20} /></div>
                <div><div className="tpl-float-card-label">New Match!</div><div className="tpl-float-card-value">It's a Match! 🎉</div></div>
              </div>
            </div>
            <div className="tpl-float-card tpl-float-card-2">
              <div className="tpl-float-card-row">
                <div className="tpl-float-card-icon purple"><Brain size={20} /></div>
                <div><div className="tpl-float-card-label">AI Score</div><div className="tpl-float-card-value">{currentProfile.match}% Match</div></div>
              </div>
            </div>
            <div className="tpl-float-card tpl-float-card-3">
              <div className="tpl-float-card-row">
                <div className="tpl-float-card-icon emerald"><ShieldCheck size={20} /></div>
                <div><div className="tpl-float-card-label">Profile</div><div className="tpl-float-card-value">Verified ✓</div></div>
              </div>
            </div>

            <div className="tpl-phone">
              <div className="tpl-phone-notch"><div className="tpl-phone-notch-cam" /></div>
              <div className="tpl-phone-screen">
                <div className="tpl-phone-status-bar"><span>9:41</span><span>⚡ 87%</span></div>
                <div className="tpl-phone-card-stack">
                  <div className={`tpl-phone-card ${isLikeAnimating ? 'like-animate' : ''}`}>
                    <div className="tpl-phone-card-match-badge"><TrendingUp size={12} /> {currentProfile.match}%</div>
                    <img src={currentProfile.img} alt={currentProfile.name} className="tpl-phone-card-img" />
                    <div className="tpl-phone-card-info">
                      <div>
                        <div className="tpl-phone-card-name">{currentProfile.name}, {currentProfile.age} <Verified size={16} color="#3b82f6" /></div>
                        <div className="tpl-phone-card-location"><MapPin size={11} /> {currentProfile.location} • {currentProfile.role}</div>
                        <div className="tpl-phone-card-tags">
                          {currentProfile.interests.map((t, i) => (
                            <span key={i} className="tpl-phone-card-tag">
                              {i === 0 ? <Coffee size={10} /> : i === 1 ? <Compass size={10} /> : <Music size={10} />} {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tpl-phone-actions">
                  <button className="tpl-phone-act-btn tpl-phone-act-skip" onClick={() => setHeroCardIndex((p) => (p + 1) % heroProfiles.length)}><X size={20} /></button>
                  <button className="tpl-phone-act-btn tpl-phone-act-like" onClick={handleLikeAnimation}><Heart size={26} fill="white" /></button>
                  <button className="tpl-phone-act-btn tpl-phone-act-star"><Star size={20} /></button>
                </div>
              </div>
            </div>

            {isLikeAnimating && (
              <div className="tpl-like-burst">
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * 360;
                  const dist = 60 + Math.random() * 40;
                  return <Heart key={i} size={16 + Math.random() * 12} fill="#e11d48" className="tpl-like-burst-heart"
                    style={{ '--tx': `${Math.cos(angle * Math.PI / 180) * dist}px`, '--ty': `${Math.sin(angle * Math.PI / 180) * dist}px`, '--r': `${Math.random() * 60 - 30}deg`, animationDelay: `${i * 0.05}s` } as React.CSSProperties} />;
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="tpl-marquee-section">
        <div className="tpl-marquee-label">Trusted by singles across India</div>
        <div className="tpl-marquee-track">
          {[...Array(2)].map((_, si) => (
            <React.Fragment key={si}>
              {['Mumbai', 'Delhi', 'Bangalore', 'Ranchi', 'Jamshedpur', 'Kolkata', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad'].map((city) => (
                <span key={`${si}-${city}`} className="tpl-marquee-item"><span className="tpl-marquee-dot" />{city}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="tpl-stats" ref={statsRef} data-section="stats">
        <div className={`tpl-stats-inner tpl-reveal-scale ${isSectionVisible('stats') ? 'visible' : ''}`}>
          {[
            { icon: <Users size={22} />, num: `${counters.members.toLocaleString()}+`, label: 'Active Members' },
            { icon: <Heart size={22} />, num: `${counters.matches.toLocaleString()}+`, label: 'Successful Matches' },
            { icon: <Coffee size={22} />, num: `${counters.dates.toLocaleString()}+`, label: 'Real Life Dates' },
            { icon: <Zap size={22} />, num: `${counters.accuracy}%`, label: 'Match Accuracy' },
          ].map((s, i) => (
            <div key={i} className="tpl-stat-item">
              <div className="tpl-stat-icon">{s.icon}</div>
              <div className="tpl-stat-number">{s.num}</div>
              <div className="tpl-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES - ALTERNATING LEFT/RIGHT ===== */}
      <section id="features" className="tpl-features" data-section="features">
        <div className={`tpl-section-header tpl-reveal ${isSectionVisible('features') ? 'visible' : ''}`}>
          <div className="tpl-section-tag"><Sparkles size={14} /> Why We're Different</div>
          <h2 className="tpl-section-title">Built for Real Connections,<br />Not Endless Swiping</h2>
          <p className="tpl-section-desc">Traditional dating apps keep you addicted. Topolgira is engineered to help you find love and get off your phone.</p>
        </div>

        <div className="tpl-feature-rows">

          {/* FEATURE 1: AI Engine — Content LEFT, Visual RIGHT */}
          <div className={`tpl-feature-row tpl-reveal ${isSectionVisible('features') ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="tpl-feature-row-content">
              <div className="tpl-feature-row-number">
                <div className="tpl-feature-row-number-line" /> Feature 01
              </div>
              <h3 className="tpl-feature-row-title">Neural AI Match Engine</h3>
              <p className="tpl-feature-row-desc">
                Our proprietary deep learning algorithm analyzes 47+ compatibility dimensions — values, lifestyle, communication style, and long-term goals — to surface your most meaningful connections.
              </p>
              <div className="tpl-feature-row-points">
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon rose"><Brain size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Deep Compatibility Analysis</h5>
                    <p>Goes beyond surface-level preferences into core values</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon purple"><TrendingUp size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Self-Learning Algorithm</h5>
                    <p>Gets smarter with every interaction you make</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon amber"><Zap size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Instant Match Scoring</h5>
                    <p>Real-time compatibility percentage on every profile</p>
                  </div>
                </div>
              </div>
              <button className="tpl-feature-row-cta" onClick={handleCtaClick}>
                Experience AI Matching <ArrowRight size={16} />
              </button>
            </div>
            <div className="tpl-feature-row-visual glow-rose">
              <div className="tpl-ai-visual">
                <div className="tpl-ai-brain">
                  <Brain size={52} className="tpl-ai-brain-icon" />
                  <div className="tpl-ai-brain-ring"><div className="tpl-ai-brain-dot tpl-ai-brain-dot-1" /></div>
                  <div className="tpl-ai-brain-ring tpl-ai-brain-ring-2"><div className="tpl-ai-brain-dot tpl-ai-brain-dot-2" /></div>
                  <div className="tpl-ai-brain-ring tpl-ai-brain-ring-2 tpl-ai-brain-ring-3"><div className="tpl-ai-brain-dot tpl-ai-brain-dot-3" /></div>
                </div>
                <div className="tpl-ai-connector-lines">
                  <div className="tpl-ai-connector-line" />
                  <div className="tpl-ai-connector-line" />
                  <div className="tpl-ai-connector-line" />
                </div>
                <div className="tpl-ai-metrics">
                  <div className="tpl-ai-metric"><div className="tpl-ai-metric-value">47+</div><div className="tpl-ai-metric-label">Dimensions</div></div>
                  <div className="tpl-ai-metric"><div className="tpl-ai-metric-value">96%</div><div className="tpl-ai-metric-label">Accuracy</div></div>
                  <div className="tpl-ai-metric"><div className="tpl-ai-metric-value">2.3s</div><div className="tpl-ai-metric-label">Analysis</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 2: Verified — Visual LEFT, Content RIGHT (REVERSED) */}
          <div className={`tpl-feature-row reversed tpl-reveal ${isSectionVisible('features') ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
            <div className="tpl-feature-row-content">
              <div className="tpl-feature-row-number"><div className="tpl-feature-row-number-line" /> Feature 02</div>
              <h3 className="tpl-feature-row-title">100% Verified Profiles</h3>
              <p className="tpl-feature-row-desc">
                Every member passes our multi-layer biometric identity verification. Zero catfishes, zero bots — only real humans looking for genuine connections.
              </p>
              <div className="tpl-feature-row-points">
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon emerald"><Camera size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Photo Verification</h5>
                    <p>AI-powered selfie match confirms identity instantly</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon blue"><Lock size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>ID Authentication</h5>
                    <p>Secure government ID cross-check for trust</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon purple"><Globe size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Social Media Cross-Check</h5>
                    <p>Optional link to verify social presence</p>
                  </div>
                </div>
              </div>
              <button className="tpl-feature-row-cta" onClick={handleCtaClick}>
                Join Verified Community <ArrowRight size={16} />
              </button>
            </div>
            <div className="tpl-feature-row-visual glow-emerald">
              <div className="tpl-shield-visual">
                <div className="tpl-shield-icon-wrap">
                  <div className="tpl-shield-glow" />
                  <ShieldCheck size={52} className="tpl-shield-check-anim" />
                </div>
                <div className="tpl-shield-steps">
                  {[
                    { label: 'Photo Verification', pct: '100%' },
                    { label: 'ID Authentication', pct: '95%' },
                    { label: 'Social Media Cross-Check', pct: '88%' },
                    { label: 'Human Review Complete', pct: '100%' },
                  ].map((step, i) => (
                    <div key={i} className="tpl-shield-step">
                      <div className="tpl-shield-step-check"><Check size={14} /></div>
                      <span>{step.label}</span>
                      <div className="tpl-shield-step-bar">
                        <div className="tpl-shield-step-bar-fill" style={{ width: step.pct, animationDelay: `${i * 0.3}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 3: Smart Date Planner — Content LEFT, Visual RIGHT */}
          <div className={`tpl-feature-row tpl-reveal ${isSectionVisible('features') ? 'visible' : ''}`} style={{ transitionDelay: '0.3s' }}>
            <div className="tpl-feature-row-content">
              <div className="tpl-feature-row-number"><div className="tpl-feature-row-number-line" /> Feature 03</div>
              <h3 className="tpl-feature-row-title">Smart Date Planner</h3>
              <p className="tpl-feature-row-desc">
                Location-aware date suggestions within 72 hours of matching. We push you toward real-world experiences, not endless chat purgatory.
              </p>
              <div className="tpl-feature-row-points">
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon blue"><MapPin size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Nearby Venue Suggestions</h5>
                    <p>Curated spots based on shared interests</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon amber"><Coffee size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Activity Recommendations</h5>
                    <p>Coffee, hikes, art galleries — personalized for you</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon rose"><Compass size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>72-Hour Meetup Challenge</h5>
                    <p>Encourages real-life dates, not screen addiction</p>
                  </div>
                </div>
              </div>
              <button className="tpl-feature-row-cta" onClick={handleCtaClick}>
                Plan Your First Date <ArrowRight size={16} />
              </button>
            </div>
            <div className="tpl-feature-row-visual glow-blue">
              <div className="tpl-map-visual">
                <div className="tpl-map-graphic">
                  <div className="tpl-map-grid" />
                  <MapPin size={24} className="tpl-map-pin" />
                  <MapPin size={20} className="tpl-map-pin" />
                  <MapPin size={22} className="tpl-map-pin" />
                  <MapPin size={18} className="tpl-map-pin" />
                  <div className="tpl-map-pin-ring" />
                  <div className="tpl-map-pin-ring tpl-map-pin-ring-2" />
                  <div className="tpl-map-connect-line" />
                </div>
                <div className="tpl-map-suggestions">
                  {[
                    { icon: <Coffee size={16} />, name: 'Blue Tokai Coffee', sub: '0.8 km • Cozy ambience' },
                    { icon: <Music size={16} />, name: 'Jazz Lounge', sub: '1.2 km • Live music tonight' },
                    { icon: <Compass size={16} />, name: 'Riverside Walk', sub: '2 km • Scenic sunset' },
                    { icon: <Camera size={16} />, name: 'Art Gallery', sub: '0.5 km • New exhibition' },
                  ].map((s, i) => (
                    <div key={i} className="tpl-map-suggestion">
                      <div className="tpl-map-suggestion-icon">{s.icon}</div>
                      <div><div className="tpl-map-suggestion-text">{s.name}</div><div className="tpl-map-suggestion-sub">{s.sub}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 4: Anti-Ghost — Visual LEFT, Content RIGHT (REVERSED) */}
          <div className={`tpl-feature-row reversed tpl-reveal ${isSectionVisible('features') ? 'visible' : ''}`} style={{ transitionDelay: '0.4s' }}>
            <div className="tpl-feature-row-content">
              <div className="tpl-feature-row-number"><div className="tpl-feature-row-number-line" /> Feature 04</div>
              <h3 className="tpl-feature-row-title">Zero Ghosting System</h3>
              <p className="tpl-feature-row-desc">
                Built-in etiquette scoring and response quality tracking ensures respectful, engaging conversations from match to meetup.
              </p>
              <div className="tpl-feature-row-points">
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon purple"><MessageCircleHeart size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Response Quality Scoring</h5>
                    <p>Rewards thoughtful, engaging conversations</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon emerald"><Eye size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Active Status Indicators</h5>
                    <p>Know when your match is engaged and responsive</p>
                  </div>
                </div>
                <div className="tpl-feature-row-point">
                  <div className="tpl-feature-row-point-icon rose"><Crown size={18} /></div>
                  <div className="tpl-feature-row-point-text">
                    <h5>Etiquette Badges</h5>
                    <p>Top communicators get visibility boost</p>
                  </div>
                </div>
              </div>
              <button className="tpl-feature-row-cta" onClick={handleCtaClick}>
                Start Quality Conversations <ArrowRight size={16} />
              </button>
            </div>
            <div className="tpl-feature-row-visual glow-purple">
              <div className="tpl-chat-visual">
                <div className="tpl-chat-header">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="" className="tpl-chat-header-avatar" />
                  <div>
                    <div className="tpl-chat-header-name">Ananya</div>
                    <div className="tpl-chat-header-status"><div className="tpl-chat-header-status-dot" /> Online now</div>
                  </div>
                </div>
                <div className="tpl-chat-bubble tpl-chat-them">
                  Hey! I noticed we both love hiking 🏔️ What's your favorite trail?
                  <div className="tpl-chat-time">2:34 PM</div>
                </div>
                <div className="tpl-chat-bubble tpl-chat-me">
                  Oh I love the Rajmahal hills trail! Have you been? The sunrise view is insane 🌅
                  <div className="tpl-chat-time">2:35 PM</div>
                </div>
                <div className="tpl-chat-bubble tpl-chat-them">
                  No way, that's on my bucket list! We should go together sometime 😊
                  <div className="tpl-chat-time">2:36 PM</div>
                </div>
                <div className="tpl-chat-typing">
                  <div className="tpl-chat-typing-dot" />
                  <div className="tpl-chat-typing-dot" />
                  <div className="tpl-chat-typing-dot" />
                </div>
                <div className="tpl-chat-status-bar"><Check size={14} /> Both responded within 2 mins • Grade: A+</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="tpl-how" data-section="how">
        <div className={`tpl-section-header tpl-reveal ${isSectionVisible('how') ? 'visible' : ''}`}>
          <div className="tpl-section-tag"><Zap size={14} /> Simple Process</div>
          <h2 className="tpl-section-title">Three Steps to Your<br />Perfect Connection</h2>
          <p className="tpl-section-desc">No complicated setup. No endless questionnaires. Just a smart, fast path to meeting someone incredible.</p>
        </div>
        <div className="tpl-how-steps">
          <div className="tpl-how-line" />
          {[
            {
              num: '01', title: 'Build Your Authentic Profile', desc: "Share your true personality, values, and what you're looking for. Our smart onboarding takes less than 2 minutes.",
              tags: [{ icon: <Camera size={12} />, text: 'Photo Upload' }, { icon: <Heart size={12} />, text: 'Interests' }, { icon: <Smile size={12} />, text: 'Personality Quiz' }]
            },
            {
              num: '02', title: 'Get AI Curated Matches', desc: 'Receive daily high-compatibility matches analyzed by our neural matching engine — quality over quantity.',
              tags: [{ icon: <Brain size={12} />, text: 'AI Analysis' }, { icon: <TrendingUp size={12} />, text: 'Match Score' }, { icon: <Sparkles size={12} />, text: 'Daily Picks' }]
            },
            {
              num: '03', title: 'Meet in Real Life', desc: "Break the ice, plan a date with smart suggestions, and create memories that don't live on a screen.",
              tags: [{ icon: <MapPin size={12} />, text: 'Date Spots' }, { icon: <MessageCircleHeart size={12} />, text: 'Ice Breakers' }, { icon: <Coffee size={12} />, text: 'Real Meetup' }]
            },
          ].map((step, i) => (
            <div key={i} className={`tpl-how-step tpl-reveal tpl-reveal-delay-${i + 1} ${isSectionVisible('how') ? 'visible' : ''}`}>
              <div className="tpl-how-step-num">{step.num}</div>
              <div className="tpl-how-step-body">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="tpl-how-step-tags">
                  {step.tags.map((tag, j) => <span key={j} className="tpl-how-step-tag">{tag.icon} {tag.text}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="tpl-testimonials" data-section="stories">
        <div className={`tpl-section-header tpl-reveal ${isSectionVisible('stories') ? 'visible' : ''}`}>
          <div className="tpl-section-tag"><Heart size={14} /> Love Stories</div>
          <h2 className="tpl-section-title">Real People, Real Love</h2>
          <p className="tpl-section-desc">Over 10,000 couples found their person through Topolgira.</p>
        </div>
        <div className={`tpl-testimonial-container tpl-reveal-scale tpl-reveal-delay-2 ${isSectionVisible('stories') ? 'visible' : ''}`}>
          <div className="tpl-testimonial-card">
            <div className="tpl-testimonial-top">
              <div className="tpl-testimonial-stars">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <div className="tpl-testimonial-badge"><Verified size={14} /> Verified Story</div>
            </div>
            <p className="tpl-testimonial-text">"{testimonials[activeTestimonial].text}"</p>
            <div className="tpl-testimonial-bottom">
              <div className="tpl-testimonial-author">
                <div className="tpl-testimonial-avatar-wrap">
                  <img src={testimonials[activeTestimonial].avatar} alt="" className="tpl-testimonial-avatar" />
                  <div className="tpl-testimonial-avatar-ring" />
                </div>
                <div>
                  <div className="tpl-testimonial-name">{testimonials[activeTestimonial].name} <Verified size={14} color="#3b82f6" /></div>
                  <div className="tpl-testimonial-meta"><MapPin size={12} />{testimonials[activeTestimonial].location} • {testimonials[activeTestimonial].time}</div>
                </div>
              </div>
              <img src={testimonials[activeTestimonial].couple} alt="" className="tpl-testimonial-couple-img" />
            </div>
          </div>
          <div className="tpl-testimonial-nav">
            {testimonials.map((_, i) => <button key={i} className={`tpl-testimonial-dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="tpl-faq" data-section="faq">
        <div className={`tpl-section-header tpl-reveal ${isSectionVisible('faq') ? 'visible' : ''}`}>
          <div className="tpl-section-tag"><MousePointerClick size={14} /> Got Questions?</div>
          <h2 className="tpl-section-title">Frequently Asked Questions</h2>
          <p className="tpl-section-desc">Everything you need to know about Topolgira.</p>
        </div>
        <div className="tpl-faq-grid">
          {faqs.map((faq, i) => (
            <div key={i} className={`tpl-faq-item ${activeFaq === i ? 'open' : ''} tpl-reveal tpl-reveal-delay-${i + 1} ${isSectionVisible('faq') ? 'visible' : ''}`}>
              <button className="tpl-faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                {faq.q} <ChevronDown size={18} className="tpl-faq-chevron" />
              </button>
              <div className="tpl-faq-answer"><div className="tpl-faq-answer-inner">{faq.a}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="tpl-cta" data-section="cta">
        <div className={`tpl-cta-inner tpl-reveal-scale ${isSectionVisible('cta') ? 'visible' : ''}`}>
          <div className="tpl-cta-icon-row">
            <div className="tpl-cta-icon-bubble"><Heart size={24} /></div>
            <div className="tpl-cta-icon-bubble"><Sparkles size={24} /></div>
            <div className="tpl-cta-icon-bubble"><Zap size={24} /></div>
          </div>
          <h2 className="tpl-cta-title">Ready to Find Your<br />Perfect Match?</h2>
          <p className="tpl-cta-desc">Join thousands of singles who stopped swiping and started living.</p>
          {!emailSubmitted ? (
            <form className="tpl-cta-form" onSubmit={handleEmailSubmit}>
              <input type="email" className="tpl-cta-input" placeholder="Enter your email address..." value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
              <button type="submit" className="tpl-cta-submit">Get Started <Send size={16} /></button>
            </form>
          ) : (
            <div className="tpl-cta-success"><Check size={20} /> Welcome aboard! Redirecting you...</div>
          )}
          <p className="tpl-cta-disclaimer"><Lock size={12} /> Free forever. No credit card required.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="tpl-footer">
        <div className="tpl-footer-inner">
          <div className="tpl-footer-top">
            <div>
              <div className="tpl-nav-brand" style={{ cursor: 'default' }}>
                <div className="tpl-nav-brand-icon">T</div>
                <span className="tpl-nav-brand-text">Topolgira</span>
              </div>
              <p className="tpl-footer-brand-text">Get out of the comfort dating app zone and back to real life. Built with ❤️ for people who want something real.</p>
              <div className="tpl-footer-social">
                {[Globe, Flame, Send, Eye].map((Icon, i) => (
                  <button key={i} className="tpl-footer-social-btn"><Icon size={16} /></button>
                ))}
              </div>
            </div>
            <div className="tpl-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#home">AI Engine</a>
              <a href="#home">Pricing</a>
            </div>
            <div className="tpl-footer-col">
              <h4>Company</h4>
              <a href="#home">About Us</a>
              <a href="#home">Careers <ArrowUpRight size={12} /></a>
              <a href="#home">Blog</a>
              <a href="#home">Press Kit</a>
            </div>
            <div className="tpl-footer-col">
              <h4>Support</h4>
              <a href="#home">Help Center</a>
              <a href="#home">Safety Tips</a>
              <a href="#home">Community</a>
              <a href="#home">Contact Us</a>
            </div>
          </div>
          <div className="tpl-footer-bottom">
            <p>© {new Date().getFullYear()} Topolgira. All rights reserved.</p>
            <div className="tpl-footer-bottom-links">
              <a href="#home">Privacy</a>
              <a href="#home">Terms</a>
              <a href="#home">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};