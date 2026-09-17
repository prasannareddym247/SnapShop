import React from 'react';

export default function CartPage({ state }) {
  const cartArray = Array.isArray(state.cart) ? state.cart : [];
  const subtotal = state.cartTotal || cartArray.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = subtotal > 5000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + tax;

  if (cartArray.length === 0) {
    return (
      <main style={{ padding: '4rem 4%', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>🏃</div>
        <h2 style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Your Bag is Empty</h2>
        <p style={{ color: '#757575', marginBottom: '1.5rem' }}>Gear up with our latest performance collection.</p>
        <button className="sp-btn" onClick={() => state.navigate('category')}>Continue Shopping</button>
      </main>
    );
  }

  return (
    <main style={{ padding: '3rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem' }}>Shopping Bag ({cartArray.length})</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>
        <div>
          {cartArray.map((item, idx) => (
            <div key={item.id || idx} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem 0', borderBottom: '1px solid #e0e0e0' }}>
              <img src={item.image || `https://placehold.co/100x130/f5f5f5/aaa?text=Item`} alt={item.name} style={{ width: '100px', height: '130px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="sp-product-brand">{item.brand}</div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#757575', margin: '0 0 0.5rem' }}>{item.size ? `Size: ${item.size}` : ''}{item.size && item.color ? ' | ' : ''}{item.color || ''}</p>
                <p className="sp-product-price">₹{item.price}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div className="zara-cart-qty">
                    <button className="zara-cart-qty-btn" onClick={() => state.updateCartQuantity?.(item.id, Math.max(1, (item.quantity || 1) - 1))}>−</button>
                    <span className="zara-cart-qty-value">{item.quantity || 1}</span>
                    <button className="zara-cart-qty-btn" onClick={() => state.updateCartQuantity?.(item.id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <button className="zara-cart-remove" onClick={() => state.removeFromCart?.(item.id)}>Remove</button>
                </div>
              </div>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>₹{(item.price * (item.quantity || 1)).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f5f5f5', padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 1rem' }}>Order Summary</h3>
          <div className="zara-cart-totals">
            <div className="zara-cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="zara-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="zara-cart-total-row"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="zara-cart-total-row grand"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>
          <button className="sp-btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => state.navigate('checkout')}>Checkout</button>
        </div>
      </div>
    </main>
  );
}
