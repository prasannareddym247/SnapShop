import React from 'react';

const PRODUCT_IMAGES = {
  sw1: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&auto=format&fit=crop&q=80',
  sw2: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&auto=format&fit=crop&q=80',
  sw3: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&auto=format&fit=crop&q=80',
  sw4: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&auto=format&fit=crop&q=80',
  sw5: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&auto=format&fit=crop&q=80',
};

export default function CartPage({ state }) {
  const items = state.cart || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="urban-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '3rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '2rem' }}>Shopping Bag ({items.length})</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--sw-text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Your bag is empty</p>
          <button className="urban-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div>
            {items.map((item, i) => {
              const img = PRODUCT_IMAGES[item.id] || item.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&auto=format&fit=crop&q=80';
              return (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.5rem 0', borderBottom: '1px solid var(--sw-border)' }}>
                  <img src={img} alt={item.name} style={{ width: '100px', height: '130px', objectFit: 'cover', background: 'var(--sw-bg-alt)' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--sw-accent-font)', fontSize: '1rem', color: 'var(--sw-text)', marginBottom: '0.25rem' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--sw-text-muted)', marginBottom: '0.5rem' }}>${item.price}</p>
                    <div className="urban-cart-qty">
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1)); }}>−</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, (item.qty || 1) + 1); }}>+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--sw-accent-font)', fontWeight: 700, color: 'var(--sw-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>${((item.price || 0) * (item.qty || 1)).toFixed(2)}</div>
                    <button onClick={() => { if (state.removeFromCart) state.removeFromCart(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--sw-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '1.5rem', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <h2 style={{ fontFamily: 'var(--sw-heading)', fontSize: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Order Summary</h2>
            <div className="urban-cart-totals">
              <div className="urban-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="urban-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="urban-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
            </div>
            <button className="urban-cart-checkout-btn" onClick={() => state.navigate('checkout')}>Checkout →</button>
            <button className="urban-cart-view-btn" onClick={() => state.navigate('category')}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
