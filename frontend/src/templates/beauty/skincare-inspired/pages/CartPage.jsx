import React from 'react';

const PRODUCT_LOOKUP = {
  ps1: { name: 'Gentle Foaming Cleanser', price: 28, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&auto=format&fit=crop&q=80' },
  ps2: { name: 'Vitamin C Bright Serum', price: 48, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80' },
  ps3: { name: 'Dewy Moisture Cream', price: 42, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&auto=format&fit=crop&q=80' },
  ps4: { name: 'Mineral Sunscreen SPF 50', price: 32, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&auto=format&fit=crop&q=80' },
  ps5: { name: 'Hydra Sheet Mask Set', price: 22, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&auto=format&fit=crop&q=80' },
  ps6: { name: 'Nourish Eye Cream', price: 36, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&auto=format&fit=crop&q=80' },
  ps7: { name: 'Soothing Toner Mist', price: 26, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=200&auto=format&fit=crop&q=80' },
  ps8: { name: 'Retinol Night Serum', price: 58, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80' },
};

export default function CartPage({ state }) {
  const cart = state.cart || [];
  const subtotal = cart.reduce((sum, item) => sum + (PRODUCT_LOOKUP[item.id]?.price || item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 60 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="pure-page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🛍️</div>
        <h1>Your Bag is Empty</h1>
        <p style={{ marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
        <button className="pure-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="pure-page" style={{ maxWidth: '1100px' }}>
      <h1>Shopping Bag</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
        <div>
          {cart.map((item, i) => {
            const prod = PRODUCT_LOOKUP[item.id] || item;
            return (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.5rem 0', borderBottom: '1px solid var(--pure-border)' }}>
                <img src={prod.image} alt={prod.name} style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '8px', background: 'var(--pure-bg-alt)' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.25rem' }}>{prod.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--pure-text-muted)', marginBottom: '0.75rem' }}>${prod.price}</div>
                  <div className="pure-cart-qty">
                    <button onClick={() => state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1))}>−</button>
                    <span>{item.qty || 1}</span>
                    <button onClick={() => state.updateCartItem(item.id, (item.qty || 1) + 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--pure-heading)', fontWeight: 600, color: 'var(--pure-text)' }}>${((prod.price || 0) * (item.qty || 1)).toFixed(2)}</div>
                  <button onClick={() => state.removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--pure-error)', cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.5rem', fontFamily: 'var(--pure-body)' }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--pure-text-muted)' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--pure-text-muted)' }}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--pure-text)', borderTop: '1px solid var(--pure-border)', paddingTop: '1rem' }}><span>Total</span><span style={{ color: 'var(--pure-primary)' }}>${total.toFixed(2)}</span></div>
          <button className="pure-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => state.navigate('checkout')}>Proceed to Checkout</button>
          <button className="pure-btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }} onClick={() => state.navigate('category')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
