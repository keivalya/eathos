import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import DailySummary from './DailySummary';
import './EndOfDayRecap.css';

const QUESTIONS = [
  {
    id: 'energy',
    question: 'How did your energy and mood hold up today?',
    options: [
      { value: 4, label: 'Strong all day — no crashes', emoji: '💪' },
      { value: 3, label: 'Started strong, faded midday', emoji: '📉' },
      { value: 2, label: 'Ups and downs throughout', emoji: '🎢' },
      { value: 1, label: 'Low energy and mood all day', emoji: '😔' },
    ],
  },
  {
    id: 'satisfaction',
    question: 'How well did the meals keep you satisfied?',
    options: [
      { value: 4, label: 'Fully satisfied — no cravings', emoji: '😊' },
      { value: 3, label: 'Mostly on plan, minor cravings', emoji: '👌' },
      { value: 2, label: 'Hungry between meals, made swaps', emoji: '😤' },
      { value: 1, label: 'Went off plan significantly', emoji: '🍕' },
    ],
  },
  {
    id: 'physical',
    question: 'How did your body physically respond?',
    options: [
      { value: 4, label: 'Felt great — no issues', emoji: '✨' },
      { value: 3, label: 'Minor bloating or heaviness', emoji: '🫤' },
      { value: 2, label: 'Noticeable discomfort', emoji: '😣' },
      { value: 1, label: 'Headaches, fatigue, or symptoms', emoji: '🤕' },
    ],
  },
];

export default function EndOfDayRecap({ meals = [], onSubmit }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...answers,
      date: new Date().toISOString().split('T')[0],
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="recap-page">
        <div className="recap-complete">
          <div className="recap-complete-icon"><Check size={32} /></div>
          <h2>Thanks for checking in!</h2>
          <p>Your feedback helps us personalize your nutrition plan. See you tomorrow.</p>
          <DailySummary meals={meals} />
        </div>
      </div>
    );
  }

  const showSummary = step >= QUESTIONS.length;

  return (
    <div className="recap-page">
      <div className="recap-header">
        <h2>End of Day Check-in</h2>
        <p className="recap-subtitle">A quick reflection to help us learn what works for you.</p>
        <div className="recap-progress">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`recap-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {!showSummary ? (
        <div className="recap-question" key={QUESTIONS[step].id}>
          <h3>{QUESTIONS[step].question}</h3>
          <div className="recap-options">
            {QUESTIONS[step].options.map(opt => (
              <button
                key={opt.value}
                className={`recap-option ${answers[QUESTIONS[step].id] === opt.value ? 'selected' : ''}`}
                onClick={() => handleSelect(QUESTIONS[step].id, opt.value)}
              >
                <span className="recap-option-emoji">{opt.emoji}</span>
                <span className="recap-option-label">{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="recap-nav">
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>}
            <div style={{ flex: 1 }} />
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!answers[QUESTIONS[step].id]}
            >
              {step < QUESTIONS.length - 1 ? 'Next' : 'Review'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="recap-review">
          <DailySummary meals={meals} />
          <button className="btn btn-primary recap-submit" onClick={handleSubmit}>
            <Check size={16} /> Submit Check-in
          </button>
        </div>
      )}
    </div>
  );
}
