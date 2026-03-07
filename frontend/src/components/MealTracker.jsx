import { Clock, Flame } from 'lucide-react';
import QuickLog from './QuickLog';
import './MealTracker.css';

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const SLOT_TIMES = { breakfast: '7-10 AM', lunch: '11 AM-2 PM', snack: '2-5 PM', dinner: '5-9 PM' };

export default function MealTracker({ meals = [], onQuickLog }) {
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.loggedAt?.startsWith(today));

  const slotMap = {};
  todayMeals.forEach(m => {
    if (!slotMap[m.type]) slotMap[m.type] = [];
    slotMap[m.type].push(m);
  });

  const totals = todayMeals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <h2>Today's Meals</h2>
        <div className="tracker-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="tracker-totals">
        <div className="total-item">
          <span className="total-value">{totals.calories}</span>
          <span className="total-label">cal</span>
        </div>
        <div className="total-item">
          <span className="total-value">{totals.protein}g</span>
          <span className="total-label">protein</span>
        </div>
        <div className="total-item">
          <span className="total-value">{totals.carbs}g</span>
          <span className="total-label">carbs</span>
        </div>
        <div className="total-item">
          <span className="total-value">{totals.fat}g</span>
          <span className="total-label">fat</span>
        </div>
      </div>

      <div className="tracker-timeline">
        {MEAL_SLOTS.map(slot => (
          <div key={slot} className="tracker-slot">
            <div className="slot-header">
              <h3>{SLOT_LABELS[slot]}</h3>
              <span className="slot-time"><Clock size={12} /> {SLOT_TIMES[slot]}</span>
            </div>
            {slotMap[slot]?.length > 0 ? (
              slotMap[slot].map((meal, i) => (
                <div key={i} className="tracker-meal-card">
                  {meal.photo && <img src={meal.photo} alt={meal.name} className="meal-card-thumb" />}
                  <div className="meal-card-info">
                    <span className="meal-card-name">{meal.name}</span>
                    {meal.calories && (
                      <span className="meal-card-cal"><Flame size={12} /> {meal.calories} cal</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="slot-empty">No meal logged yet</div>
            )}
          </div>
        ))}
      </div>

      <QuickLog onLog={onQuickLog} />
    </div>
  );
}
