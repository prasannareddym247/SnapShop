import React, { useState } from 'react';
const FAQS = [
  { q: 'What is your return policy?', a: 'We offer free returns within 30 days. Products must be unopened and in original packaging. Refunds are processed within 5-7 business days.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to select countries worldwide. International delivery takes 7-14 business days. Duties and taxes may apply.' },
  { q: 'How long does domestic shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping is available at ₹499 and delivers within 1-2 business days.' },
  { q: 'Are your products cruelty-free?', a: 'Yes, all Beauty Luxe products are 100% cruelty-free. We never test on animals and partner with like-minded brands.' },
  { q: 'How do I find the right shade?', a: 'Check our Shade Finder tool on each product page. You can also visit our Virtual Try-On feature for a perfect match.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, Net Banking, and Cash on Delivery.' },
];
export default function FAQPage({ state }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="bl-container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>FAQ</h1>
      {FAQS.map((f, i) => (
        <div key={i} className="bl-accordion-item">
          <button className="bl-accordion-btn" onClick={() => setOpen(open === i ? null : i)}>
            {f.q}
            <span style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
          </button>
          {open === i && <div className="bl-accordion-content">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
