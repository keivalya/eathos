import { useState } from 'react';
import { X, Plus, AlertTriangle, Check, HelpCircle } from 'lucide-react';
import './InventoryGrid.css';

const CATEGORY_ORDER = ['protein', 'produce', 'dairy', 'grain', 'condiment', 'beverage', 'other'];
const CATEGORY_EMOJI = {
  protein: '🥩', produce: '🥬', dairy: '🧀',
  grain: '🌾', condiment: '🧂', beverage: '🥤', other: '📦',
};

function ConfidenceBadge({ score }) {
  const level = score >= 0.85 ? 'high' : score >= 0.70 ? 'medium' : 'low';
  return (
    <span className={`confidence-badge confidence-${level}`}>
      {Math.round(score * 100)}%
    </span>
  );
}

function FreshnessBadge({ freshness, daysLeft }) {
  if (freshness === 'expired') return <span className="freshness-badge freshness-expired">Expired</span>;
  if (freshness === 'nearing_expiry' || (daysLeft >= 0 && daysLeft <= 2))
    return <span className="freshness-badge freshness-warning">Expires {daysLeft === 1 ? 'tomorrow' : `in ${daysLeft}d`}</span>;
  if (freshness === 'unknown') return <span className="freshness-badge freshness-unknown">Unknown</span>;
  return <span className="freshness-badge freshness-fresh">Fresh</span>;
}

function InventoryItemCard({ item, onRemove, index }) {
  const [removing, setRemoving] = useState(false);
  const isUncertain = item.confidence < 0.70;

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.name), 300);
  };

  return (
    <div
      className={`inventory-card ${isUncertain ? 'uncertain' : ''} ${removing ? 'removing' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      id={`inventory-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="card-top">
        <span className="category-tag">
          {CATEGORY_EMOJI[item.category] || '📦'} {item.category}
        </span>
        <button className="remove-btn" onClick={handleRemove} aria-label={`Remove ${item.name}`}>
          <X size={14} />
        </button>
      </div>

      <h3 className="item-name">
        {isUncertain && <HelpCircle size={14} className="uncertain-icon" />}
        {item.name}
      </h3>

      <div className="item-meta">
        <span className="item-qty">{item.quantity} {item.unit}</span>
        <ConfidenceBadge score={item.confidence} />
      </div>

      <FreshnessBadge freshness={item.freshness} daysLeft={item.days_until_expiry} />
    </div>
  );
}

export default function InventoryGrid({ items, onConfirm, onRemoveItem, onAddItem }) {
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const grouped = {};
  CATEGORY_ORDER.forEach(cat => { grouped[cat] = []; });
  items.forEach(item => {
    const cat = CATEGORY_ORDER.includes(item.category) ? item.category : 'other';
    grouped[cat].push(item);
  });

  // Sort uncertain items to bottom of each group
  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => (a.confidence < 0.7 ? 1 : 0) - (b.confidence < 0.7 ? 1 : 0));
  });

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAddItem({
      name: newItemName.trim(),
      category: 'other',
      quantity: 1,
      unit: 'count',
      freshness: 'fresh',
      days_until_expiry: 7,
      confidence: 1.0,
      status: 'MANUAL',
    });
    setNewItemName('');
    setAddingItem(false);
  };

  let itemIndex = 0;

  return (
    <div className="inventory-container" id="inventory-grid">
      <div className="inventory-header">
        <h2>Your Fridge — {items.length} items detected</h2>
        <p className="inventory-subtitle">Review what we found. Remove anything wrong, add what we missed.</p>
      </div>

      <div className="inventory-groups">
        {CATEGORY_ORDER.map(cat => {
          if (grouped[cat].length === 0) return null;
          return (
            <div key={cat} className="category-group">
              <h3 className="category-title">
                {CATEGORY_EMOJI[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="category-count">{grouped[cat].length}</span>
              </h3>
              <div className="category-items">
                {grouped[cat].map(item => (
                  <InventoryItemCard
                    key={item.name}
                    item={item}
                    onRemove={onRemoveItem}
                    index={itemIndex++}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add item */}
      <div className="add-item-section">
        {addingItem ? (
          <div className="add-item-form">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name..."
              className="add-item-input"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              id="add-item-input"
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddItem}>Add</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setAddingItem(false)}>Cancel</button>
          </div>
        ) : (
          <button className="add-item-trigger" onClick={() => setAddingItem(true)} id="add-item-btn">
            <Plus size={16} /> Add an item we missed
          </button>
        )}
      </div>

      {/* Confirm button */}
      <div className="inventory-actions">
        <button
          className="btn btn-primary btn-lg"
          onClick={onConfirm}
          disabled={items.length < 2}
          id="confirm-inventory-btn"
        >
          <Check size={18} />
          Confirm & Get Recipe
        </button>
        {items.length < 2 && (
          <p className="min-items-hint">Add at least 2 items to continue</p>
        )}
      </div>
    </div>
  );
}
