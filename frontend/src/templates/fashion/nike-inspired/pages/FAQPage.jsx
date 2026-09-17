import React, { useState } from 'react';
const FAQS = [
  { q: 'What is your return policy?', a: 'Free returns within 30 days. Items must be unworn with tags attached.' },
  { q: 'How long does shipping take?', a: '3-5 business days standard. Express shipping available at ₹499.' },
  { q: 'Do you ship internationally?', a: 'Yes, to select countries. 7-14 business days. Duties may apply.' },
  { q: 'How do I find my size?', a: 'Refer to our Size Guide. Each product page includes specific measurements.' },
  { q: 'What payment methods do you accept?', a: 'All major cards, UPI, and Cash on Delivery.' },
];
export default function FAQPage({ state }) {
  const [open, setOpen] = useState(null);
  return (
    <main style={{ padding: '3rem 4%', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem' }}>FAQ</h1>
      {FAQS.map((f, i) => (
        <div key={i} className="zara-accordion-item">
          <button className="zara-accordion-btn" onClick={() => setOpen(open === i ? null : i)}>{f.q}<span>{open === i ? '−' : '+'}</span></button>
          {open === i && <div className="zara-accordion-content">{f.a}</div>}
        </div>
      ))}
    </main>
  );
}
