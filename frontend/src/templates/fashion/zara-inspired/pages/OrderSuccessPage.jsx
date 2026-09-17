import React from 'react';

export default function OrderSuccessPage({ state }) {
  return (
    <main className="zara-template" style={{ padding: '5rem 4%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1.5rem' }}>
        ✓
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 300, margin: '0 0 0.5rem' }}>Order Confirmed</h1>
      <p style={{ color: '#757575', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Thank you for your purchase. Your order has been placed successfully.</p>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>
        Order #ZARA-{(state.lastOrderId || Date.now()).toString(36).toUpperCase()}
      </p>
      <p style={{ fontSize: '0.8rem', color: '#757575', marginBottom: '2rem' }}>
        A confirmation email will be sent shortly. You can track your order from your account.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="zara-btn zara-btn-dark" onClick={() => state.navigate('home')}>Continue Shopping</button>
        <button className="zara-btn" style={{ border: '1px solid #000', color: '#000' }} onClick={() => state.navigate('account')}>View Orders</button>
      </div>
    </main>
  );
}
