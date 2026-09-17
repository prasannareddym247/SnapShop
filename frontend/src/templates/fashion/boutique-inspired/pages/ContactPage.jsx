import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="mb-page" style={{ maxWidth: '800px' }}>
      <h1>Contact Us</h1>
      <p style={{ marginBottom: '2rem', fontWeight: 300 }}>Our beauty concierge is at your service. We look forward to hearing from you.</p>
      <div className="mb-two-col" style={{ gap: '2rem' }}>
        <div>
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Send a Message</h2>
            {[{ k: 'name', label: 'Name', type: 'text' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'subject', label: 'Subject', type: 'text' }].map(f => (
              <div key={f.k} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mb-text-muted)', marginBottom: '0.3rem' }}>{f.label}</label>
                <input type={f.type} value={form[f.k]} onChange={e => update(f.k, e.target.value)}
                  style={{ width: '100%', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mb-text-muted)', marginBottom: '0.3rem' }}>Message</label>
              <textarea value={form.message} onChange={e => update('message', e.target.value)} rows={4}
                style={{ width: '100%', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button className="mb-btn-primary" onClick={() => { if (form.name && form.email && form.message) { alert('Thank you for reaching out. Our concierge will respond within 24 hours.'); setForm({ name: '', email: '', subject: '', message: '' }); } else { alert('Please complete all fields.'); } }}>Send Message</button>
          </div>
        </div>
        <div>
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1rem' }}>Our Atelier</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '📍', text: '24 Rue de la Paix\nParis, 75002, France' },
                { icon: '📧', text: 'concierge@maisondebeaute.com' },
                { icon: '📞', text: '+33 (0)1 23 45 67 89' },
                { icon: '🕐', text: 'Monday - Saturday: 10AM - 7PM\nSunday: By appointment' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--mb-text-muted)', lineHeight: 1.6, whiteSpace: 'pre-line', fontWeight: 300 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.75rem' }}>Concierge Service</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--mb-text-muted)', marginBottom: '1rem', fontWeight: 300 }}>For personalized assistance, our beauty concierge is available to help with product selections, gift recommendations, and any other inquiries.</p>
            <button className="mb-btn-secondary" onClick={() => window.location.hash = '#/faq'}>View FAQs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
