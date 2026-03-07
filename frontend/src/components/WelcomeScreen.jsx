import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EathosLogo from './EathosLogo';
import './WelcomeScreen.css';

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="welcome-bg-orb welcome-orb-1" />
      <div className="welcome-bg-orb welcome-orb-2" />

      <div className="welcome-content">
        <EathosLogo size={80} color="white" bgColor="var(--color-primary)" className="welcome-logo" />

        <h1 className="welcome-wordmark">Eathos</h1>
        <p className="welcome-tagline">AI Wellness Coach &middot; Fridge to Table</p>

        <div className="welcome-slogan">
          Eat with <em>intention.</em>
        </div>

        <p className="welcome-description">
          Your personal nutrition coach that adapts to your day, your goals,
          your pantry, and whatever just changed on your calendar.
        </p>

        <button
          className="btn btn-primary welcome-cta"
          onClick={() => navigate('/onboarding')}
          id="get-started-btn"
        >
          Get Started
          <ArrowRight size={18} />
        </button>

        <p className="welcome-footer">
          Built with Gemini &middot; Red Huskies &middot; Frontiers 2026
        </p>
      </div>
    </div>
  );
}
