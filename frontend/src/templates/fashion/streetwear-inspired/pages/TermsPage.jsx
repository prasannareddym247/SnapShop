import React from 'react';

export default function TermsPage() {
  return (
    <div className="urban-page" style={{ maxWidth: '800px' }}>
      <h1>Terms & Conditions</h1>
      <p style={{ color: 'var(--sw-text-muted)', marginBottom: '2rem', fontWeight: 300 }}>Last updated: January 2026</p>
      {[
        { title: 'General', content: 'By using UrbanHype, you agree to these terms. All products are subject to availability and we reserve the right to limit quantities.' },
        { title: 'Pricing & Payments', content: 'All prices are in USD. We accept major credit cards, PayPal, and Apple Pay. Orders are processed upon payment confirmation.' },
        { title: 'Shipping', content: 'Delivery times are estimates. We are not responsible for delays caused by carriers or customs. Risk of loss passes to you upon delivery.' },
        { title: 'Returns & Refunds', content: 'Items can be returned within 30 days of delivery in unworn condition. Refunds are processed within 5-7 business days of receipt.' },
        { title: 'Intellectual Property', content: 'All content, logos, and designs are the property of UrbanHype. Unauthorized use is prohibited.' },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{section.title}</h2>
          <p style={{ color: 'var(--sw-text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{section.content}</p>
        </div>
      ))}
    </div>
  );
}
