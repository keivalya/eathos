import { useState, useRef } from 'react';
import { Camera, Check, X } from 'lucide-react';
import './MealLogger.css';

export default function MealLogger({ recipe, onLog, onCancel }) {
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const fileRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleLog = () => {
    onLog({
      name: recipe?.title || 'Meal',
      photo,
      notes,
      calories: recipe?.nutrition?.calories,
      protein: recipe?.nutrition?.protein_g,
      carbs: recipe?.nutrition?.carbs_g,
      fat: recipe?.nutrition?.fat_g,
      fiber: recipe?.nutrition?.fiber_g,
      loggedAt: new Date().toISOString(),
      type: getMealType(),
    });
  };

  return (
    <div className="meal-logger">
      <div className="logger-header">
        <h3>Log this meal</h3>
        <button className="logger-close" onClick={onCancel}><X size={18} /></button>
      </div>

      <div className="logger-body">
        <div className="logger-photo-area" onClick={() => fileRef.current?.click()}>
          {photo ? (
            <img src={photo} alt="Meal photo" className="logger-photo" />
          ) : (
            <div className="logger-photo-placeholder">
              <Camera size={28} strokeWidth={1.5} />
              <span>Add a photo of your meal</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        <div className="logger-meal-name">{recipe?.title || 'Meal'}</div>

        {recipe?.nutrition && (
          <div className="logger-macros">
            <span className="macro-pill">{recipe.nutrition.calories} cal</span>
            <span className="macro-pill">{recipe.nutrition.protein_g}g protein</span>
            <span className="macro-pill">{recipe.nutrition.carbs_g}g carbs</span>
            <span className="macro-pill">{recipe.nutrition.fat_g}g fat</span>
          </div>
        )}

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any notes? (optional)"
          className="logger-notes"
          rows={2}
        />
      </div>

      <div className="logger-footer">
        <button className="btn btn-primary" onClick={handleLog}>
          <Check size={16} /> Log Meal
        </button>
      </div>
    </div>
  );
}

function getMealType() {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
}
