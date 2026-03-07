import './ProgressTracker.css';

const LABELS = {
  energy: 'Energy & Mood',
  satisfaction: 'Meal Satisfaction',
  physical: 'Physical Response',
};

const SCORE_LABELS = { 4: 'Great', 3: 'Good', 2: 'Fair', 1: 'Tough' };
const SCORE_COLORS = { 4: 'var(--color-primary)', 3: 'var(--color-primary-light)', 2: 'var(--color-saffron)', 1: 'var(--color-berry)' };

export default function ProgressTracker({ recapHistory = [] }) {
  const last7 = recapHistory.slice(-7);

  if (last7.length === 0) {
    return (
      <div className="progress-tracker">
        <h2>Your Progress</h2>
        <div className="progress-empty">
          <p>Complete your first end-of-day check-in to start tracking trends.</p>
        </div>
      </div>
    );
  }

  const averages = {};
  ['energy', 'satisfaction', 'physical'].forEach(key => {
    const vals = last7.filter(r => r[key]).map(r => r[key]);
    averages[key] = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  });

  const getMessage = () => {
    const avg = (Number(averages.energy) + Number(averages.satisfaction) + Number(averages.physical)) / 3;
    if (avg >= 3.5) return "You're doing wonderfully! Your body is responding well to your nutrition choices.";
    if (avg >= 2.5) return "Good progress! Small adjustments can make a big difference.";
    return "Let's look at what might need adjusting. Every day is a fresh start.";
  };

  return (
    <div className="progress-tracker">
      <h2>Your Progress</h2>
      <p className="progress-period">Last {last7.length} day{last7.length !== 1 ? 's' : ''}</p>

      <div className="progress-averages">
        {['energy', 'satisfaction', 'physical'].map(key => (
          <div key={key} className="progress-avg-card">
            <span className="avg-label">{LABELS[key]}</span>
            <span className="avg-value">{averages[key]}</span>
            <span className="avg-out-of">/4</span>
          </div>
        ))}
      </div>

      <div className="progress-dots-section">
        <h3>Daily Trend</h3>
        {['energy', 'satisfaction', 'physical'].map(key => (
          <div key={key} className="trend-row">
            <span className="trend-label">{LABELS[key]}</span>
            <div className="trend-dots">
              {last7.map((r, i) => (
                <div
                  key={i}
                  className="trend-dot"
                  style={{ background: SCORE_COLORS[r[key]] || 'var(--color-surface)' }}
                  title={`${r.date}: ${SCORE_LABELS[r[key]] || '—'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="progress-message">
        <p>{getMessage()}</p>
      </div>
    </div>
  );
}
