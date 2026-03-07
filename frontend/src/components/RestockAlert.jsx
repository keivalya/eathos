import { useState } from 'react';
import { AlertTriangle, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RestockAlert.css';

export default function RestockAlert({ lowItems = [], onAddAllToCart }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  if (lowItems.length === 0) return null;

  const handleAdd = () => {
    if (onAddAllToCart) {
      onAddAllToCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    }
  };

  return (
    <div className="restock-alert">
      <div className="restock-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="restock-text">
        <strong>Running low:</strong> {lowItems.slice(0, 3).join(', ')}
        {lowItems.length > 3 && ` +${lowItems.length - 3} more`}
      </div>
      <div className="restock-actions-group">
        <button 
          className="restock-action btn-icon-only" 
          onClick={handleAdd}
          title="Add all to shopping list"
          disabled={added}
        >
          {added ? <Check size={14} className="text-green" /> : <ShoppingCart size={14} />}
          {added ? 'Added!' : 'Shop'}
        </button>
        <button className="restock-action" onClick={() => navigate('/shopping')}>
          Review <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
