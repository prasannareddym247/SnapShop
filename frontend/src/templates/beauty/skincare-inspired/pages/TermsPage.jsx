import React from 'react';

export default function TermsPage() {
  return (
    <div className="pure-page" style={{ maxWidth: '700px' }}>
      <h1>Terms & Conditions</h1>
      <p>Last updated: January 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <section>
          <h2>General</h2>
          <p>By accessing and using Pure SkinGlow, you agree to comply with these terms. If you do not agree with any part of these terms, please do not use our services.</p>
        </section>
        <section>
          <h2>Products & Pricing</h2>
          <p>All prices are listed in USD and are subject to change without notice. We reserve the right to modify or discontinue products at any time. Product images are for illustration purposes and may vary slightly from the actual product.</p>
        </section>
        <section>
          <h2>Orders & Payment</h2>
          <p>By placing an order, you agree to provide accurate and complete information. We reserve the right to cancel or refuse any order. Payment is due at the time of purchase and is processed securely through our payment partners.</p>
        </section>
        <section>
          <h2>Shipping & Returns</h2>
          <p>Shipping times are estimates and not guaranteed. Our 30-day return policy applies to unused products in their original packaging. Return shipping costs are the responsibility of the customer unless the product is defective.</p>
        </section>
        <section>
          <h2>Intellectual Property</h2>
          <p>All content on this site, including product names, logos, images, and text, is the property of Pure SkinGlow and may not be reproduced without written permission.</p>
        </section>
        <section>
          <h2>Limitation of Liability</h2>
          <p>Pure SkinGlow shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        </section>
      </div>
    </div>
  );
}
