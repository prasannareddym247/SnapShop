import React from 'react';

export default function OrderSuccessPage({ state }) {
  return (
    <div className="urban-page" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
      <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '4rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Order Placed!</h1>
      <p style={{ color: 'var(--sw-text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', fontWeight: 300 }}>Your order has been confirmed. You'll receive a confirmation email shortly with tracking details.</p>
      <div style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '1.5rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        <p style={{ color: 'var(--sw-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Order Number</p>
        <p style={{ fontFamily: 'var(--sw-accent-font)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--sw-primary)' }}>#UH-{String(Math.floor(1000 + Math.random() * 9000))}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="urban-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
        <button className="urban-btn-secondary" onClick={() => state.navigate('home')}>Back to Home</button>
      </div>
    </div>
  );
}
