import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="pure-page" style={{ maxWidth: '800px' }}>
      <h1>Contact Us</h1>
      <p style={{ marginBottom: '2rem' }}>Have a question about our products or your order? We're here to help.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Send Us a Message</h2>
            {[{ k: 'name', label: 'Name', type: 'text' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'subject', label: 'Subject', type: 'text' }].map(f => (
              <div key={f.k} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--pure-text-muted)', marginBottom: '0.3rem' }}>{f.label}</label>
                <input type={f.type} value={form[f.k]} onChange={e => update(f.k, e.target.value)}
                  style={{ width: '100%', background: '#fff', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '0.7rem 1rem', fontFamily: 'var(--pure-body)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--pure-text-muted)', marginBottom: '0.3rem' }}>Message</label>
              <textarea value={form.message} onChange={e => update('message', e.target.value)} rows={4}
                style={{ width: '100%', background: '#fff', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '0.7rem 1rem', fontFamily: 'var(--pure-body)', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button className="pure-btn-primary" onClick={() => { if (form.name && form.email && form.message) { alert('Thank you! We\'ll get back to you within 24 hours.'); setForm({ name: '', email: '', subject: '', message: '' }); } else { alert('Please fill in all required fields.'); } }}>Send Message</button>
          </div>
        </div>
        <div>
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1rem' }}>Visit Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)' }}>123 Glow Street, Suite 100<br />Los Angeles, CA 90001</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📧</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)' }}>hello@pureskinglow.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📞</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)' }}>+1 (800) 555-SKIN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🕐</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)' }}>Mon-Fri: 9AM - 6PM PST<br />Sat: 10AM - 4PM PST</span>
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.75rem' }}>FAQs</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)', marginBottom: '1rem' }}>For quick answers, visit our FAQ page.</p>
            <button className="pure-btn-secondary" onClick={() => window.location.hash = '#/faq'}>View FAQs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
