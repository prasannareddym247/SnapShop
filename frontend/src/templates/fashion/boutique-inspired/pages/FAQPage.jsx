import React, { useState } from 'react';

const FAQS = [
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy on all products in their original condition. Contact our concierge to initiate a complimentary return. Please note that personalized or monogrammed items are final sale.' },
  { q: 'Do you offer complimentary shipping?', a: 'Yes, we offer complimentary standard shipping on all orders over $100. Express and international shipping options are available at checkout.' },
  { q: 'How do I track my order?', a: 'Once your order has shipped, you will receive a confirmation email with a tracking number. You can also track your order through your account dashboard.' },
  { q: 'Do you ship internationally?', a: 'Maison de Beaute ships to over 60 countries worldwide. International delivery typically takes 5-10 business days. Duties and taxes are calculated at checkout.' },
  { q: 'What is Le Cercle membership?', a: 'Le Cercle is our exclusive membership programme offering early access to new collections, complimentary gifts with purchase, priority shipping, and a birthday surprise. Membership is complimentary and by invitation.' },
  { q: 'Can I schedule a beauty consultation?', a: 'Yes, we offer personalized beauty consultations both in our Paris atelier and virtually. Visit our Contact page to schedule an appointment with a beauty concierge.' },
  { q: 'Are your products authentic?', a: 'Absolutely. Maison de Beaute is an authorized retailer for every brand we carry. All products are sourced directly from the manufacturers and guaranteed authentic.' },
  { q: 'How should I store my products?', a: 'We recommend storing products in a cool, dry place away from direct sunlight. Some products, particularly those with natural ingredients, may have specific storage requirements indicated on their packaging.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="mb-page" style={{ maxWidth: '700px' }}>
      <h1>Frequently Asked Questions</h1>
      <p style={{ marginBottom: '2rem', fontWeight: 300 }}>Find answers to common inquiries about Maison de Beaute.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: 'var(--mb-bg-alt)', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', padding: '1.25rem 1.5rem', cursor: 'pointer', fontFamily: 'var(--mb-font-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--mb-text)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q}
              <span style={{ transition: 'transform 0.25s', display: 'inline-block', transform: open === i ? 'rotate(180deg)' : '', color: 'var(--mb-secondary)', fontSize: '0.8rem' }}>▾</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.85rem', color: 'var(--mb-text-muted)', lineHeight: 1.8, fontWeight: 300 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
