import React, { useState } from 'react';
export default function ContactPage({ state }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main style={{ padding: '3rem 4%', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contact</h1>
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}><p style={{ color: '#757575' }}>Message sent. We'll be in touch.</p>
          <button className="sp-btn" style={{ marginTop: '1rem' }} onClick={() => state.navigate('home')}>Home</button></div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="zara-form-group"><label className="zara-form-label">Name</label><input className="zara-form-input" required /></div>
            <div className="zara-form-group"><label className="zara-form-label">Email</label><input className="zara-form-input" type="email" required /></div>
          </div>
          <div className="zara-form-group"><label className="zara-form-label">Message</label><textarea className="zara-form-input" style={{ minHeight: '100px' }} required /></div>
          <button type="submit" className="sp-btn">Send</button>
        </form>
      )}
    </main>
  );
}
