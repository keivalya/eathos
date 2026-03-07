import { useReducer, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import WelcomeScreen from './components/WelcomeScreen';
import IntakeForm from './components/IntakeForm';
import FridgeCapture from './components/FridgeCapture';
import GroceryPrefs from './components/GroceryPrefs';
import PlanGenerating from './components/PlanGenerating';
import HomePage from './components/HomePage';
import PhotoUploader from './components/PhotoUploader';
import InventoryGrid from './components/InventoryGrid';
import RecipeCard from './components/RecipeCard';
import AgentTraceTimeline from './components/AgentTraceTimeline';
import DietaryPreferencesModal from './components/DietaryPreferencesModal';
import MealLogger from './components/MealLogger';
import ShoppingList from './components/ShoppingList';
import MealTracker from './components/MealTracker';
import NutritionistChat from './components/NutritionistChat';
import EndOfDayRecap from './components/EndOfDayRecap';
import ProgressTracker from './components/ProgressTracker';
import BottomNav from './components/BottomNav';
import RestockAlert from './components/RestockAlert';
import ErrorRecovery from './components/ErrorRecovery';
import { analyzeImage, sendAction } from './api';
import './App.css';

/* ---------- localStorage helpers ---------- */
function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveState(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ---------- State Machine ---------- */
const initialState = {
  hasOnboarded: loadState('eathos_onboarded', false),
  userProfile: loadState('eathos_profile', null),
  groceryPref: loadState('eathos_grocery_pref', null),

  phase: 'upload',
  sessionId: null,
  inventory: loadState('eathos_inventory', []),
  recipe: null,
  recipeImage: null,
  preferences: loadState('eathos_preferences', { restrictions: [], cuisines: [], allergies: '' }),
  agentSteps: [
    { id: 'analyzer', name: 'Food Analyzer', status: 'pending', summary: '' },
    { id: 'inventory', name: 'Inventory Sync', status: 'pending', summary: '' },
    { id: 'nutritionist', name: 'Recipe Chef', status: 'pending', summary: '' },
    { id: 'image', name: 'Image Generator', status: 'pending', summary: '' },
  ],
  rejectCount: 0,
  error: null,
  showPreferences: false,
  showMealLogger: false,

  mealHistory: loadState('eathos_meals', []),
  shoppingList: loadState('eathos_shopping', []),
  recapHistory: loadState('eathos_recaps', []),
};

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING': {
      saveState('eathos_onboarded', true);
      saveState('eathos_profile', action.profile);
      const prefs = action.profile?.preferences;
      if (prefs) saveState('eathos_preferences', prefs);
      return {
        ...state,
        hasOnboarded: true,
        userProfile: action.profile,
        ...(prefs ? { preferences: prefs } : {}),
      };
    }
    case 'SET_GROCERY_PREF':
      saveState('eathos_grocery_pref', action.pref);
      return { ...state, groceryPref: action.pref };
    case 'FINISH_GENERATING':
      return state;

    case 'START_ANALYSIS':
      return {
        ...state, phase: 'analyzing', error: null,
        agentSteps: state.agentSteps.map(s =>
          s.id === 'analyzer' ? { ...s, status: 'active', summary: 'Scanning your fridge...' } : s
        ),
      };
    case 'SET_INVENTORY': {
      const newInv = action.inventory;
      saveState('eathos_inventory', newInv);
      return {
        ...state, phase: 'inventory', sessionId: action.sessionId, inventory: newInv,
        agentSteps: state.agentSteps.map(s => {
          if (s.id === 'analyzer') return { ...s, status: 'complete', summary: `Found ${newInv.length} items` };
          if (s.id === 'inventory') return { ...s, status: 'complete', summary: 'Inventory synced' };
          return s;
        }),
      };
    }
    case 'START_RECIPE':
      return {
        ...state, phase: 'generating',
        agentSteps: state.agentSteps.map(s =>
          s.id === 'nutritionist' ? { ...s, status: 'active', summary: 'Crafting the perfect recipe...' } : s
        ),
      };
    case 'SET_RECIPE':
      return {
        ...state, phase: 'recipe', recipe: action.recipe,
        agentSteps: state.agentSteps.map(s =>
          s.id === 'nutritionist' ? { ...s, status: 'complete', summary: action.recipe.title } : s
        ),
      };
    case 'START_ACCEPT':
      return {
        ...state, phase: 'accepting',
        agentSteps: state.agentSteps.map(s =>
          s.id === 'image' ? { ...s, status: 'active', summary: 'Generating image...' } : s
        ),
      };
    case 'ACCEPT_RECIPE':
      return {
        ...state, phase: 'accepted', recipeImage: action.imageUrl,
        agentSteps: state.agentSteps.map(s =>
          s.id === 'image' ? { ...s, status: 'complete', summary: 'Done!' } : s
        ),
      };
    case 'REJECT_RECIPE':
      return {
        ...state, rejectCount: state.rejectCount + 1, recipe: null, phase: 'generating',
        agentSteps: state.agentSteps.map(s =>
          s.id === 'nutritionist' ? { ...s, status: 'active', summary: 'Thinking of something else...' } : s
        ),
      };

    case 'SET_PREFERENCES':
      saveState('eathos_preferences', action.preferences);
      return { ...state, preferences: action.preferences };
    case 'TOGGLE_PREFERENCES':
      return { ...state, showPreferences: !state.showPreferences };
    case 'TOGGLE_MEAL_LOGGER':
      return { ...state, showMealLogger: !state.showMealLogger };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'UPDATE_INVENTORY': {
      saveState('eathos_inventory', action.inventory);
      return { ...state, inventory: action.inventory };
    }

    case 'LOG_MEAL': {
      const meals = [...state.mealHistory, action.meal];
      saveState('eathos_meals', meals);
      return { ...state, mealHistory: meals, showMealLogger: false };
    }
    case 'EDIT_MEAL': {
      const meals = state.mealHistory.map(m =>
        m.loggedAt === action.loggedAt ? { ...m, ...action.updated } : m
      );
      saveState('eathos_meals', meals);
      return { ...state, mealHistory: meals };
    }
    case 'DELETE_MEAL': {
      const meals = state.mealHistory.filter(m => m.loggedAt !== action.loggedAt);
      saveState('eathos_meals', meals);
      return { ...state, mealHistory: meals };
    }

    case 'UPDATE_SHOPPING': {
      saveState('eathos_shopping', action.list);
      return { ...state, shoppingList: action.list };
    }
    case 'TOGGLE_SHOPPING_ITEM': {
      const list = state.shoppingList.map(i =>
        i.name === action.name ? { ...i, checked: !i.checked } : i
      );
      saveState('eathos_shopping', list);
      return { ...state, shoppingList: list };
    }
    case 'ADD_SHOPPING_ITEM': {
      const list = [...state.shoppingList, action.item];
      saveState('eathos_shopping', list);
      return { ...state, shoppingList: list };
    }
    case 'REMOVE_SHOPPING_ITEM': {
      const list = state.shoppingList.filter(i => i.name !== action.name);
      saveState('eathos_shopping', list);
      return { ...state, shoppingList: list };
    }

    case 'SUBMIT_RECAP': {
      const recaps = [...state.recapHistory, action.recap];
      saveState('eathos_recaps', recaps);
      return { ...state, recapHistory: recaps };
    }

    case 'RESET':
      return {
        ...initialState,
        hasOnboarded: state.hasOnboarded,
        userProfile: state.userProfile,
        preferences: state.preferences,
        mealHistory: state.mealHistory,
        shoppingList: state.shoppingList,
        recapHistory: state.recapHistory,
        inventory: state.inventory,
      };
    default:
      return state;
  }
}

/* ---------- Scan Flow (the original fridge-to-recipe pipeline) ---------- */
function ScanFlow({ state, dispatch }) {
  const navigate = useNavigate();

  const handleUpload = useCallback(async (file) => {
    dispatch({ type: 'START_ANALYSIS' });
    try {
      const result = await analyzeImage(file);
      const inventoryEvent = result.events.find(e => e.action === 'review_inventory');
      if (inventoryEvent) {
        const items = inventoryEvent.inventory?.inventory || inventoryEvent.inventory || [];
        if (items.length === 0) {
          dispatch({ type: 'SET_ERROR', error: 'zero_items' });
          return;
        }
        dispatch({ type: 'SET_INVENTORY', sessionId: result.session_id, inventory: items });
        navigate('/inventory');
      } else {
        dispatch({ type: 'SET_ERROR', error: 'upload_failed' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: navigator.onLine ? 'upload_failed' : 'network' });
    }
  }, [dispatch, navigate]);

  if (state.error && ['upload_failed', 'zero_items', 'network'].includes(state.error)) {
    return (
      <ErrorRecovery
        type={state.error}
        onRetry={() => dispatch({ type: 'SET_ERROR', error: null })}
        onManual={() => {
          dispatch({ type: 'SET_ERROR', error: null });
          dispatch({ type: 'SET_INVENTORY', sessionId: 'manual', inventory: [] });
          navigate('/inventory');
        }}
        onDismiss={() => dispatch({ type: 'SET_ERROR', error: null })}
      />
    );
  }

  return (
    <>
      {state.phase === 'analyzing' ? (
        <PhotoUploader onUpload={handleUpload} isAnalyzing />
      ) : (
        <PhotoUploader onUpload={handleUpload} />
      )}
    </>
  );
}

function InventoryFlow({ state, dispatch }) {
  const navigate = useNavigate();

  const handleConfirm = useCallback(async () => {
    dispatch({ type: 'START_RECIPE' });
    navigate('/recipe');
    try {
      const result = await sendAction(state.sessionId, 'confirm_inventory', {
        edited_inventory: state.inventory,
        dietary_preferences: state.preferences,
      });
      const recipeEvent = result.events.find(e => e.action === 'review_recipe');
      if (recipeEvent) {
        dispatch({ type: 'SET_RECIPE', recipe: recipeEvent.recipe });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [state.sessionId, state.inventory, state.preferences, dispatch, navigate]);

  return (
    <InventoryGrid
      items={state.inventory}
      onConfirm={handleConfirm}
      onRemoveItem={(name) => dispatch({ type: 'UPDATE_INVENTORY', inventory: state.inventory.filter(i => i.name !== name) })}
      onAddItem={(item) => dispatch({ type: 'UPDATE_INVENTORY', inventory: [...state.inventory, item] })}
    />
  );
}

function RecipeFlow({ state, dispatch }) {
  const handleAccept = useCallback(async () => {
    dispatch({ type: 'START_ACCEPT' });
    try {
      const result = await sendAction(state.sessionId, 'accept_recipe');
      const finalEvent = result.events.find(e => e.action === 'final_output');
      if (finalEvent) {
        dispatch({ type: 'ACCEPT_RECIPE', imageUrl: finalEvent.image_url });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [state.sessionId, dispatch]);

  const handleReject = useCallback(async () => {
    dispatch({ type: 'REJECT_RECIPE' });
    try {
      const result = await sendAction(state.sessionId, 'reject_recipe');
      const recipeEvent = result.events.find(e => e.action === 'review_recipe');
      const freeInputEvent = result.events.find(e => e.action === 'free_input');
      if (recipeEvent) dispatch({ type: 'SET_RECIPE', recipe: recipeEvent.recipe });
      else if (freeInputEvent) dispatch({ type: 'SET_ERROR', error: 'free_input' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [state.sessionId, dispatch]);

  const handleFreeInput = useCallback(async (text) => {
    dispatch({ type: 'START_RECIPE' });
    try {
      const result = await sendAction(state.sessionId, 'free_input', { user_input: text });
      const recipeEvent = result.events.find(e => e.action === 'review_recipe');
      if (recipeEvent) dispatch({ type: 'SET_RECIPE', recipe: recipeEvent.recipe });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [state.sessionId, dispatch]);

  if (state.error === 'recipe_failed' || (state.error && state.error !== 'free_input' && state.phase === 'generating')) {
    return (
      <ErrorRecovery
        type="recipe_failed"
        onRetry={() => {
          dispatch({ type: 'SET_ERROR', error: null });
          dispatch({ type: 'START_RECIPE' });
        }}
        onDismiss={() => dispatch({ type: 'SET_ERROR', error: null })}
      />
    );
  }

  if (state.phase === 'generating' && !state.recipe) {
    return (
      <div className="loading-state">
        <div className="loading-icon">👨‍🍳</div>
        <h2>Crafting the perfect recipe...</h2>
        <p>Our chef is reviewing your ingredients and considering nutritional balance.</p>
      </div>
    );
  }

  return (
    <>
      <RecipeCard
        recipe={state.recipe}
        imageUrl={state.recipeImage}
        isAccepted={state.phase === 'accepted'}
        isAccepting={state.phase === 'accepting'}
        rejectCount={state.rejectCount}
        onAccept={handleAccept}
        onReject={handleReject}
        onFreeInput={handleFreeInput}
      />
      {state.phase === 'accepted' && !state.showMealLogger && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'TOGGLE_MEAL_LOGGER' })}>
            Log This Meal
          </button>
        </div>
      )}
      {state.showMealLogger && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <MealLogger
            recipe={state.recipe}
            onLog={(meal) => dispatch({ type: 'LOG_MEAL', meal })}
            onCancel={() => dispatch({ type: 'TOGGLE_MEAL_LOGGER' })}
          />
        </div>
      )}
    </>
  );
}

/* ---------- App Root ---------- */
function AppRoutes() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    navigate('/home');
  }, [navigate]);

  const lowItems = state.inventory
    .filter(i => i.days_until_expiry != null && i.days_until_expiry <= 3)
    .map(i => i.name);

  const showShell = state.hasOnboarded;

  return (
    <>
      {showShell ? (
        <AppShell
          onTogglePreferences={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}
          onReset={handleReset}
          phase={state.phase}
        >
          <div className="app-layout">
            <main className="main-content">
              {state.error && state.error !== 'free_input' && (
                <div className="error-banner">
                  <span>⚠ {state.error}</span>
                  <button onClick={() => dispatch({ type: 'SET_ERROR', error: null })}>Dismiss</button>
                </div>
              )}

              <Routes>
                <Route path="/home" element={
                  <>
                    {lowItems.length > 0 && <RestockAlert lowItems={lowItems} />}
                    <HomePage
                      userProfile={state.userProfile}
                      inventory={state.inventory}
                      mealHistory={state.mealHistory}
                    />
                  </>
                } />
                <Route path="/scan" element={<ScanFlow state={state} dispatch={dispatch} />} />
                <Route path="/inventory" element={<InventoryFlow state={state} dispatch={dispatch} />} />
                <Route path="/recipe" element={<RecipeFlow state={state} dispatch={dispatch} />} />
                <Route path="/shopping" element={
                  <ShoppingList
                    items={state.shoppingList}
                    onToggle={(name) => dispatch({ type: 'TOGGLE_SHOPPING_ITEM', name })}
                    onAdd={(item) => dispatch({ type: 'ADD_SHOPPING_ITEM', item })}
                    onRemove={(name) => dispatch({ type: 'REMOVE_SHOPPING_ITEM', name })}
                  />
                } />
                <Route path="/tracker" element={
                  <MealTracker
                    meals={state.mealHistory}
                    onQuickLog={(meal) => dispatch({ type: 'LOG_MEAL', meal })}
                    onEditMeal={(loggedAt, updated) => dispatch({ type: 'EDIT_MEAL', loggedAt, updated })}
                    onDeleteMeal={(loggedAt) => dispatch({ type: 'DELETE_MEAL', loggedAt })}
                    onSubmitCheckin={(recap) => dispatch({ type: 'SUBMIT_RECAP', recap })}
                    checkinHistory={state.recapHistory}
                  />
                } />
                <Route path="/chat" element={
                  <NutritionistChat
                    userProfile={state.userProfile}
                    preferences={state.preferences}
                    mealHistory={state.mealHistory}
                  />
                } />
                <Route path="/recap" element={
                  <EndOfDayRecap
                    meals={state.mealHistory.filter(m => m.loggedAt?.startsWith(new Date().toISOString().split('T')[0]))}
                    onSubmit={(recap) => dispatch({ type: 'SUBMIT_RECAP', recap })}
                  />
                } />
                <Route path="/progress" element={<ProgressTracker recapHistory={state.recapHistory} />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </main>

            {state.phase !== 'upload' && ['scan', 'inventory', 'recipe'].some(p => window.location.pathname.includes(p)) && (
              <aside className="trace-sidebar">
                <AgentTraceTimeline steps={state.agentSteps} />
              </aside>
            )}
          </div>

          {state.showPreferences && (
            <DietaryPreferencesModal
              preferences={state.preferences}
              onSave={(prefs) => {
                dispatch({ type: 'SET_PREFERENCES', preferences: prefs });
                dispatch({ type: 'TOGGLE_PREFERENCES' });
              }}
              onClose={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}
            />
          )}

          <BottomNav />
        </AppShell>
      ) : (
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/onboarding" element={
            <IntakeForm onComplete={(data) => dispatch({ type: 'COMPLETE_ONBOARDING', profile: data })} />
          } />
          <Route path="/fridge-capture" element={
            <FridgeCapture onPhotosReady={() => {}} />
          } />
          <Route path="/grocery-prefs" element={
            <GroceryPrefs onSelect={(pref) => dispatch({ type: 'SET_GROCERY_PREF', pref })} />
          } />
          <Route path="/generating" element={
            <PlanGenerating onComplete={() => dispatch({ type: 'FINISH_GENERATING' })} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
