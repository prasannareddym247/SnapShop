import React from 'react';
export default function TermsPage({ state }) {
  return (
    <div className="bl-container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Terms of Service</h1>
      <p style={{ lineHeight: 1.8, color: '#333', fontSize: '0.95rem' }}>By using Beauty Luxe, you agree to our terms and conditions. All products are subject to availability. Prices are listed in INR and inclusive of applicable taxes. We reserve the right to update these terms at any time. For any questions regarding our terms, please contact our support team.</p>
    </div>
  );
}
