import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import EathosLogo from './EathosLogo';
import './AppShell.css';

export default function AppShell({ children, onTogglePreferences, onReset, phase }) {
  const navigate = useNavigate();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      onReset();
    }
  }, [onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLogoClick = () => {
    tapCountRef.current++;
    if (tapCountRef.current === 3) {
      tapCountRef.current = 0;
      clearTimeout(tapTimerRef.current);
      onReset();
    } else {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 600);
      navigate('/home');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left" onClick={handleLogoClick}>
          <EathosLogo size={36} color="var(--color-primary)" />
          <h1 className="header-title">Eathos</h1>
        </div>
        <div className="header-right">
          {phase !== 'upload' && phase !== 'welcome' && (
            <span className="header-phase-badge">{formatPhase(phase)}</span>
          )}
          <button
            className="header-prefs-btn"
            onClick={onTogglePreferences}
            aria-label="Dietary Preferences"
            title="Dietary Preferences"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>
      <div className="app-body">
        {children}
      </div>
    </div>
  );
}

function formatPhase(phase) {
  const labels = {
    analyzing: 'Analyzing',
    inventory: 'Inventory Review',
    generating: 'Generating Recipe',
    recipe: 'Recipe Ready',
    accepting: 'Preparing...',
    accepted: "Let's Cook!",
  };
  return labels[phase] || '';
}
