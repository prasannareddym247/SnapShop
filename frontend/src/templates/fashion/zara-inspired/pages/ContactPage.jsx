import React, { useState } from 'react';

export default function ContactPage({ state }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
    }
  };

  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Contact Us</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>We'd love to hear from you</p>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 400 }}>Message Sent</h2>
          <p style={{ color: '#757575', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
          <button className="zara-btn zara-btn-dark" onClick={() => state.navigate('home')}>Back to Home</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="zara-form-group">
              <label className="zara-form-label">Name</label>
              <input className="zara-form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="zara-form-group">
              <label className="zara-form-label">Email</label>
              <input className="zara-form-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="zara-form-group">
            <label className="zara-form-label">Subject</label>
            <input className="zara-form-input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          </div>
          <div className="zara-form-group">
            <label className="zara-form-label">Message</label>
            <textarea
              className="zara-form-input"
              style={{ minHeight: '120px', resize: 'vertical', border: 'none', borderBottom: '1px solid #e8e8e8', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: '0.9rem', background: 'transparent', color: '#111' }}
              required
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>
          <button type="submit" className="zara-btn zara-btn-dark" style={{ marginTop: '1rem' }}>Send Message</button>
        </form>
      )}

      <div style={{ marginTop: '3rem', padding: '2rem 0', borderTop: '1px solid #e8e8e8' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Visit Us</h3>
        <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: '1.8' }}>
          ZARA MODE Flagship Store<br />
          42 Fashion Avenue, Bandra West<br />
          Mumbai, Maharashtra 400050<br />
          India
        </p>
        <p style={{ fontSize: '0.85rem', color: '#757575', marginTop: '0.5rem' }}>
          Email: hello@zaramode.com<br />
          Phone: +91 22 4567 8900
        </p>
      </div>
    </main>
  );
}
