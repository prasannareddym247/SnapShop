import React, { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="urban-page" style={{ maxWidth: '700px' }}>
      <h1>Contact Us</h1>
      <p style={{ color: 'var(--sw-text-muted)', marginBottom: '2rem', fontWeight: 300 }}>Got a question? Drop us a message and we'll get back within 24 hours.</p>
      {sent ? (
        <div style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-success)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--sw-success)', fontWeight: 600, fontSize: '1.1rem' }}>✓ Message sent! We'll be in touch soon.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input placeholder="First Name" style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '0.85rem 1rem', color: 'var(--sw-text)', fontFamily: 'var(--sw-body)', outline: 'none', fontSize: '0.9rem' }} />
            <input placeholder="Last Name" style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '0.85rem 1rem', color: 'var(--sw-text)', fontFamily: 'var(--sw-body)', outline: 'none', fontSize: '0.9rem' }} />
          </div>
          <input placeholder="Email" style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '0.85rem 1rem', color: 'var(--sw-text)', fontFamily: 'var(--sw-body)', outline: 'none', fontSize: '0.9rem' }} />
          <textarea placeholder="Message" rows={5} style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '0.85rem 1rem', color: 'var(--sw-text)', fontFamily: 'var(--sw-body)', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }} />
          <button className="urban-btn-primary" onClick={() => setSent(true)} style={{ alignSelf: 'flex-start' }}>Send Message →</button>
        </div>
      )}
    </div>
  );
}
