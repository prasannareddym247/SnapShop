import React from 'react';

export default function OrderSuccessPage({ state }) {
  return (
    <div className="glam-page" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✓</div>
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '3rem', marginBottom: '0.5rem' }}>Order Confirmed!</h1>
      <p style={{ color: 'var(--glam-text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Thank you for your purchase! You'll receive a confirmation email shortly with your order details and tracking information.</p>
      <div style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '8px', padding: '1.5rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        <p style={{ color: 'var(--glam-text-muted)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>Order Number</p>
        <p style={{ fontFamily: 'var(--glam-accent-font)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--glam-primary)' }}>#GN-{String(Math.floor(1000 + Math.random() * 9000))}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="glam-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
        <button className="glam-btn-secondary" onClick={() => state.navigate('home')}>Back to Home</button>
      </div>
    </div>
  );
}
