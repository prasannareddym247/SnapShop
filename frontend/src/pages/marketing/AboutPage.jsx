import React from 'react';
import '../../layouts/marketing.css';

const AboutPage = () => {
  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <p className="section-tagline">OUR STORY & VISION</p>
      <h1 className="section-main-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Democratizing online commerce for everyone.</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto 4rem', fontSize: '1.1rem', color: 'var(--saas-text-muted)', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '1.5rem' }}>
          At SnapShop, we believe that launching an online storefront shouldn't require complex engineering, expensive developers, or tedious server configurations. Our mission is to provide entrepreneurs, small business owners, and large wholesalers with a single platform to create elegant, fast-loading storefronts.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Originally conceptualized to handle localized deliveries, our platform has scaled into a global store builder SaaS. We combine database safety, lightning-fast client loading, and automated invoice tools to support store owners globally.
        </p>
        <p>
          Whether you are selling tech gadgets, fashion couture, books, or smart home appliances, SnapShop handles the complexity of database administration, variant tracking, secure checkout, and billing so you can focus on building your brand.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '4rem', textAlign: 'center' }}>
        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--saas-border)' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--saas-primary-accent)', fontWeight: 800 }}>10K+</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontWeight: 600 }}>Active Online Stores</p>
        </div>
        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--saas-border)' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--saas-primary-accent)', fontWeight: 800 }}>$15M+</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontWeight: 600 }}>Merchant Sales Processed</p>
        </div>
        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--saas-border)' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--saas-primary-accent)', fontWeight: 800 }}>99.9%</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontWeight: 600 }}>Storefront Uptime</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
