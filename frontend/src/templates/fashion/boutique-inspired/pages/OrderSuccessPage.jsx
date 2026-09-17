import React from 'react';

export default function OrderSuccessPage({ state }) {
  return (
    <div className="mb-page" style={{ textAlign: 'center', paddingTop: '5rem', maxWidth: '600px' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✓</div>
      <h1>Order Confirmed</h1>
      <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--mb-text-muted)' }}>Thank you for your purchase.</p>
      <p style={{ marginBottom: '2rem', color: 'var(--mb-text-muted)', fontWeight: 300 }}>
        Your order <strong style={{ color: 'var(--mb-text)' }}>#MB-{String(Math.floor(Math.random() * 90000) + 10000)}</strong> has been placed successfully.
        <br />You will receive a confirmation email shortly.
      </p>
      <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>
        <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.75rem' }}>What's Next?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { step: '1', text: 'You\'ll receive an order confirmation email' },
            { step: '2', text: 'We\'ll notify you when your order ships' },
            { step: '3', text: 'Estimated delivery: 3-5 business days' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--mb-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 500, flexShrink: 0, fontFamily: 'var(--mb-font-heading)' }}>{item.step}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--mb-text-muted)', fontWeight: 300 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="mb-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
        <button className="mb-btn-secondary" onClick={() => state.navigate('home')}>Return Home</button>
      </div>
    </div>
  );
}
