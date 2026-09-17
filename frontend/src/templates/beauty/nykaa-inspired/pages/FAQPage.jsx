import React, { useState } from 'react';

const FAQS = [
  { q: 'How do I place an order?', a: 'Simply browse our collection, add your favorite products to the bag, and proceed to checkout. We accept credit cards, PayPal, and Apple Pay.' },
  { q: 'What is your shipping policy?', a: 'Free shipping on all orders over $75. Standard delivery takes 3-5 business days. Express shipping is available at checkout.' },
  { q: 'Can I return or exchange products?', a: 'Yes! We offer 30-day returns on unused products in original packaging. Start a return from your account or contact our support team.' },
  { q: 'Are your products authentic?', a: 'Absolutely. All products are sourced directly from authorized brands and distributors. We guarantee 100% authenticity.' },
  { q: 'Do you ship internationally?', a: 'We ship to select countries worldwide. Shipping rates and delivery times vary by destination.' },
  { q: 'How do I track my order?', a: 'You\'ll receive a tracking number via email once your order ships. You can also track it from your account dashboard.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);
  return (
    <div className="glam-page" style={{ maxWidth: '800px' }}>
      <h1>FAQs</h1>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--glam-border)' }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--glam-text)', padding: '1.25rem 0', cursor: 'pointer', fontFamily: 'var(--glam-accent-font)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', textAlign: 'left' }}>
            {faq.q} <span style={{ color: 'var(--glam-primary)', fontSize: '1.1rem' }}>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <p style={{ color: 'var(--glam-text-muted)', padding: '0 0 1.25rem', lineHeight: 1.7 }}>{faq.a}</p>}
        </div>
      ))}
    </div>
  );
}
