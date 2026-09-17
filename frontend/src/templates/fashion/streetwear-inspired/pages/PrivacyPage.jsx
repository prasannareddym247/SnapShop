import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="urban-page" style={{ maxWidth: '800px' }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--sw-text-muted)', marginBottom: '2rem', fontWeight: 300 }}>Last updated: January 2026</p>
      {[
        { title: 'Information We Collect', content: 'We collect information you provide directly, including name, email, shipping address, and payment details. We also automatically collect data about your browsing behavior and device.' },
        { title: 'How We Use Your Information', content: 'We use your data to process orders, improve our services, send marketing communications (with consent), and personalize your shopping experience.' },
        { title: 'Data Protection', content: 'Your data is encrypted and stored securely. We never share your personal information with third parties except as necessary to fulfill orders (e.g., shipping carriers, payment processors).' },
        { title: 'Cookies', content: 'We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized content. You can control cookie preferences in your browser settings.' },
        { title: 'Contact', content: 'For privacy-related inquiries, contact us at privacy@urbanhype.com.' },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{section.title}</h2>
          <p style={{ color: 'var(--sw-text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{section.content}</p>
        </div>
      ))}
    </div>
  );
}
