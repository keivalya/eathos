import { useNavigate } from 'react-router-dom';
import { Camera, ShoppingCart, BarChart3, ChevronRight, Sparkles } from 'lucide-react';
import './HomePage.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMealSuggestion() {
  const hour = new Date().getHours();
  if (hour < 10) return { meal: 'breakfast', text: "Let's find something energizing to start your day." };
  if (hour < 14) return { meal: 'lunch', text: "Time for a nourishing midday meal." };
  if (hour < 18) return { meal: 'snack', text: "A healthy snack to keep you going." };
  return { meal: 'dinner', text: "What's for dinner tonight?" };
}

export default function HomePage({ userProfile, inventory, mealHistory }) {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const suggestion = getMealSuggestion();
  const userName = userProfile?.profile?.name || userProfile?.name || 'there';

  const recentMeal = mealHistory?.[mealHistory.length - 1];
  const inventoryCount = inventory?.length || 0;

  return (
    <div className="home-page">
      <div className="home-greeting">
        <h1>{greeting}, <em>{userName}</em></h1>
        <p>{suggestion.text}</p>
      </div>

      <div className="home-cards">
        <button className="home-card home-card-primary" onClick={() => navigate('/chat')}>
          <div className="home-card-icon">
            <Sparkles size={28} strokeWidth={1.5} />
          </div>
          <div className="home-card-text">
            <h3>Chat with AI Nutritionist</h3>
            <p>Get personalized nutrition advice, meal ideas, and wellness tips</p>
          </div>
          <ChevronRight size={20} className="home-card-arrow" />
        </button>

        <button className="home-card" onClick={() => navigate('/scan')}>
          <div className="home-card-icon">
            <Camera size={28} strokeWidth={1.5} />
          </div>
          <div className="home-card-text">
            <h3>Meal & Recipe Generator</h3>
            <p>Scan your fridge and get personalized recipe suggestions</p>
          </div>
          <ChevronRight size={20} className="home-card-arrow" />
        </button>

        <div className="home-cards-row">
          <button className="home-card" onClick={() => navigate('/shopping')}>
            <div className="home-card-icon">
              <ShoppingCart size={24} strokeWidth={1.5} />
            </div>
            <div className="home-card-text">
              <h3>Shopping List</h3>
              <p>{inventoryCount > 0 ? `${inventoryCount} items tracked` : 'Start Shopping'}</p>
            </div>
          </button>

          <button className="home-card" onClick={() => navigate('/tracker')}>
            <div className="home-card-icon">
              <BarChart3 size={24} strokeWidth={1.5} />
            </div>
            <div className="home-card-text">
              <h3>Meal Tracker</h3>
              <p>{recentMeal ? `Last: ${recentMeal.name}` : 'No meals logged'}</p>
            </div>
          </button>
        </div>
      </div>

      {recentMeal && (
        <div className="home-recent">
          <h4>Recent Activity</h4>
          <div className="recent-card">
            <span className="recent-label">Last meal logged</span>
            <span className="recent-value">{recentMeal.name}</span>
          </div>
        </div>
      )}

      <p className="home-slogan">Eat with intention.</p>
    </div>
  );
}
