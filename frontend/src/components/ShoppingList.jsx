import { useState } from 'react';
import { Check, ShoppingCart, ExternalLink, Plus, Trash2 } from 'lucide-react';
import './ShoppingList.css';

export default function ShoppingList({ items = [], onToggle, onAdd, onRemove }) {
  const [newItem, setNewItem] = useState('');

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd({ name: newItem.trim(), category: 'other', checked: false });
    setNewItem('');
  };

  const handleCheckout = () => {
    const itemsToBuy = items.filter(i => !i.checked).map(i => i.name);
    if (itemsToBuy.length === 0) {
      window.open('https://www.instacart.com', '_blank');
      return;
    }
    // Instacart prefers comma separated values for multi-item searches
    const query = encodeURIComponent(itemsToBuy.join(', '));
    window.open(`https://www.instacart.com/store/s?k=${query}`, '_blank');
  };

  return (
    <div className="shopping-list">
      <div className="shopping-header">
        <h2>Shopping List</h2>
        <span className="shopping-count">
          {checkedCount}/{totalCount} purchased
        </span>
      </div>

      {totalCount === 0 ? (
        <div className="shopping-empty">
          <ShoppingCart size={40} strokeWidth={1.5} />
          <p>Your shopping list is empty.</p>
          <span>Add items below or they'll appear automatically when recipes need extra ingredients.</span>
        </div>
      ) : (
        <div className="shopping-items">
          {items.map((item, i) => (
            <div key={i} className={`shopping-item ${item.checked ? 'checked' : ''}`}>
              <div
                className={`shopping-check ${item.checked ? 'is-checked' : ''}`}
                onClick={() => onToggle(item.name)}
                title={item.checked ? 'Mark as not purchased' : 'Mark as purchased'}
              >
                {item.checked && <Check size={12} />}
              </div>
              <span className="shopping-item-name">{item.name}</span>
              {item.quantity && <span className="shopping-item-qty">{item.quantity}</span>}
              <button
                className="shopping-remove-btn"
                onClick={() => onRemove(item.name)}
                aria-label={`Remove ${item.name}`}
                title="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="shopping-actions">
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
            <Plus size={16} /> Add Item
          </button>
        </div>

        <button className="btn btn-outline shopping-instacart" onClick={handleCheckout}>
          <ExternalLink size={16} /> Checkout on Instacart
        </button>
      </div>

      {checkedCount > 0 && checkedCount === totalCount && (
        <div className="shopping-all-done">
          All items purchased! You're all set.
        </div>
      )}
    </div>
  );
}
