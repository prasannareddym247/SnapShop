import React, { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="glam-page" style={{ maxWidth: '700px' }}>
      <h1>Contact Us</h1>
      <p style={{ color: 'var(--glam-text-muted)', marginBottom: '2rem' }}>We'd love to hear from you. Drop us a message and we'll respond within 24 hours.</p>
      {sent ? (
        <div style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-success)', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--glam-success)', fontWeight: 600 }}>✓ Message sent! We'll be in touch soon.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input placeholder="First Name" style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
            <input placeholder="Last Name" style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
          </div>
          <input placeholder="Email" style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
          <textarea placeholder="Message" rows={5} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }} />
          <button className="glam-btn-primary" onClick={() => setSent(true)} style={{ alignSelf: 'flex-start' }}>Send Message →</button>
        </div>
      )}
    </div>
  );
}
