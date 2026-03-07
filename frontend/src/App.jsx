import { useReducer, useCallback } from 'react';
import AppShell from './components/AppShell';
import PhotoUploader from './components/PhotoUploader';
import InventoryGrid from './components/InventoryGrid';
import RecipeCard from './components/RecipeCard';
import AgentTraceTimeline from './components/AgentTraceTimeline';
import DietaryPreferencesModal from './components/DietaryPreferencesModal';
import { analyzeImage, sendAction } from './api';
import './App.css';

/* ---------- State Machine ---------- */
const initialState = {
  phase: 'upload',          // upload | analyzing | inventory | generating | recipe | accepting | accepted
  sessionId: null,
  inventory: [],
  recipe: null,
  recipeImage: null,
  preferences: {
    restrictions: [],
    cuisines: [],
    allergies: '',
  },
  agentSteps: [
    { id: 'analyzer',    name: 'Food Analyzer',    status: 'pending', summary: '' },
    { id: 'inventory',   name: 'Inventory Sync',   status: 'pending', summary: '' },
    { id: 'nutritionist',name: 'Recipe Chef',      status: 'pending', summary: '' },
    { id: 'image',       name: 'Image Generator',  status: 'pending', summary: '' },
  ],
  rejectCount: 0,
  error: null,
  showPreferences: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_ANALYSIS':
      return {
        ...state,
        phase: 'analyzing',
        error: null,
        agentSteps: state.agentSteps.map(s =>
          s.id === 'analyzer' ? { ...s, status: 'active', summary: 'Scanning your fridge...' } : s
        ),
      };
    case 'SET_INVENTORY':
      return {
        ...state,
        phase: 'inventory',
        sessionId: action.sessionId,
        inventory: action.inventory,
        agentSteps: state.agentSteps.map(s => {
          if (s.id === 'analyzer') return { ...s, status: 'complete', summary: `Found ${action.inventory.length} items` };
          if (s.id === 'inventory') return { ...s, status: 'complete', summary: 'Inventory synced' };
          return s;
        }),
      };
    case 'START_RECIPE':
      return {
        ...state,
        phase: 'generating',
        agentSteps: state.agentSteps.map(s =>
          s.id === 'nutritionist' ? { ...s, status: 'active', summary: 'Crafting the perfect recipe...' } : s
        ),
      };
    case 'SET_RECIPE':
      return {
        ...state,
        phase: 'recipe',
        recipe: action.recipe,
        agentSteps: state.agentSteps.map(s =>
          s.id === 'nutritionist' ? { ...s, status: 'complete', summary: action.recipe.title } : s
        ),
      };
    case 'START_ACCEPT':
      return {
        ...state,
        phase: 'accepting',
        agentSteps: state.agentSteps.map(s =>
          s.id === 'image' ? { ...s, status: 'active', summary: 'Generating image...' } : s
        ),
      };
    case 'ACCEPT_RECIPE':
      return {
        ...state,
        phase: 'accepted',
        recipeImage: action.imageUrl,
        agentSteps: state.agentSteps.map(s =>
          s.id === 'image' ? { ...s, status: 'complete', summary: 'Done!' } : s
        ),
      };
    case 'REJECT_RECIPE':
      return {
        ...state,
        rejectCount: state.rejectCount + 1,
        recipe: null,
        phase: 'generating',
        agentSteps: state.agentSteps.map(s =>
          s.id === 'nutritionist' ? { ...s, status: 'active', summary: 'Thinking of something else...' } : s
        ),
      };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.preferences };
    case 'TOGGLE_PREFERENCES':
      return { ...state, showPreferences: !state.showPreferences };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: action.inventory };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

/* ---------- App Component ---------- */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* --- Handlers --- */
  const handleUpload = useCallback(async (file) => {
    dispatch({ type: 'START_ANALYSIS' });
    try {
      const result = await analyzeImage(file);
      const inventoryEvent = result.events.find(e => e.action === 'review_inventory');
      if (inventoryEvent) {
        dispatch({
          type: 'SET_INVENTORY',
          sessionId: result.session_id,
          inventory: inventoryEvent.inventory?.inventory || inventoryEvent.inventory || [],
        });
      } else {
        dispatch({ type: 'SET_ERROR', error: 'No inventory data received' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, []);

  const handleConfirmInventory = useCallback(async () => {
    dispatch({ type: 'START_RECIPE' });
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
  }, [state.sessionId, state.inventory, state.preferences]);

  const handleAcceptRecipe = useCallback(async () => {
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
  }, [state.sessionId]);

  const handleRejectRecipe = useCallback(async () => {
    dispatch({ type: 'REJECT_RECIPE' });
    try {
      const result = await sendAction(state.sessionId, 'reject_recipe');
      const recipeEvent = result.events.find(e => e.action === 'review_recipe');
      const freeInputEvent = result.events.find(e => e.action === 'free_input');
      if (recipeEvent) {
        dispatch({ type: 'SET_RECIPE', recipe: recipeEvent.recipe });
      } else if (freeInputEvent) {
        dispatch({ type: 'SET_ERROR', error: 'free_input' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [state.sessionId]);

  const handleFreeInput = useCallback(async (text) => {
    dispatch({ type: 'START_RECIPE' });
    try {
      const result = await sendAction(state.sessionId, 'free_input', { user_input: text });
      const recipeEvent = result.events.find(e => e.action === 'review_recipe');
      if (recipeEvent) {
        dispatch({ type: 'SET_RECIPE', recipe: recipeEvent.recipe });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [state.sessionId]);

  const handleRemoveItem = useCallback((itemName) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      inventory: state.inventory.filter(i => i.name !== itemName),
    });
  }, [state.inventory]);

  const handleAddItem = useCallback((item) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      inventory: [...state.inventory, item],
    });
  }, [state.inventory]);

  /* --- Demo reset (Ctrl+Shift+R) --- */
  const handleReset = useCallback(() => dispatch({ type: 'RESET' }), []);

  /* --- Render current phase --- */
  const renderPhase = () => {
    switch (state.phase) {
      case 'upload':
        return <PhotoUploader onUpload={handleUpload} />;
      case 'analyzing':
        return <PhotoUploader onUpload={handleUpload} isAnalyzing />;
      case 'inventory':
        return (
          <InventoryGrid
            items={state.inventory}
            onConfirm={handleConfirmInventory}
            onRemoveItem={handleRemoveItem}
            onAddItem={handleAddItem}
          />
        );
      case 'generating':
        return (
          <div className="loading-state">
            <div className="loading-icon">👨‍🍳</div>
            <h2>Crafting the perfect recipe...</h2>
            <p>Our chef is reviewing your ingredients and considering nutritional balance.</p>
          </div>
        );
      case 'recipe':
      case 'accepting':
      case 'accepted':
        return (
          <RecipeCard
            recipe={state.recipe}
            imageUrl={state.recipeImage}
            isAccepted={state.phase === 'accepted'}
            isAccepting={state.phase === 'accepting'}
            rejectCount={state.rejectCount}
            onAccept={handleAcceptRecipe}
            onReject={handleRejectRecipe}
            onFreeInput={handleFreeInput}
          />
        );
      default:
        return <PhotoUploader onUpload={handleUpload} />;
    }
  };

  return (
    <AppShell
      onTogglePreferences={() => dispatch({ type: 'TOGGLE_PREFERENCES' })}
      onReset={handleReset}
      phase={state.phase}
    >
      <div className="app-layout">
        <main className="main-content">
          {state.error && state.error !== 'free_input' && (
            <div className="error-banner">
              <span>⚠️ {state.error}</span>
              <button onClick={() => dispatch({ type: 'SET_ERROR', error: null })}>Dismiss</button>
            </div>
          )}
          {renderPhase()}
        </main>

        {state.phase !== 'upload' && (
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
    </AppShell>
  );
}
