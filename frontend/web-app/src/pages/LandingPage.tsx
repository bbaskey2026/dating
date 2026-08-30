import React from 'react';
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
  Flame
} from 'lucide-react';
import type { Candidate } from '../api';

interface LandingPageProps {
  candidates?: Candidate[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ candidates: _candidates = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCtaClick = () => {
    if (user) {
      navigate('/swipe');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-container">
      {/* TOP LANDING NAVBAR */}
      <header className="landing-navbar">
        <div className="landing-logo" onClick={() => navigate('/')}>
          <div className="landing-logo-text">
            <span className="brand-name">Topolgira</span>
            <svg className="brand-underline" viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M2 7C20 1 35 11 50 6C65 1 80 11 95 6C105 3 112 7 118 8" 
                stroke="url(#brand-grad)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="0.5" stopColor="#EC4899" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <nav className="landing-nav-links">
          <a href="#home" className="landing-nav-item active">Home</a>
          <a href="#features" className="landing-nav-item">Features</a>
          <a href="#how-it-works" className="landing-nav-item">How It Works</a>
          <a href="#contact" className="landing-nav-item">Contact</a>
        </nav>

        <div className="landing-nav-auth">
          {user ? (
            <button className="btn-landing-secondary" onClick={() => navigate('/swipe')}>
              <Flame size={16} /> Open App
            </button>
          ) : (
            <>
              <button className="btn-landing-link" onClick={() => navigate('/login')}>
                LOGIN IN
              </button>
              <button className="btn-landing-signup" onClick={() => navigate('/register')}>
                SIGNUP NOW
              </button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION - REPLICATING THE REFERENCE DESIGN */}
      <section id="home" className="landing-hero-section">
        {/* LEFT HERO COLUMN */}
        <div className="hero-left-col">
          <div className="hero-subheading">
            We created <span className="brand-highlight">Topolgira</span>
          </div>

          <h1 className="hero-main-title">
            to delete your <br />
            <span className="hero-gradient-text">Dating apps</span>
          </h1>

          <p className="hero-description">
            We designed a platform to get you out of comfort dating app zone and get back to real life
          </p>

          <div className="hero-cta-box">
            <button className="btn-hero-ready" onClick={handleCtaClick}>
              I'M READY
            </button>
          </div>

          {/* THREE STAT/FEATURE BADGES AT BOTTOM LEFT */}
          <div className="hero-features-row">
            <div className="hero-feature-badge">
              <div className="badge-icon-box heart-bg">
                <Heart size={22} className="icon-heart" />
              </div>
              <div className="badge-text-content">
                <h4 className="badge-title">10k+ Members</h4>
                <p className="badge-sub">biggest community that will support you</p>
              </div>
            </div>

            <div className="hero-feature-badge">
              <div className="badge-icon-box brain-bg">
                <Brain size={22} className="icon-brain" />
              </div>
              <div className="badge-text-content">
                <h4 className="badge-title">Smart AI</h4>
                <p className="badge-sub">Best match based on an intelligent algorithm</p>
              </div>
            </div>

            <div className="hero-feature-badge">
              <div className="badge-icon-box smile-bg">
                <Smile size={22} className="icon-smile" />
              </div>
              <div className="badge-text-content">
                <h4 className="badge-title">Perfect Match</h4>
                <p className="badge-sub">Lot of people have found success in real life</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HERO COLUMN - THE 3 TILTED COLORFUL PHOTO CARDS */}
        <div className="hero-right-col">
          <div className="photo-cards-wrapper">
            {/* PURPLE CARD (TOP LEFT) */}
            <div className="photo-card card-purple">
              <div className="card-bg-fill purple-fill"></div>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                alt="Member Ananya" 
                className="card-person-img"
              />
            </div>

            {/* ORANGE CARD (MIDDLE RIGHT) */}
            <div className="photo-card card-orange">
              <div className="card-bg-fill orange-fill"></div>
              <img 
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80" 
                alt="Member Priya" 
                className="card-person-img"
              />
            </div>

            {/* GREEN CARD (BOTTOM CENTER) */}
            <div className="photo-card card-green">
              <div className="card-bg-fill green-fill"></div>
              <img 
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80" 
                alt="Member Sneha" 
                className="card-person-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="landing-features-section">
        <div className="section-header">
          <span className="section-pill">Why We're Different</span>
          <h2 className="section-title">Designed for Real Connections, Not Endless Swiping</h2>
          <p className="section-subtitle">
            Traditional dating apps are engineered to keep you single and addicted. Topolgira is built to get you off your phone.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper purple">
              <Zap size={24} />
            </div>
            <h3>Smart AI Matchmaking</h3>
            <p>Our neural match engine pairs you based on true core values, lifestyle habits, and long-term compatibility goals.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper orange">
              <ShieldCheck size={24} />
            </div>
            <h3>100% Verified Profiles</h3>
            <p>Say goodbye to catfishes and bots. Every single member passes biometric identity check before swiping.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper green">
              <Heart size={24} />
            </div>
            <h3>Real Life Meetups</h3>
            <p>We encourage setting up real-world dates within 72 hours of matching with intelligent location suggestions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper pink">
              <Sparkles size={24} />
            </div>
            <h3>Zero Ghosting Guarantee</h3>
            <p>Built-in match etiquette scoring and active response timers ensure high quality, respectful conversations.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="landing-steps-section">
        <div className="section-header">
          <span className="section-pill">Simple 3-Step Process</span>
          <h2 className="section-title">How Topolgira Works</h2>
        </div>

        <div className="steps-row">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Build Your Authentic Vibe</h3>
            <p>Share your true personality, values, photos, and relationship intent in less than 2 minutes.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Receive AI Curated Matches</h3>
            <p>Get daily high-compatibility matches analyzed by our intelligent neural matching engine.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Connect & Meet in Real Life</h3>
            <p>Chat effortlessly, break the ice, and go on memorable real-world dates without the fatigue.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / SUCCESS STORIES */}
      <section className="landing-reviews-section">
        <div className="section-header">
          <span className="section-pill">Success Stories</span>
          <h2 className="section-title">Over 10,000+ Couples Found Real Love</h2>
        </div>

        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <p className="review-text">
              "After 2 years of mindless swiping on Tinder and Bumble, I tried Topolgira. Matched with Priya within 3 days, and we're planning our wedding now!"
            </p>
            <div className="reviewer-info">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Rahul" className="reviewer-avatar" />
              <div>
                <h4 className="reviewer-name">Rahul Soren</h4>
                <p className="reviewer-meta">Ranchi • Matched 8 months ago</p>
              </div>
            </div>
          </div>

          <div className="review-card">
            <div className="review-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <p className="review-text">
              "The AI match score was surprisingly accurate! We had so much in common from day one. I deleted all my other dating apps immediately."
            </p>
            <div className="reviewer-info">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Ananya" className="reviewer-avatar" />
              <div>
                <h4 className="reviewer-name">Ananya Sharma</h4>
                <p className="reviewer-meta">Jamshedpur • Matched 1 year ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to delete your dating apps and find your match?</h2>
          <p>Join thousands of singles who stepped out of comfort zones into real life connections.</p>
          <button className="btn-banner-cta" onClick={handleCtaClick}>
            GET STARTED NOW <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-name">Topolgira</span>
            <p>Get out of comfort dating app zone and get back to real life.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#home">AI Engine</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#safety">Safety Tips</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Topolgira. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
