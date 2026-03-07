import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, User, Target, UtensilsCrossed, SlidersHorizontal } from 'lucide-react';
import EathosLogo from './EathosLogo';
import './IntakeForm.css';

const CUISINES = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'Surprise Me'];
const RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const STEPS = [
  { id: 'profile', label: 'About You', icon: User },
  { id: 'goals', label: 'Your Goals', icon: Target },
  { id: 'meals', label: 'Meal Preferences', icon: UtensilsCrossed },
  { id: 'preferences', label: 'Dietary Preferences', icon: SlidersHorizontal },
];

export default function IntakeForm({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', birthday: '', gender: '', weight: '' });
  const [goals, setGoals] = useState('');
  const [mealPrefs, setMealPrefs] = useState({ Breakfast: true, Lunch: true, Dinner: true, Snacks: false });
  const [mealNotes, setMealNotes] = useState({ Breakfast: '', Lunch: '', Dinner: '', Snacks: '' });
  const [restrictions, setRestrictions] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [prefAllergies, setPrefAllergies] = useState('');

  const toggleRestriction = (r) => {
    setRestrictions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const toggleCuisine = (c) => {
    setCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleComplete = () => {
    const data = {
      profile, goals, mealPrefs, mealNotes,
      preferences: { restrictions, cuisines, allergies: prefAllergies },
      completedAt: new Date().toISOString(),
    };
    onComplete(data);
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
          <div className="intake-step" key="goals">
            <h2>What are your nutrition goals?</h2>
            <p className="intake-hint">Tell us what you're working toward. Be as specific or general as you'd like.</p>
            <div className="form-field">
              <textarea value={goals} onChange={e => setGoals(e.target.value)} placeholder="e.g. More protein, less sugar, eat more vegetables, lose 10 lbs, have more energy..." rows={5} autoFocus />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="intake-step" key="meals">
            <h2>Which meals do you want help with?</h2>
            <p className="intake-hint">We'll suggest recipes and track nutrition for these meals.</p>
            <div className="meal-toggles">
              {MEAL_TYPES.map(meal => (
                <div key={meal} className="meal-toggle-group">
                  <label className={`meal-toggle ${mealPrefs[meal] ? 'active' : ''}`}>
                    <span>{meal}</span>
                    <div className={`toggle-switch ${mealPrefs[meal] ? 'active' : ''}`} onClick={() => setMealPrefs(prev => ({ ...prev, [meal]: !prev[meal] }))}>
                      <div className="toggle-knob" />
                    </div>
                  </label>
                  {mealPrefs[meal] && (
                    <textarea
                      className="meal-notes"
                      value={mealNotes[meal]}
                      onChange={e => setMealNotes(prev => ({ ...prev, [meal]: e.target.value }))}
                      placeholder={`What do you like for ${meal.toLowerCase()}? e.g. oatmeal, smoothies, salads...`}
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="intake-step" key="preferences">
            <h2>Fine-tune your preferences</h2>
            <p className="intake-hint">These help us pick the right recipes for you. You can always update them later from the top-right menu.</p>

            <div className="pref-inline-section">
              <h3 className="pref-inline-label">Dietary Restrictions</h3>
              <div className="toggle-list">
                {RESTRICTIONS.map(r => (
                  <label key={r} className="toggle-item">
                    <span>{r}</span>
                    <div className={`toggle-switch ${restrictions.includes(r) ? 'active' : ''}`} onClick={() => toggleRestriction(r)}>
                      <div className="toggle-knob" />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pref-inline-section">
              <h3 className="pref-inline-label">Cuisine Preferences</h3>
              <div className="chip-select">
                {CUISINES.map(c => (
                  <button key={c} className={`intake-chip ${cuisines.includes(c) ? 'selected' : ''}`} onClick={() => toggleCuisine(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-inline-section">
              <h3 className="pref-inline-label">Allergies / Dislikes</h3>
              <textarea
                value={prefAllergies}
                onChange={e => setPrefAllergies(e.target.value)}
                placeholder="e.g. peanuts, shellfish, cilantro..."
                className="allergy-input-inline"
                rows={3}
              />
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
            Complete Setup <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
