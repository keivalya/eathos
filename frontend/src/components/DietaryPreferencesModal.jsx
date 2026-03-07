import { useState } from 'react';
import { X } from 'lucide-react';
import './DietaryPreferencesModal.css';

const RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
const CUISINES = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'Surprise Me'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function DietaryPreferencesModal({ preferences, userProfile, onSave, onSaveProfile, onClose }) {
  const prof = userProfile?.profile || userProfile || {};

  const [name, setName] = useState(prof.name || '');
  const [birthday, setBirthday] = useState(prof.birthday || '');
  const [gender, setGender] = useState(prof.gender || '');
  const [weight, setWeight] = useState(prof.weight || '');
  const [goals, setGoals] = useState(userProfile?.goals || prof.goals || '');

  const [mealPrefs, setMealPrefs] = useState(
    userProfile?.mealPrefs || prof.mealPrefs || { Breakfast: true, Lunch: true, Dinner: true, Snacks: false }
  );
  const [mealNotes, setMealNotes] = useState(
    userProfile?.mealNotes || prof.mealNotes || { Breakfast: '', Lunch: '', Dinner: '', Snacks: '' }
  );

  const [restrictions, setRestrictions] = useState(preferences.restrictions || []);
  const [cuisines, setCuisines] = useState(preferences.cuisines || []);
  const [allergies, setAllergies] = useState(preferences.allergies || '');

  const toggleRestriction = (r) =>
    setRestrictions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const toggleCuisine = (c) =>
    setCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSave = () => {
    onSaveProfile({
      ...userProfile,
      profile: { ...prof, name, birthday, gender, weight },
      goals,
      mealPrefs,
      mealNotes,
    });
    onSave({ restrictions, cuisines, allergies });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} id="dietary-prefs-modal">
        <div className="modal-header">
          <h2>My Profile & Preferences</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Profile */}
          <div className="pref-section">
            <h3>About You</h3>
            <div className="pref-form-fields">
              <div className="pref-form-field">
                <label>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="pref-form-row">
                <div className="pref-form-field">
                  <label>Birthday</label>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
                </div>
                <div className="pref-form-field">
                  <label>Weight (lbs)</label>
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="150" />
                </div>
              </div>
              <div className="pref-form-field">
                <label>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="pref-section">
            <h3>Nutrition Goals</h3>
            <textarea
              value={goals}
              onChange={e => setGoals(e.target.value)}
              placeholder="e.g. More protein, less sugar, lose 10 lbs, have more energy..."
              className="pref-textarea"
              rows={3}
            />
          </div>

          {/* Meal Preferences */}
          <div className="pref-section">
            <h3>Meal Preferences</h3>
            <div className="toggle-list">
              {MEAL_TYPES.map(meal => (
                <div key={meal} className="pref-meal-group">
                  <label className="toggle-item">
                    <span>{meal}</span>
                    <div
                      className={`toggle-switch ${mealPrefs[meal] ? 'active' : ''}`}
                      onClick={() => setMealPrefs(prev => ({ ...prev, [meal]: !prev[meal] }))}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </label>
                  {mealPrefs[meal] && (
                    <textarea
                      className="pref-meal-notes"
                      value={mealNotes[meal] || ''}
                      onChange={e => setMealNotes(prev => ({ ...prev, [meal]: e.target.value }))}
                      placeholder={`Preferred foods for ${meal.toLowerCase()}...`}
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div className="pref-section">
            <h3>Dietary Restrictions</h3>
            <div className="toggle-list">
              {RESTRICTIONS.map(r => (
                <label key={r} className="toggle-item" id={`toggle-${r.toLowerCase()}`}>
                  <span>{r}</span>
                  <div
                    className={`toggle-switch ${restrictions.includes(r) ? 'active' : ''}`}
                    onClick={() => toggleRestriction(r)}
                  >
                    <div className="toggle-knob" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Cuisines */}
          <div className="pref-section">
            <h3>Cuisine Preferences</h3>
            <div className="chip-grid">
              {CUISINES.map(c => (
                <button
                  key={c}
                  className={`cuisine-chip ${cuisines.includes(c) ? 'selected' : ''}`}
                  onClick={() => toggleCuisine(c)}
                  id={`chip-${c.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="pref-section">
            <h3>Allergies / Dislikes</h3>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. peanuts, shellfish, cilantro..."
              className="allergy-input"
              rows={3}
              id="allergy-input"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-prefs-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
