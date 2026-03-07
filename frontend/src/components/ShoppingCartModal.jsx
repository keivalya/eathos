import { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, X, ExternalLink, Loader } from 'lucide-react';
import './ShoppingCartModal.css';

export default function ShoppingCartModal({ missingIngredients, onClose, onAddToCart }) {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'success'

  useEffect(() => {
    // Simulate API call to Instacart/shopping service
    const timer = setTimeout(() => {
      setPhase('success');
      if (onAddToCart) onAddToCart();
    }, 2500); // 2.5s fake loading

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cart-modal-overlay">
      <div className="cart-modal">
        <button className="cart-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {phase === 'loading' ? (
          <div className="cart-loading-state">
            <div className="cart-spinner-container">
              <ShoppingCart size={48} className="cart-icon pulsing" />
              <Loader size={24} className="spinner rotate" />
            </div>
            <h3>Building Your Cart...</h3>
            <p>Finding the freshest ingredients at your local store.</p>
            
            <ul className="cart-loading-list">
              {missingIngredients.map((ing, i) => (
                <li key={i} style={{ animationDelay: `${i * 150}ms` }}>
                  Adding {ing.name}...
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="cart-success-state">
            <CheckCircle size={56} className="success-icon slide-up" />
            <h3 className="slide-up">Cart Ready!</h3>
            <p className="slide-up">We added {missingIngredients.length} items to your cart.</p>
            
            <div className="cart-items-preview slide-up">
              {missingIngredients.map((ing, i) => {
                // Generate a fake price for realism based on name length or static
                const fakePrice = ((ing.name.length % 5) + 2.99).toFixed(2);
                return (
                  <div key={i} className="cart-item">
                    <span className="cart-item-qty">{ing.quantity} {ing.unit}</span>
                    <span className="cart-item-name">{ing.name}</span>
                    <span className="cart-item-price">${fakePrice}</span>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn btn-primary btn-lg slide-up w-full mt-4" 
              onClick={() => {
                window.open('https://instacart.com', '_blank');
                onClose();
              }}
            >
              Checkout on Instacart <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
