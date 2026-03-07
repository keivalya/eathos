import { useState, useMemo } from 'react';
import { Clock, Flame, Pencil, Trash2, Check, X, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import QuickLog from './QuickLog';
import './MealTracker.css';

function toDateStr(d) { return d.toISOString().split('T')[0]; }

function formatDateHeading(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

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
  const today = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;

  const selectedCheckin = checkinHistory.find(c => c.date === selectedDate);
  const [checkinAnswers, setCheckinAnswers] = useState(selectedCheckin || {});
  const [checkinSubmitted, setCheckinSubmitted] = useState(!!selectedCheckin);

  const shiftDate = (dir) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    const next = toDateStr(d);
    if (next > today) return;
    setSelectedDate(next);
    const checkin = checkinHistory.find(c => c.date === next);
    setCheckinAnswers(checkin || {});
    setCheckinSubmitted(!!checkin);
  };

  const goToday = () => {
    setSelectedDate(today);
    const checkin = checkinHistory.find(c => c.date === today);
    setCheckinAnswers(checkin || {});
    setCheckinSubmitted(!!checkin);
  };

  const dateMeals = useMemo(
    () => meals.filter(m => m.loggedAt?.startsWith(selectedDate)),
    [meals, selectedDate]
  );

  const slotMap = {};
  dateMeals.forEach(m => {
    if (!slotMap[m.type]) slotMap[m.type] = [];
    slotMap[m.type].push(m);
  });

  const totals = dateMeals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <h2>{isToday ? "Today's Meals" : 'Meal History'}</h2>
        <div className="tracker-date-nav">
          <button className="date-nav-btn" onClick={() => shiftDate(-1)}>
            <ChevronLeft size={18} />
          </button>
          <span className="date-nav-label">{formatDateHeading(selectedDate)}</span>
          <button className="date-nav-btn" onClick={() => shiftDate(1)} disabled={isToday}>
            <ChevronRight size={18} />
          </button>
          {!isToday && (
            <button className="date-nav-today" onClick={goToday}>Today</button>
          )}
        </div>
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
              <div className="slot-empty">No meal logged{isToday ? ' yet' : ''}</div>
            )}
          </div>
        ))}
      </div>

      {isToday && <QuickLog onLog={onQuickLog} />}

      <div className="tracker-checkin">
        <h3>Daily Check-in</h3>
        {checkinSubmitted || (!isToday && selectedCheckin) ? (
          <>
            <div className="checkin-submitted">
              <Check size={20} />
              <span>{isToday ? 'Check-in complete for today. Thanks for reflecting!' : `Check-in from ${formatDateHeading(selectedDate)}`}</span>
            </div>
            {selectedCheckin && (
              <div className="checkin-review">
                {CHECKIN_QUESTIONS.map(q => (
                  <div key={q.id} className="checkin-review-item">
                    <p className="checkin-q-text">{q.question}</p>
                    <div className="checkin-review-answer">{selectedCheckin[q.id] || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : !isToday && !selectedCheckin ? (
          <div className="checkin-empty">No check-in was recorded for this day.</div>
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
