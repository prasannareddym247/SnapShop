import React from 'react';
export default function PrivacyPage({ state }) {
  return (
    <div className="bl-container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Privacy Policy</h1>
      <p style={{ lineHeight: 1.8, color: '#333', fontSize: '0.95rem' }}>Beauty Luxe respects your privacy. We collect only the information necessary to process your orders and improve your shopping experience. We never sell your personal data to third parties. All payment information is encrypted using industry-standard SSL technology. You may request deletion of your account and associated data at any time by contacting our support team.</p>
    </div>
  );
}
