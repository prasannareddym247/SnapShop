import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="glam-page" style={{ maxWidth: '800px' }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--glam-text-muted)', marginBottom: '2rem' }}>Last updated: January 2026</p>
      {[
        { title: 'Information We Collect', content: 'We collect information you provide directly including name, email, shipping address, and payment details. We also automatically collect browsing data to improve your experience.' },
        { title: 'How We Use Your Information', content: 'Your data helps us process orders, personalize recommendations, send beauty tips and offers (with consent), and improve our services.' },
        { title: 'Data Protection', content: 'We use industry-standard encryption and security measures. Your data is never shared with third parties except as required to fulfill orders.' },
        { title: 'Cookies', content: 'We use cookies to enhance your browsing, analyze site traffic, and deliver personalized content. Manage preferences in your browser settings.' },
        { title: 'Contact', content: 'For privacy inquiries, email privacy@glamournykaa.com.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{s.title}</h2>
          <p style={{ color: 'var(--glam-text-muted)', lineHeight: 1.7 }}>{s.content}</p>
        </div>
      ))}
    </div>
  );
}
