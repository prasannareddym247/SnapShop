import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="mb-page" style={{ maxWidth: '700px' }}>
      <h1>Privacy Policy</h1>
      <p style={{ fontWeight: 300 }}>Last updated: January 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <section>
          <h2>Information We Collect</h2>
          <p>Maison de Beaute collects information you provide directly, including your name, email address, shipping address, and payment details when you make a purchase or create an account. We also collect information about your browsing preferences to enhance your shopping experience.</p>
        </section>
        <section>
          <h2>How We Use Your Information</h2>
          <p>Your information is used to process orders, provide personalized recommendations, send updates about your purchases, and occasionally share exclusive invites and beauty insights. We never sell your personal data to third parties.</p>
        </section>
        <section>
          <h2>Data Security</h2>
          <p>We implement industry-leading security measures to protect your information. All payment transactions are encrypted using SSL technology. Your payment details are never stored on our servers.</p>
        </section>
        <section>
          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. You may also opt out of marketing communications by updating your preferences in your account settings or contacting our concierge.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>For privacy-related inquiries, please contact our Data Protection Officer at privacy@maisondebeaute.com or through our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
