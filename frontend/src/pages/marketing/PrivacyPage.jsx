import React from 'react';
import '../../layouts/marketing.css';

const PrivacyPage = () => {
  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <h1 className="section-main-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Privacy Policy</h1>
      <div style={{ background: 'white', padding: '3rem', border: '1px solid var(--saas-border)', borderRadius: '16px', color: 'var(--saas-text-muted)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '1.5rem' }}><strong>Last Updated: June 30, 2026</strong></p>
        
        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>1. Information We Collect</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          We collect merchant profile data (names, email addresses, phone contact logs, corporate store details) and transaction information required to process and host online storefronts. This information is saved securely using database constraints.
        </p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>2. How We Use Information</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          We use collected information to maintain active storefront registries, allow secure dashboard logins, generate tax PDF invoice records, audit inventory variations, and coordinate buyer orders. We do not sell merchant details to third-party advertisers.
        </p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>3. Data Storage & Security</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          All data is persisted in modern relational database systems with proper schema isolation and bcrypt password hashing. Sessions are authenticated client-side via secure JSON Web Tokens (JWT).
        </p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>4. Your Rights</h3>
        <p>
          Store owners can update their store descriptions, profile picture details, bank account details, and catalog items directly inside the Store Dashboard at any time.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
