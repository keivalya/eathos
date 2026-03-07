import { useState } from 'react';
import { X } from 'lucide-react';
import './DietaryPreferencesModal.css';

const RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
const CUISINES = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'Surprise Me'];

export default function DietaryPreferencesModal({ preferences, onSave, onClose }) {
  const [restrictions, setRestrictions] = useState(preferences.restrictions || []);
  const [cuisines, setCuisines] = useState(preferences.cuisines || []);
  const [allergies, setAllergies] = useState(preferences.allergies || '');

  const toggleRestriction = (r) => {
    setRestrictions(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const toggleCuisine = (c) => {
    setCuisines(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const handleSave = () => {
    onSave({ restrictions, cuisines, allergies });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} id="dietary-prefs-modal">
        <div className="modal-header">
          <h2>Dietary Preferences</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
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
          <button className="btn btn-primary" onClick={handleSave} id="save-prefs-btn">Save Preferences</button>
        </div>
      </div>
    </div>
  );
}
