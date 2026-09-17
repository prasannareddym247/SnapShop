import React from 'react';

export default function CartPage({ state }) {
  const items = state.cart || [];
  const total = items.reduce((s, i) => s + (i.price || i.variant?.price || 0) * i.quantity, 0);

  if (!items.length) {
    return (
      <div className="bl-container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🛍️</div>
        <h2 style={{ fontFamily: 'var(--bl-font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>Your Bag is Empty</h2>
        <p style={{ color: '#8a8a8a', marginBottom: '1.5rem' }}>Discover our latest beauty essentials and add them to your bag.</p>
        <button className="bl-btn" onClick={() => state.navigate?.('category')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="bl-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Shopping Bag ({items.length})</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
        <div>
          {items.map((item, idx) => (
            <div key={item.id || idx} style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem 0', borderBottom: '1px solid var(--bl-border)' }}>
              <img src={item.image || `https://placehold.co/120x150/f8f5f1/8a8a8a?text=P`} alt={item.name}
                style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0, background: '#f8f5f1' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{item.brand || 'Luxe Beauty'}</div>
                <h3 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{item.name}</h3>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>₹{(item.price || item.variant?.price || 0).toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="bl-qty-selector" style={{ marginBottom: 0 }}>
                    <button onClick={() => item.quantity > 1 && state.updateCartQuantity?.(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => state.updateCartQuantity?.(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => state.removeFromCart?.(item.id)} style={{ background: 'none', border: 'none', color: '#8a8a8a', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}>Remove</button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>₹{((item.price || item.variant?.price || 0) * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f8f5f1', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#8a8a8a' }}>Subtotal</span><span style={{ fontWeight: 600 }}>₹{total.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#8a8a8a' }}>Shipping</span><span style={{ fontWeight: 600, color: '#4caf50' }}>Free</span>
          </div>
          <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--bl-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem' }}>
            <span>Total</span><span>₹{total.toLocaleString()}</span>
          </div>
          <button className="bl-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }}
            onClick={() => state.navigate?.('checkout')}>
            Proceed to Checkout
          </button>
          <button className="bl-btn bl-btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
            onClick={() => state.navigate?.('home')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
