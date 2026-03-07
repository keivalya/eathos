import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import EathosLogo from './EathosLogo';
import './GroceryPrefs.css';

export default function GroceryPrefs({ onSelect }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    onSelect(selected);
    navigate('/generating');
  };

  return (
    <div className="grocery-screen">
      <div className="grocery-header">
        <EathosLogo size={32} color="var(--color-primary)" />
        <span className="grocery-step-label">Almost There</span>
      </div>

      <div className="grocery-body">
        <div className="grocery-content">
          <h2>One more thing...</h2>
          <p className="grocery-hint">
            Are you open to shopping for additional groceries, or would you prefer to
            use what you already have?
          </p>

          <div className="grocery-cards">
            <button
              className={`grocery-card ${selected === 'use-existing' ? 'selected' : ''}`}
              onClick={() => setSelected('use-existing')}
            >
              <Package size={32} strokeWidth={1.5} />
              <h3>Use What I Have</h3>
              <p>I'll cook with whatever's in my kitchen right now.</p>
            </button>

            <button
              className={`grocery-card ${selected === 'open-to-shopping' ? 'selected' : ''}`}
              onClick={() => setSelected('open-to-shopping')}
            >
              <ShoppingBag size={32} strokeWidth={1.5} />
              <h3>Open to Shopping</h3>
              <p>I'm happy to pick up a few extra ingredients if needed.</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grocery-footer">
        <button className="btn btn-secondary" onClick={() => navigate('/fridge-capture')}>Back</button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={handleContinue} disabled={!selected}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
