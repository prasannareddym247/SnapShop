import React, { useState } from 'react';

const FAQS = [
  { q: 'How do I place an order?', a: 'Simply browse our collection, add items to your bag, and proceed to checkout. You can pay with credit card, PayPal, or Apple Pay.' },
  { q: 'What is your shipping policy?', a: 'We offer free shipping on orders over $100. Standard delivery takes 3-5 business days. Express shipping is available at checkout.' },
  { q: 'Can I return or exchange items?', a: 'Yes! We offer 30-day returns for unworn items in original packaging. Start a return from your account or contact support.' },
  { q: 'When do new drops happen?', a: 'New drops launch every Friday at 10 AM EST. Limited edition releases are announced via our newsletter and social media.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number via email. You can also check order status in your account.' },
  { q: 'Do you ship internationally?', a: 'Yes, we ship to select international destinations. Shipping rates and delivery times vary by location.' },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="urban-page" style={{ maxWidth: '800px' }}>
      <h1>FAQs</h1>
      <p style={{ color: 'var(--sw-text-muted)', marginBottom: '2rem', fontWeight: 300 }}>Find answers to common questions below.</p>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--sw-border)' }}>
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--sw-text)', padding: '1.25rem 0', cursor: 'pointer', fontFamily: 'var(--sw-accent-font)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
            {faq.q} <span style={{ color: 'var(--sw-primary)', fontSize: '1.2rem' }}>{openIdx === i ? '−' : '+'}</span>
          </button>
          {openIdx === i && <p style={{ color: 'var(--sw-text-muted)', padding: '0 0 1.25rem', lineHeight: 1.7, fontWeight: 300 }}>{faq.a}</p>}
        </div>
      ))}
    </div>
  );
}
