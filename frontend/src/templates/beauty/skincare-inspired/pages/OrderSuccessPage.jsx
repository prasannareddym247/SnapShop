import React from 'react';

export default function OrderSuccessPage({ state }) {
  return (
    <div className="pure-page" style={{ textAlign: 'center', paddingTop: '5rem', maxWidth: '600px' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✓</div>
      <h1>Order Confirmed!</h1>
      <p style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--pure-text-muted)' }}>Thank you for your purchase.</p>
      <p style={{ marginBottom: '2rem', color: 'var(--pure-text-muted)' }}>
        Your order <strong style={{ color: 'var(--pure-text)' }}>#PS-{String(Math.floor(Math.random() * 90000) + 10000)}</strong> has been placed successfully.
        <br />You will receive a confirmation email shortly.
      </p>
      <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', textAlign: 'left' }}>
        <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.75rem' }}>What's Next?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { step: '1', text: 'You\'ll receive an order confirmation email' },
            { step: '2', text: 'We\'ll notify you when your order ships' },
            { step: '3', text: 'Estimated delivery: 5-7 business days' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--pure-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>{item.step}</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="pure-btn-primary" onClick={() => state.navigate('category')}>Continue Shopping</button>
        <button className="pure-btn-secondary" onClick={() => state.navigate('home')}>Back to Home</button>
      </div>
    </div>
  );
}
