import React from 'react';
import '../../layouts/marketing.css';

const TermsPage = () => {
  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <h1 className="section-main-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Terms of Service</h1>
      <div style={{ background: 'white', padding: '3rem', border: '1px solid var(--saas-border)', borderRadius: '16px', color: 'var(--saas-text-muted)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '1.5rem' }}><strong>Last Updated: June 30, 2026</strong></p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>1. Store Operations</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          By creating a store on SnapShop, you warrant that you own the store branding, have registered valid GSTIN details where required, and possess full liability for products seeded and shipped under your catalog.
        </p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>2. Acceptable Conduct</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          Merchants may not list illegal products, violate copyright laws, generate misleading sales stats, or run malicious code scripts. Super Admins reserve the right to approve or reject items violating standard platform policies.
        </p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>3. Service Availability</h3>
        <p style={{ marginBottom: '1.5rem' }}>
          SnapShop services are provided 'as is'. We make every effort to maximize database uptime, variant logs reliability, and PDF invoice dispatch, but do not warrant complete interruption-free operations.
        </p>

        <h3 style={{ color: 'var(--saas-primary)', margin: '1.5rem 0 0.5rem' }}>4. Subscriptions</h3>
        <p>
          Subscription tiers are billed monthly on a recurring schedule. Failure to resolve subscription invoices may result in temporary storefront catalog deactivation until payment clears.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
