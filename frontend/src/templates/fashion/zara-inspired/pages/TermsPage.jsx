import React from 'react';

export default function TermsPage({ state }) {
  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Terms of Service</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>Last updated: January 2026</p>

      <div style={{ lineHeight: '1.8', fontSize: '0.9rem', color: '#333' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>1. Acceptance of Terms</h2>
        <p>By accessing or using ZARA MODE, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>2. Account Registration</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>3. Orders and Payments</h2>
        <p>All orders are subject to availability and acceptance. We reserve the right to cancel any order. Prices are listed in Indian Rupees (INR) and inclusive of applicable taxes.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>4. Shipping and Delivery</h2>
        <p>Delivery timelines are estimates and not guaranteed. Risk of loss passes to you upon delivery. We are not responsible for delays caused by carriers or customs.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>5. Returns and Exchanges</h2>
        <p>Our return policy is outlined on our Returns page. Items must be returned within 30 days in original condition with tags attached.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>6. Intellectual Property</h2>
        <p>All content on this website, including designs, text, images, and logos, is the property of ZARA MODE and protected by applicable intellectual property laws.</p>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, margin: '1.5rem 0 0.75rem' }}>7. Limitation of Liability</h2>
        <p>ZARA MODE shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
      </div>
    </main>
  );
}
