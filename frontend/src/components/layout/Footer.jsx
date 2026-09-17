import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3 className="footer-brand">🌱 SnapShop</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Build, launch, and scale your online business with professional multi-tenant storefronts. Powered by SnapShop.</p>
        </div>
        <div className="footer-col">
          <h4>Products</h4>
          <ul className="footer-links">
            <li>Multi-Tenant Storefronts</li>
            <li>Vibrant Themes & CMS</li>
            <li>Secure Payment Gateways</li>
            <li>Inventory & Dashboard</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Compliance</h4>
          <ul className="footer-links">
            <li>SaaS Subscription Plans</li>
            <li>Merchant Customizer</li>
            <li>SEO Optimized Pages</li>
            <li>Multi-Vendor Analytics</li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', opacity: 0.6 }}>
        © 2026 SnapShop SaaS Storefront System. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
