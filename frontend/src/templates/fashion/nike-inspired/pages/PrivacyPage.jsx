import React from 'react';
export default function PrivacyPage({ state }) {
  return (
    <main style={{ padding: '3rem 4%', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem' }}>Privacy Policy</h1>
      <p style={{ lineHeight: 1.8, color: '#333' }}>We collect only the information needed to process your orders and improve your experience. We do not sell your data. All payment information is encrypted using industry-standard SSL technology.</p>
    </main>
  );
}
