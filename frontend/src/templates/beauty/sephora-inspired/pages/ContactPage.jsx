import React, { useState } from 'react';
export default function ContactPage({ state }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="bl-container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Get in Touch</h1>
      <p style={{ color: '#8a8a8a', marginBottom: '2rem' }}>We'd love to hear from you — beauty questions, feedback, or just to say hi.</p>
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: '#8a8a8a', marginBottom: '1rem' }}>Message sent! We'll be in touch soon. ✨</p>
          <button className="bl-btn" onClick={() => state.navigate?.('home')}>Back to Home</button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="bl-form-group"><label className="bl-form-label">Name</label><input className="bl-form-input" required /></div>
            <div className="bl-form-group"><label className="bl-form-label">Email</label><input className="bl-form-input" type="email" required /></div>
          </div>
          <div className="bl-form-group"><label className="bl-form-label">Message</label><textarea className="bl-form-input" style={{ minHeight: '120px', fontFamily: 'inherit' }} required /></div>
          <button type="submit" className="bl-btn">Send Message</button>
        </form>
      )}
    </div>
  );
}
