import React from 'react';

export default function TermsPage() {
  return (
    <div className="glam-page" style={{ maxWidth: '800px' }}>
      <h1>Terms & Conditions</h1>
      <p style={{ color: 'var(--glam-text-muted)', marginBottom: '2rem' }}>Last updated: January 2026</p>
      {[
        { title: 'General', content: 'By using Glamour Nykaa, you agree to these terms. All products are subject to availability.' },
        { title: 'Pricing & Payments', content: 'All prices are in USD. We accept major credit cards, PayPal, and Apple Pay.' },
        { title: 'Shipping', content: 'Delivery estimates are provided at checkout. Risk of loss passes upon delivery.' },
        { title: 'Returns & Refunds', content: 'Items may be returned within 30 days in unused condition. Refunds are processed within 5-7 business days.' },
        { title: 'Intellectual Property', content: 'All content, logos, and designs are property of Glamour Nykaa.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{s.title}</h2>
          <p style={{ color: 'var(--glam-text-muted)', lineHeight: 1.7 }}>{s.content}</p>
        </div>
      ))}
    </div>
  );
}
