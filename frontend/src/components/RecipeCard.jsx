import { useState, useEffect } from 'react';
import { ChefHat, RefreshCw, ChevronDown, ChevronUp, Check, UtensilsCrossed, Clock, Users, Flame, Send, Play, ShoppingCart } from 'lucide-react';
import ShoppingCartModal from './ShoppingCartModal';
import './RecipeCard.css';

function NutritionBar({ label, value, unit, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="nutrition-row">
      <span className="nutrition-label">{label}</span>
      <div className="nutrition-bar-track">
        <div className="nutrition-bar-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <span className="nutrition-value">{value}{unit}</span>
    </div>
  );
}

export default function RecipeCard({
  recipe, imageUrl, isAccepted, isAccepting, rejectCount,
  onAccept, onReject, onFreeInput, onAddToCart,
}) {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [itemsOrdered, setItemsOrdered] = useState(false);
  const showFreeInput = rejectCount >= 3;

  // Reset itemsOrdered if the recipe itself changes
  useEffect(() => {
    setItemsOrdered(false);
  }, [recipe]);

  const missingIngredients = recipe?.ingredients?.filter(ing => !ing.from_inventory) || [];

  if (!recipe) return null;

  return (
    <div className={`recipe-card ${isAccepted ? 'accepted' : ''}`} id="recipe-card">
      {/* Image area */}
      <div className="recipe-image-area">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="recipe-image" />
        ) : (
          <div className="recipe-image-placeholder">
            <UtensilsCrossed size={40} strokeWidth={1.5} />
            <span>Picture this...</span>
          </div>
        )}
        {isAccepting && (
          <div className="image-shimmer"></div>
        )}
      </div>

      {/* Title & meta */}
      <div className="recipe-header" style={{ animationDelay: '0ms' }}>
        <h2 className="recipe-title">{recipe.title}</h2>
        <div className="recipe-meta">
          <span className="meta-tag"><Clock size={14} /> {recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
          <span className="meta-tag"><Users size={14} /> {recipe.servings} servings</span>
          <span className="meta-tag"><Flame size={14} /> {recipe.difficulty}</span>
          <span className="meta-tag cuisine-tag">{recipe.cuisine}</span>
          <button className="meta-tag video-tag" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' recipe')}`, '_blank')}>
            <Play size={12} /> Watch Prep
          </button>
        </div>
      </div>

      {/* Reasoning panel */}
      <div className="reasoning-panel" style={{ animationDelay: '100ms' }}>
        <button
          className="reasoning-toggle"
          onClick={() => setReasoningExpanded(!reasoningExpanded)}
          id="reasoning-toggle"
        >
          <span className="reasoning-label">🧠 Why this recipe?</span>
          {reasoningExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className={`reasoning-content ${reasoningExpanded ? 'expanded' : ''}`}>
          <p>{recipe.reasoning}</p>
        </div>
        {!reasoningExpanded && (
          <p className="reasoning-preview">
            {recipe.reasoning?.slice(0, 120)}...
          </p>
        )}
      </div>

      {/* Ingredients */}
      <div className="recipe-section" style={{ animationDelay: '200ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Ingredients</h3>
          {missingIngredients.length > 0 && (
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowCart(true)}
              disabled={itemsOrdered}
              style={{ fontSize: '0.8rem', padding: 'var(--space-1) var(--space-3)' }}
            >
              {itemsOrdered ? <Check size={14} style={{ marginRight: 'var(--space-1)' }} className="text-green" /> : <ShoppingCart size={14} style={{ marginRight: 'var(--space-1)' }}/>}
              {itemsOrdered ? 'Added to Cart' : `Shop Missing (${missingIngredients.length})`}
            </button>
          )}
        </div>
        <ul className="ingredients-list">
          {recipe.ingredients?.map((ing, i) => {
            const isMissing = !ing.from_inventory;
            return (
              <li key={i} className={`ingredient-item ${ing.is_expiring ? 'expiring' : ''}`}>
                <span className="ingredient-check">
                  {!isMissing || itemsOrdered ? <Check size={14} className="check-icon" /> : <span className="buy-dot" />}
                </span>
                <span className="ingredient-text">
                  {ing.quantity} {ing.unit} {ing.name}
                </span>
                {ing.is_expiring && <span className="expiring-tag">⚡ Use today</span>}
                {isMissing && (
                  itemsOrdered ? 
                    <span className="buy-tag" style={{background: 'var(--color-bg-warm)', color: 'var(--color-forest)'}}>✓ In cart</span> : 
                    <span className="buy-tag">Need to buy</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Steps */}
      <div className="recipe-section" style={{ animationDelay: '300ms' }}>
        <h3>Instructions</h3>
        <ol className="steps-list">
          {recipe.steps?.map((step, i) => (
            <li key={i} className="step-item">
              <span className="step-number">{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Nutrition */}
      {recipe.nutrition && (
        <div className="recipe-section nutrition-section" style={{ animationDelay: '400ms' }}>
          <h3>Nutrition (per serving)</h3>
          <div className="nutrition-grid">
            <NutritionBar label="Calories" value={recipe.nutrition.calories} unit="kcal" max={800} color="var(--color-accent)" />
            <NutritionBar label="Protein" value={recipe.nutrition.protein_g} unit="g" max={60} color="var(--color-primary)" />
            <NutritionBar label="Carbs" value={recipe.nutrition.carbs_g} unit="g" max={100} color="var(--color-lemon)" />
            <NutritionBar label="Fat" value={recipe.nutrition.fat_g} unit="g" max={40} color="var(--color-saffron)" />
          </div>
        </div>
      )}

      {/* Nutritional gaps */}
      {recipe.nutritional_gaps && (
        <div className="nutritional-gaps" style={{ animationDelay: '500ms' }}>
          <p>💡 {recipe.nutritional_gaps}</p>
        </div>
      )}

      {/* Action buttons */}
      {!isAccepted && (
        <div className="recipe-actions" style={{ animationDelay: '500ms' }}>
          {showFreeInput ? (
            <div className="free-input-area">
              <p className="free-input-prompt">Tell me what you're craving...</p>
              <div className="free-input-row">
                <input
                  type="text"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="e.g. something Italian and light"
                  className="free-input-field"
                  onKeyDown={(e) => e.key === 'Enter' && freeText.trim() && onFreeInput(freeText)}
                  id="free-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => freeText.trim() && onFreeInput(freeText)}
                  disabled={!freeText.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={onAccept}
                disabled={isAccepting}
                id="accept-recipe-btn"
              >
                <ChefHat size={18} />
                {isAccepting ? 'Preparing...' : "Let's Cook!"}
              </button>
              <button
                className="btn btn-outline"
                onClick={onReject}
                disabled={isAccepting}
                id="reject-recipe-btn"
              >
                <RefreshCw size={16} />
                Show Me Something Else
              </button>
            </>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="accepted-banner">
          <ChefHat size={24} />
          <span>Happy cooking! 🎉</span>
        </div>
      )}

      {showCart && (
        <ShoppingCartModal 
          missingIngredients={missingIngredients} 
          onClose={() => setShowCart(false)} 
          onAddToCart={() => {
            if (onAddToCart) onAddToCart(missingIngredients);
            setItemsOrdered(true);
          }}
        />
      )}
    </div>
  );
}
