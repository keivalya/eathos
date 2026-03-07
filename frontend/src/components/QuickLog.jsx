import { useState, useRef } from 'react';
import { Camera, Send } from 'lucide-react';
import './QuickLog.css';

const MEAL_KEYWORDS = {
  breakfast: ['breakfast', 'morning', 'cereal', 'oatmeal', 'eggs', 'toast', 'pancake', 'waffle', 'bagel', 'smoothie', 'yogurt', 'granola', 'coffee'],
  lunch: ['lunch', 'sandwich', 'salad', 'wrap', 'soup', 'midday', 'noon', 'burrito'],
  snack: ['snack', 'cookie', 'chips', 'fruit', 'nuts', 'bar', 'crackers', 'popcorn', 'trail mix', 'apple', 'banana', 'granola bar'],
  dinner: ['dinner', 'supper', 'evening', 'steak', 'pasta', 'rice', 'chicken', 'fish', 'pizza', 'curry', 'stir fry', 'tacos'],
};

function detectMealType(text) {
  const lower = text.toLowerCase();

  for (const keyword of ['breakfast', 'lunch', 'dinner', 'supper', 'snack']) {
    if (lower.includes(keyword)) {
      return keyword === 'supper' ? 'dinner' : keyword;
    }
  }

  let bestMatch = null;
  let bestScore = 0;
  for (const [type, keywords] of Object.entries(MEAL_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type;
    }
  }

  return bestMatch;
}

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };

export default function QuickLog({ onLog }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState(null);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const detected = detectMealType(name);

    if (detected) {
      submitLog(detected);
    } else if (mealType) {
      submitLog(mealType);
    } else {
      setShowMealPicker(true);
    }
  };

  const submitLog = (type) => {
    onLog({
      name: name.trim(),
      photo,
      calories: calories ? Number(calories) : null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null,
      loggedAt: new Date().toISOString(),
      type,
      isQuickLog: true,
    });
    setName('');
    setPhoto(null);
    setCalories('');
    setMealType(null);
    setShowMealPicker(false);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setShowMealPicker(false);
    setMealType(null);
  };

  return (
    <div className="quick-log">
      <h3>Quick Log</h3>
      <p className="quick-log-hint">Log a snack, takeout, or impromptu meal.</p>

      <div className="quick-log-form">
        <div className="quick-log-row">
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="What did you eat? e.g. turkey sandwich for lunch"
            className="quick-log-input"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button className="quick-log-camera" onClick={() => fileRef.current?.click()}>
            <Camera size={18} />
          </button>
        </div>

        <input
          type="number"
          value={calories}
          onChange={e => setCalories(e.target.value)}
          placeholder="Estimated calories (optional)"
          className="quick-log-input quick-log-cal"
        />

        {photo && <img src={photo} alt="Meal" className="quick-log-preview" />}

        <input ref={fileRef} type="file" accept="image/*" onChange={e => {
          const f = e.target.files[0];
          if (f) setPhoto(URL.createObjectURL(f));
        }} style={{ display: 'none' }} />

        {showMealPicker && (
          <div className="quick-log-meal-picker">
            <p className="meal-picker-prompt">Which meal was this for?</p>
            <div className="meal-picker-options">
              {Object.entries(MEAL_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`meal-picker-btn ${mealType === key ? 'selected' : ''}`}
                  onClick={() => { setMealType(key); setShowMealPicker(false); submitLog(key); }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!name.trim()}>
          <Send size={16} /> Log It
        </button>
      </div>
    </div>
  );
}
