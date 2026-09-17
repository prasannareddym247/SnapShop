import React from 'react';

const PRODUCT_IMAGES = {
  gn1: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80',
  gn2: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&auto=format&fit=crop&q=80',
  gn3: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&auto=format&fit=crop&q=80',
  gn4: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=80',
  gn5: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&auto=format&fit=crop&q=80',
};

export default function CartPage({ state }) {
  const items = state.cart || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="glam-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2.5rem', marginBottom: '2rem' }}>Shopping Bag ({items.length})</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--glam-text-muted)', marginBottom: '2rem' }}>Your bag is empty</p>
          <button className="glam-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div>
            {items.map((item, i) => {
              const img = PRODUCT_IMAGES[item.id] || item.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80';
              return (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.5rem 0', borderBottom: '1px solid var(--glam-border)' }}>
                  <img src={img} alt={item.name} style={{ width: '90px', height: '110px', objectFit: 'cover', borderRadius: '6px', background: 'var(--glam-bg)' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--glam-accent-font)', fontSize: '1rem', color: 'var(--glam-text)', marginBottom: '0.25rem' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--glam-text-muted)', marginBottom: '0.5rem' }}>${item.price}</p>
                    <div className="glam-cart-qty">
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1)); }}>−</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, (item.qty || 1) + 1); }}>+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--glam-accent-font)', fontWeight: 700, color: 'var(--glam-primary)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>${((item.price || 0) * (item.qty || 1)).toFixed(2)}</div>
                    <button onClick={() => { if (state.removeFromCart) state.removeFromCart(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--glam-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '8px', padding: '1.5rem', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <h2 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Order Summary</h2>
            <div className="glam-cart-totals">
              <div className="glam-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="glam-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="glam-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
            </div>
            <button className="glam-cart-checkout-btn" onClick={() => state.navigate('checkout')}>Checkout →</button>
            <button className="glam-cart-view-btn" onClick={() => state.navigate('category')}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
