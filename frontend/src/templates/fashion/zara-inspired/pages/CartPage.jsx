import React, { useState } from 'react';

export default function CartPage({ state }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const cartArray = Array.isArray(state.cart) ? state.cart : [];

  const subtotal = state.cartTotal || cartArray.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 5000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.05);
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = subtotal + shipping + tax - promoDiscount;

  const handlePromoApply = () => {
    if (promoCode.trim().toUpperCase() === 'ZARA10') {
      setPromoApplied(true);
    }
  };

  if (cartArray.length === 0) {
    return (
      <main className="zara-template" style={{ padding: '4rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="zara-empty-state">
          <div className="zara-empty-icon">🛍</div>
          <h2 className="zara-empty-title">Your shopping bag is empty</h2>
          <p className="zara-empty-desc">Discover pieces you'll love from our latest collection.</p>
          <button className="zara-btn zara-btn-dark" onClick={() => state.navigate('category')}>Continue Shopping</button>
        </div>
      </main>
    );
  }

  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 300, marginBottom: '2rem' }}>Shopping Bag ({cartArray.length} items)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        <div>
          {cartArray.map((item, idx) => (
            <div key={item.id || idx} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid #e8e8e8' }}>
              <img
                src={item.image || `https://placehold.co/120x150/f5f5f5/aaa?text=Item`}
                alt={item.name}
                style={{ width: '120px', height: '150px', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                {item.brand && <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#757575', marginBottom: '0.25rem' }}>{item.brand}</div>}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: '0 0 0.25rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#757575', margin: '0 0 0.5rem' }}>
                  {item.size && `Size: ${item.size}`}{item.size && item.color && ' | '}{item.color && `Color: ${item.color}`}
                </p>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>₹{item.price}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div className="zara-cart-qty">
                    <button className="zara-cart-qty-btn" onClick={() => state.updateCartQuantity?.(item.id, Math.max(1, (item.quantity || 1) - 1))}>−</button>
                    <span className="zara-cart-qty-value">{item.quantity || 1}</span>
                    <button className="zara-cart-qty-btn" onClick={() => state.updateCartQuantity?.(item.id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <button className="zara-cart-remove" onClick={() => state.removeFromCart?.(item.id)}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                ₹{(item.price * (item.quantity || 1)).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fafafa', padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 1.5rem' }}>Order Summary</h3>

          <div className="zara-cart-promo">
            <input className="zara-cart-promo-input" placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            <button className="zara-cart-promo-btn" onClick={handlePromoApply}>Apply</button>
          </div>
          {promoApplied && <p style={{ fontSize: '0.75rem', color: '#000', marginBottom: '1rem' }}>✓ Promo ZARA10 applied</p>}

          <div className="zara-cart-totals">
            <div className="zara-cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="zara-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="zara-cart-total-row"><span>Tax (5%)</span><span>₹{tax.toLocaleString()}</span></div>
            {promoDiscount > 0 && <div className="zara-cart-total-row"><span>Promo Discount</span><span>-₹{promoDiscount.toLocaleString()}</span></div>}
            <div className="zara-cart-total-row grand"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>

          <button className="zara-checkout-btn" onClick={() => state.navigate('checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
