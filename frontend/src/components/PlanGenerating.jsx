import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EathosLogo from './EathosLogo';
import './PlanGenerating.css';

const STAGES = [
  { message: 'Analyzing your ingredients...', duration: 1500 },
  { message: 'Understanding your goals...', duration: 1500 },
  { message: 'Considering your dietary needs...', duration: 1200 },
  { message: 'Crafting your personalized plan...', duration: 1800 },
];

export default function PlanGenerating({ onComplete }) {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= STAGES.length) {
      onComplete();
      navigate('/home');
      return;
    }
    const timer = setTimeout(() => setStageIndex(i => i + 1), STAGES[stageIndex].duration);
    return () => clearTimeout(timer);
  }, [stageIndex, navigate, onComplete]);

  const stage = STAGES[Math.min(stageIndex, STAGES.length - 1)];
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="generating-screen">
      <div className="generating-bg-orb generating-orb-1" />
      <div className="generating-bg-orb generating-orb-2" />

      <div className="generating-content">
        <EathosLogo size={64} color="white" bgColor="var(--color-primary)" className="generating-logo" />

        <div className="generating-progress-track">
          <div className="generating-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="generating-message" key={stageIndex}>{stage.message}</p>

        <p className="generating-tagline">Eat with intention.</p>
      </div>
    </div>
  );
}
