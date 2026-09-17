import React from 'react';
export default function FAQPage({ state }) {
  const faqs = [
    { q: 'How long does delivery take?', a: 'Typically 2-5 business days depending on location.' },
    { q: 'Do you offer returns?', a: 'Yes, we have a clean 15-day refund policy.' },
    { q: 'Can I track my shipment?', a: 'Yes, a tracking link is sent via SMS once dispatched.' }
  ];

  return (
    <div className="custom-page-container">
      <h2>Frequently Asked Questions</h2>
      <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4>❓ {f.q}</h4>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}