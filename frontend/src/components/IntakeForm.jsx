import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Apple, Target, UtensilsCrossed } from 'lucide-react';
import EathosLogo from './EathosLogo';
import './IntakeForm.css';

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Keto', 'Paleo', 'Nut-Free', 'Shellfish-Free', 'Low-Sodium',
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const STEPS = [
  { id: 'profile', label: 'About You', icon: User },
  { id: 'dietary', label: 'Dietary Needs', icon: Apple },
  { id: 'goals', label: 'Your Goals', icon: Target },
  { id: 'meals', label: 'Meal Preferences', icon: UtensilsCrossed },
];

export default function IntakeForm({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', birthday: '', gender: '', weight: '' });
  const [dietary, setDietary] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [goals, setGoals] = useState('');
  const [mealPrefs, setMealPrefs] = useState({ Breakfast: true, Lunch: true, Dinner: true, Snacks: false });

  const toggleDietary = (item) => {
    setDietary(prev => prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]);
  };

  const handleComplete = () => {
    const data = {
      profile, dietary, allergies, goals, mealPrefs,
      completedAt: new Date().toISOString(),
    };
    onComplete(data);
    navigate('/fridge-capture');
  };

  const canAdvance = () => {
    if (step === 0) return profile.name.trim().length > 0;
    return true;
  };

  return (
    <div className="intake-screen">
      <div className="intake-header">
        <EathosLogo size={32} color="var(--color-primary)" />
        <div className="intake-progress">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`progress-dot ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`} />
          ))}
        </div>
        <span className="intake-step-label">{STEPS[step].label}</span>
      </div>

      <div className="intake-body">
        {step === 0 && (
          <div className="intake-step" key="profile">
            <h2>Let's get to know you</h2>
            <p className="intake-hint">This helps us personalize your nutrition plan.</p>
            <div className="form-fields">
              <div className="form-field">
                <label>Your name</label>
                <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="e.g. Maya" autoFocus />
              </div>
              <div className="form-field">
                <label>Birthday</label>
                <input type="date" value={profile.birthday} onChange={e => setProfile({ ...profile, birthday: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Gender</label>
                  <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Weight (lbs)</label>
                  <input type="number" value={profile.weight} onChange={e => setProfile({ ...profile, weight: e.target.value })} placeholder="150" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="intake-step" key="dietary">
            <h2>Any dietary needs?</h2>
            <p className="intake-hint">Select all that apply. You can change these anytime.</p>
            <div className="chip-select">
              {DIETARY_OPTIONS.map(opt => (
                <button key={opt} className={`intake-chip ${dietary.includes(opt) ? 'selected' : ''}`} onClick={() => toggleDietary(opt)}>
                  {opt}
                </button>
              ))}
            </div>
            <div className="form-field" style={{ marginTop: 'var(--space-6)' }}>
              <label>Other allergies or dislikes</label>
              <textarea value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. peanuts, cilantro, shellfish..." rows={3} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="intake-step" key="goals">
            <h2>What are your nutrition goals?</h2>
            <p className="intake-hint">Tell us what you're working toward. Be as specific or general as you'd like.</p>
            <div className="form-field">
              <textarea value={goals} onChange={e => setGoals(e.target.value)} placeholder="e.g. More protein, less sugar, eat more vegetables, lose 10 lbs, have more energy..." rows={5} autoFocus />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="intake-step" key="meals">
            <h2>Which meals do you want help with?</h2>
            <p className="intake-hint">We'll suggest recipes and track nutrition for these meals.</p>
            <div className="meal-toggles">
              {MEAL_TYPES.map(meal => (
                <label key={meal} className={`meal-toggle ${mealPrefs[meal] ? 'active' : ''}`}>
                  <span>{meal}</span>
                  <div className={`toggle-switch ${mealPrefs[meal] ? 'active' : ''}`} onClick={() => setMealPrefs(prev => ({ ...prev, [meal]: !prev[meal] }))}>
                    <div className="toggle-knob" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="intake-footer">
        {step > 0 && (
          <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleComplete}>
            Next: Scan Your Fridge <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
