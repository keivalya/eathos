import { useState } from 'react';
import { Clock, Flame, Pencil, Trash2, Check, X, Send } from 'lucide-react';
import QuickLog from './QuickLog';
import './MealTracker.css';

const CHECKIN_QUESTIONS = [
  {
    id: 'energy',
    question: 'How did your energy and mood hold up today?',
    options: [
      'Strong all day — no crashes',
      'Started strong, faded midday',
      'Ups and downs throughout the day',
      'Low energy and mood all day',
    ],
  },
  {
    id: 'satisfaction',
    question: 'How well did the meals keep you satisfied and on plan?',
    options: [
      'Fully satisfied — no cravings',
      'Mostly on plan, minor cravings',
      'Hungry between meals, made swaps',
      'Went off plan significantly',
    ],
  },
  {
    id: 'physical',
    question: 'How did your body physically respond to today\'s meals?',
    options: [
      'Felt great — no issues',
      'Minor bloating or heaviness',
      'Noticeable discomfort or digestive issues',
      'Headaches, fatigue, or other symptoms',
    ],
  },
];

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const SLOT_TIMES = { breakfast: '7-10 AM', lunch: '11 AM-2 PM', snack: '2-5 PM', dinner: '5-9 PM' };

function MealCard({ meal, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(meal.name);
  const [editCal, setEditCal] = useState(meal.calories || '');

  const handleSave = () => {
    onEdit({ ...meal, name: editName.trim(), calories: editCal ? Number(editCal) : null });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(meal.name);
    setEditCal(meal.calories || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="tracker-meal-card editing">
        <div className="meal-edit-form">
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="meal-edit-input"
            autoFocus
          />
          <input
            type="number"
            value={editCal}
            onChange={e => setEditCal(e.target.value)}
            placeholder="Calories"
            className="meal-edit-input meal-edit-cal"
          />
          <div className="meal-edit-actions">
            <button className="meal-action-btn save-btn" onClick={handleSave} title="Save">
              <Check size={14} />
            </button>
            <button className="meal-action-btn cancel-btn" onClick={handleCancel} title="Cancel">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracker-meal-card">
      {meal.photo && <img src={meal.photo} alt={meal.name} className="meal-card-thumb" />}
      <div className="meal-card-info">
        <span className="meal-card-name">{meal.name}</span>
        {meal.calories && (
          <span className="meal-card-cal"><Flame size={12} /> {meal.calories} cal</span>
        )}
      </div>
      <div className="meal-card-actions">
        <button className="meal-action-btn edit-btn" onClick={() => setEditing(true)} title="Edit">
          <Pencil size={13} />
        </button>
        <button className="meal-action-btn delete-btn" onClick={onDelete} title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function MealTracker({ meals = [], onQuickLog, onEditMeal, onDeleteMeal, onSubmitCheckin, checkinHistory = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const todayCheckin = checkinHistory.find(c => c.date === today);
  const [checkinAnswers, setCheckinAnswers] = useState(todayCheckin || {});
  const [checkinSubmitted, setCheckinSubmitted] = useState(!!todayCheckin);
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
                <MealCard
                  key={i}
                  meal={meal}
                  onEdit={(updated) => onEditMeal(meal.loggedAt, updated)}
                  onDelete={() => onDeleteMeal(meal.loggedAt)}
                />
              ))
            ) : (
              <div className="slot-empty">No meal logged yet</div>
            )}
          </div>
        ))}
      </div>

      <QuickLog onLog={onQuickLog} />

      <div className="tracker-checkin">
        <h3>Daily Check-in</h3>
        {checkinSubmitted ? (
          <div className="checkin-submitted">
            <Check size={20} />
            <span>Check-in complete for today. Thanks for reflecting!</span>
          </div>
        ) : (
          <>
            {CHECKIN_QUESTIONS.map(q => (
              <div key={q.id} className="checkin-question">
                <p className="checkin-q-text">{q.question}</p>
                <div className="checkin-options">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`checkin-option ${checkinAnswers[q.id] === opt ? 'selected' : ''}`}
                      onClick={() => setCheckinAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="btn btn-primary checkin-submit"
              disabled={!checkinAnswers.energy || !checkinAnswers.satisfaction || !checkinAnswers.physical}
              onClick={() => {
                onSubmitCheckin({ ...checkinAnswers, date: today });
                setCheckinSubmitted(true);
              }}
            >
              <Send size={16} /> Submit Check-in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
