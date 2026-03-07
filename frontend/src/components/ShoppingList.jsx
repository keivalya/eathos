import { useState } from 'react';
import { Check, ShoppingCart, ExternalLink, Plus } from 'lucide-react';
import './ShoppingList.css';

const CATEGORIES = {
  produce: 'Produce',
  protein: 'Meat & Protein',
  dairy: 'Dairy',
  grain: 'Grains & Pantry',
  condiment: 'Condiments',
  other: 'Other',
};

export default function ShoppingList({ items = [], onToggle, onAdd }) {
  const [newItem, setNewItem] = useState('');

  const grouped = {};
  items.forEach(item => {
    const cat = CATEGORIES[item.category] ? item.category : 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const checkedCount = items.filter(i => i.checked).length;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd({ name: newItem.trim(), category: 'other', checked: false });
    setNewItem('');
  };

  return (
    <div className="shopping-list">
      <div className="shopping-header">
        <h2>Shopping List</h2>
        <span className="shopping-count">{checkedCount}/{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="shopping-empty">
          <ShoppingCart size={40} strokeWidth={1.5} />
          <p>Your shopping list is empty.</p>
          <span>Items will appear here when your inventory runs low or recipes need extra ingredients.</span>
        </div>
      ) : (
        <div className="shopping-groups">
          {Object.keys(CATEGORIES).map(cat => {
            if (!grouped[cat] || grouped[cat].length === 0) return null;
            return (
              <div key={cat} className="shopping-group">
                <h3>{CATEGORIES[cat]}</h3>
                {grouped[cat].map((item, i) => (
                  <label key={i} className={`shopping-item ${item.checked ? 'checked' : ''}`}>
                    <div className={`shopping-check ${item.checked ? 'is-checked' : ''}`} onClick={() => onToggle(item.name)}>
                      {item.checked && <Check size={12} />}
                    </div>
                    <span className="shopping-item-name">{item.name}</span>
                    {item.quantity && <span className="shopping-item-qty">{item.quantity}</span>}
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="shopping-add-row">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Add an item..."
          className="shopping-add-input"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newItem.trim()}>
          <Plus size={16} />
        </button>
      </div>

      <button className="btn btn-outline shopping-instacart">
        <ExternalLink size={16} /> Order via Instacart
      </button>
    </div>
  );
}
