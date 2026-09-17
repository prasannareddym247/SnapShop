import React from 'react';

const PRODUCT_LOOKUP = {
  mb1: { name: 'Radiant Complexion Serum', price: 85, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80' },
  mb2: { name: 'Velvet Matte Lip Colour', price: 42, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&auto=format&fit=crop&q=80' },
  mb3: { name: 'Nourishing Crème Luxe', price: 120, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&auto=format&fit=crop&q=80' },
  mb4: { name: 'Eau de Parfum Classique', price: 165, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=80' },
  mb5: { name: 'Silk Repair Hair Elixir', price: 68, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&auto=format&fit=crop&q=80' },
  mb6: { name: 'Golden Glow Face Palette', price: 78, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&auto=format&fit=crop&q=80' },
  mb7: { name: 'Crème Corporelle Essentielle', price: 95, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&auto=format&fit=crop&q=80' },
  mb8: { name: 'Volumizing Lash Mascara', price: 36, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=200&auto=format&fit=crop&q=80' },
};

export default function CartPage({ state }) {
  const cart = state.cart || [];
  const subtotal = cart.reduce((sum, item) => sum + (PRODUCT_LOOKUP[item.id]?.price || item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="mb-page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🛍️</div>
        <h1>Your Bag is Empty</h1>
        <p style={{ marginBottom: '2rem', fontWeight: 300 }}>Begin your luxury beauty journey with us.</p>
        <button className="mb-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="mb-page" style={{ maxWidth: '1100px' }}>
      <h1>Shopping Bag</h1>
      <div className="mb-two-col" style={{ alignItems: 'start' }}>
        <div>
          {cart.map((item, i) => {
            const prod = PRODUCT_LOOKUP[item.id] || item;
            return (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.5rem 0', borderBottom: '1px solid var(--mb-border)' }}>
                <img src={prod.image} alt={prod.name} style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '8px', background: 'var(--mb-bg-alt)' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.25rem' }}>{prod.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--mb-text-muted)', marginBottom: '0.75rem', fontWeight: 300 }}>${prod.price}</div>
                  <div className="mb-cart-qty">
                    <button onClick={() => state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1))}>−</button>
                    <span>{item.qty || 1}</span>
                    <button onClick={() => state.updateCartItem(item.id, (item.qty || 1) + 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mb-font-heading)', fontWeight: 600, color: 'var(--mb-text)' }}>${((prod.price || 0) * (item.qty || 1)).toFixed(2)}</div>
                  <button onClick={() => state.removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--mb-text-muted)', cursor: 'pointer', fontSize: '0.78rem', marginTop: '0.5rem', fontFamily: 'var(--mb-font-body)' }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--mb-text-muted)' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--mb-text-muted)' }}><span>Shipping</span><span>{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mb-text)', borderTop: '1px solid var(--mb-border)', paddingTop: '1rem' }}><span>Total</span><span style={{ color: 'var(--mb-secondary)' }}>${total.toFixed(2)}</span></div>
          <button className="mb-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => state.navigate('checkout')}>Secure Checkout</button>
          <button className="mb-btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }} onClick={() => state.navigate('category')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
