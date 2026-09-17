import React from 'react';
export default function OrderSuccessPage({ state }) {
  return (
    <main style={{ padding: '5rem 4%', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#00e676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, margin: '0 auto 1.5rem' }}>✓</div>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Order Confirmed</h1>
      <p style={{ color: '#757575', marginBottom: '0.5rem' }}>Thank you. Your order is being processed.</p>
      <p style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>Order #SP-{(state.lastOrderId || Date.now()).toString(36).toUpperCase()}</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="sp-btn" onClick={() => state.navigate('home')}>Continue Shopping</button>
        <button className="sp-btn-secondary" onClick={() => state.navigate('account')}>View Orders</button>
      </div>
    </main>
  );
}
