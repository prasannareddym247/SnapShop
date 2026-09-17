import React from 'react';
export default function CartPage({ state }) {
  return (
    <div className="custom-page-container">
      <h2>Shopping Cart</h2>
      {state.cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
          <button className="custom-btn" style={{ marginTop: '1rem' }} onClick={() => state.navigate('category')}>Shop Products</button>
        </div>
      ) : (
        <div>
          {state.cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)', background: '#fff', marginBottom: '1rem', borderRadius: '0.5rem' }}>
              <div>
                <h4 style={{ margin: 0 }}>{item.name}</h4>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>₹{item.price} x {item.quantity}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => state.updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => state.updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                <button style={{ marginLeft: '1rem', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => state.removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '2px solid var(--border-color)', paddingTop: '1rem' }}>
            <h3>Total: ₹{state.cartTotal}</h3>
            <button className="custom-btn" onClick={() => state.navigate('checkout')}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}