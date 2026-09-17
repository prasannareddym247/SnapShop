import React from 'react';

export default function TermsPage() {
  return (
    <div className="mb-page" style={{ maxWidth: '700px' }}>
      <h1>Terms & Conditions</h1>
      <p style={{ fontWeight: 300 }}>Last updated: January 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <section>
          <h2>General</h2>
          <p>By accessing and using Maison de Beaute, you agree to comply with these terms. If you do not agree with any part, please refrain from using our services.</p>
        </section>
        <section>
          <h2>Products & Pricing</h2>
          <p>All prices are listed in USD and are subject to change without notice. We reserve the right to modify or discontinue products. Product images are for illustration and may vary slightly from the actual product.</p>
        </section>
        <section>
          <h2>Orders & Payment</h2>
          <p>By placing an order, you agree to provide accurate information. We reserve the right to cancel or refuse orders. Payment is due at purchase and processed securely through our payment partners.</p>
        </section>
        <section>
          <h2>Shipping & Returns</h2>
          <p>Shipping times are estimates. Our 30-day return policy applies to unused products in original packaging. Please contact our concierge to initiate a return.</p>
        </section>
        <section>
          <h2>Intellectual Property</h2>
          <p>All content — including product names, logos, images, and text — is the property of Maison de Beaute and may not be reproduced without written permission.</p>
        </section>
        <section>
          <h2>Limitation of Liability</h2>
          <p>Maison de Beaute shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        </section>
      </div>
    </div>
  );
}
