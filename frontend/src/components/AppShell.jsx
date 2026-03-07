import { useEffect, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import EathosLogo from './EathosLogo';
import './AppShell.css';

export default function AppShell({ children, onTogglePreferences, onReset, phase }) {
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

  let tapCount = 0;
  let tapTimer = null;
  const handleLogoClick = () => {
    tapCount++;
    if (tapCount === 3) {
      tapCount = 0;
      clearTimeout(tapTimer);
      onReset();
    } else {
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 600);
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
