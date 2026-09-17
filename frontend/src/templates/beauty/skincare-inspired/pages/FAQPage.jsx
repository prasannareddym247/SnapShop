import React, { useState } from 'react';

const FAQS = [
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy on all products. If you\'re not completely satisfied, simply return the unused portion for a full refund. Contact our support team to initiate a return.' },
  { q: 'Are your products cruelty-free?', a: 'Yes! All Pure SkinGlow products are 100% cruelty-free. We never test on animals and only partner with suppliers who share our commitment to ethical practices.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days within the continental US. Express shipping (2-3 business days) is available for an additional fee. Free shipping on orders over $60.' },
  { q: 'Do you ship internationally?', a: 'Yes, we ship to over 40 countries worldwide. International shipping typically takes 7-14 business days. Duties and taxes may apply depending on your location.' },
  { q: 'Are your ingredients natural?', a: 'We formulate with predominantly natural ingredients, including botanical extracts, plant oils, and naturally-derived active compounds. We avoid parabens, sulfates, phthalates, and synthetic fragrances.' },
  { q: 'How do I find the right products for my skin type?', a: 'Use our "Shop by Concern" feature to find products tailored to your specific needs. You can also contact our skincare specialists for a personalized consultation.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be modified or canceled within 2 hours of placement. Please contact our support team immediately with your order number for assistance.' },
  { q: 'Do you offer samples?', a: 'Yes! We include free samples with every order. You can also purchase our Discovery Set to try our most popular products before committing to full sizes.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="pure-page" style={{ maxWidth: '700px' }}>
      <h1>Frequently Asked Questions</h1>
      <p style={{ marginBottom: '2rem' }}>Find answers to common questions about our products and services.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', padding: '1.25rem 1.5rem', cursor: 'pointer', fontFamily: 'var(--pure-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--pure-text)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q}
              <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: open === i ? 'rotate(180deg)' : '', color: 'var(--pure-primary)', fontSize: '0.8rem' }}>▾</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.88rem', color: 'var(--pure-text-muted)', lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
