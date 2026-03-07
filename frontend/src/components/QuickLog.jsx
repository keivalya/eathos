import { useState, useRef } from 'react';
import { Camera, Send } from 'lucide-react';
import './QuickLog.css';

export default function QuickLog({ onLog }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [calories, setCalories] = useState('');
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const hour = new Date().getHours();
    const type = hour < 10 ? 'breakfast' : hour < 14 ? 'lunch' : hour < 17 ? 'snack' : 'dinner';
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
            onChange={e => setName(e.target.value)}
            placeholder="What did you eat?"
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

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!name.trim()}>
          <Send size={16} /> Log It
        </button>
      </div>
    </div>
  );
}
