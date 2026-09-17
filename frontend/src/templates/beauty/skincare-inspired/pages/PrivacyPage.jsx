import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="pure-page" style={{ maxWidth: '700px' }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: January 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <section>
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, shipping address, and payment details when you make a purchase or create an account.</p>
        </section>
        <section>
          <h2>How We Use Your Information</h2>
          <p>Your information is used to process orders, provide customer support, send updates about your purchases, and occasionally share skincare tips and promotions (with your consent). We never sell your personal data to third parties.</p>
        </section>
        <section>
          <h2>Data Security</h2>
          <p>We implement industry-standard security measures to protect your information. All payment transactions are encrypted using SSL technology. Your payment details are never stored on our servers.</p>
        </section>
        <section>
          <h2>Cookies</h2>
          <p>We use essential cookies to improve your shopping experience, including cart functionality and site navigation. You can control cookie preferences through your browser settings.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>For privacy-related inquiries, please contact us at privacy@pureskinglow.com or through our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
