import React from 'react';

export default function PrivacyPage({ state }) {
  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>Last updated: January 2026</p>

      <div style={{ lineHeight: '1.8', fontSize: '0.9rem', color: '#333' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, including your name, email address, shipping address, phone number, and payment information when you make a purchase or create an account.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>2. How We Use Your Information</h2>
        <p>We use your information to process your orders, communicate with you about your purchases, send you marketing communications (with your consent), and improve our services.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>3. Information Sharing</h2>
        <p>We do not sell your personal information. We may share your information with trusted third-party service providers who assist us in operating our website and processing payments.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>4. Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information at any time. You can manage your preferences in your account settings or contact us directly.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>6. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@zaramode.com or through our Contact page.</p>
      </div>
    </main>
  );
}
