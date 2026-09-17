import React, { useState } from 'react';

const FAQS = [
  { q: 'What is your return policy?', a: 'We offer free returns within 30 days of delivery. Items must be unworn, unwashed, and with all tags attached. Visit our Returns page to initiate a return.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days within India. Express shipping (1-2 business days) is available for ₹499. Free standard shipping on orders over ₹5,000.' },
  { q: 'Do you ship internationally?', a: 'Yes, we ship to select international destinations. International delivery takes 7-14 business days. Duties and taxes may apply based on your location.' },
  { q: 'How do I find my size?', a: 'Refer to our Size Guide page for detailed measurements. Each product page also includes specific sizing information. We recommend ordering your usual size.' },
  { q: 'Can I cancel or change my order?', a: 'Orders can be modified within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact us immediately for assistance.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (GPay, PhonePe, Paytm), and Cash on Delivery.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking link via email and SMS. You can also view your order status in your account dashboard.' },
  { q: 'Do you have a loyalty program?', a: 'Yes! ZARA MODE Rewards is our free loyalty program. Earn points on every purchase and redeem them for exclusive discounts and early access to new collections.' },
];

export default function FAQPage({ state }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>Everything you need to know</p>

      <div>
        {FAQS.map((faq, idx) => (
          <div key={idx} className="zara-accordion-item" style={{ borderBottom: '1px solid #e8e8e8' }}>
            <button
              className="zara-accordion-btn"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              {faq.q}
              <span>{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="zara-accordion-content" style={{ paddingBottom: '1.5rem' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
