import React from 'react';
export default function OrderSuccessPage({ state }) {
  return (
    <div className="bl-container" style={{ paddingTop: '5rem', paddingBottom: '5rem', textAlign: 'center', maxWidth: '500px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Order Confirmed!</h1>
      <p style={{ color: '#8a8a8a', marginBottom: '0.5rem' }}>Thank you for your order. You'll receive a confirmation shortly.</p>
      <p style={{ fontSize: '0.85rem', marginBottom: '2rem', color: '#c9a96e' }}>Order #BL-{(state.lastOrderId || Date.now()).toString(36).toUpperCase()}</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="bl-btn" onClick={() => state.navigate?.('home')}>Continue Shopping</button>
        <button className="bl-btn bl-btn-outline" onClick={() => state.navigate?.('account')}>View Orders</button>
      </div>
    </div>
  );
}
