import './DailySummary.css';

export default function DailySummary({ meals = [], goals }) {
  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
    fiber: acc.fiber + (m.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const targets = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    fiber: 30,
  };

  const macros = [
    { label: 'Calories', value: totals.calories, target: targets.calories, unit: 'kcal', color: 'var(--color-accent)' },
    { label: 'Protein', value: totals.protein, target: targets.protein, unit: 'g', color: 'var(--color-primary)' },
    { label: 'Carbs', value: totals.carbs, target: targets.carbs, unit: 'g', color: 'var(--color-lemon)' },
    { label: 'Fat', value: totals.fat, target: targets.fat, unit: 'g', color: 'var(--color-saffron)' },
    { label: 'Fiber', value: totals.fiber, target: targets.fiber, unit: 'g', color: 'var(--color-berry)' },
  ];

  const getMessage = () => {
    if (meals.length === 0) return "No meals logged today yet. You've got this!";
    if (totals.protein >= targets.protein * 0.8) return "Great protein intake today! Your body will thank you.";
    if (totals.calories > targets.calories * 1.1) return "A bit over your calorie target — that's okay. Balance it tomorrow.";
    return "You're making mindful choices. Keep it up!";
  };

  return (
    <div className="daily-summary">
      <h3>Daily Nutrition Summary</h3>

      <div className="summary-macros">
        {macros.map(m => (
          <div key={m.label} className="summary-macro">
            <div className="macro-header">
              <span className="macro-name">{m.label}</span>
              <span className="macro-numbers">{m.value} / {m.target}{m.unit}</span>
            </div>
            <div className="macro-bar-track">
              <div
                className="macro-bar-fill"
                style={{
                  width: `${Math.min((m.value / m.target) * 100, 100)}%`,
                  background: m.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="summary-message">
        <p>{getMessage()}</p>
      </div>
    </div>
  );
}
