import React from 'react';
import '../../layouts/marketing.css';

const FeaturesPage = ({ setView }) => {
  const handleStartTrial = () => {
    setView('auth');
    window.location.hash = 'auth';
  };

  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <p className="section-tagline">PLATFORM CAPABILITIES</p>
      <h1 className="section-main-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Engineered for conversion. Built for speed.</h1>
      <p style={{ textAlign: 'center', color: 'var(--saas-text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
        SnapShop combines modular designs with advanced merchant administration systems so you can grow your online store with zero friction.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '6rem' }}>
        <div style={{ padding: '2rem', border: '1px solid var(--saas-border)', borderRadius: '16px', background: 'white' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '1rem' }}>1. Custom Storefront Builder</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Set up product sliders, filter layouts, and custom search catalogs. Provide your customers with a fast, modern shopping experience that looks great on both mobile devices and desktops.
          </p>
        </div>

        <div style={{ padding: '2rem', border: '1px solid var(--saas-border)', borderRadius: '16px', background: 'white' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '1rem' }}>2. Advanced Product Variants</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Sell items with combinations of sizes, models, weights, and colors. Our database tracks variant stock logs individually, preventing overselling and inventory confusion.
          </p>
        </div>

        <div style={{ padding: '2rem', border: '1px solid var(--saas-border)', borderRadius: '16px', background: 'white' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '1rem' }}>3. Coupon & Discount Engine</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Run marketing promotions by generating custom coupon codes. Set discount values and manage active codes straight from your Store Dashboard.
          </p>
        </div>

        <div style={{ padding: '2rem', border: '1px solid var(--saas-border)', borderRadius: '16px', background: 'white' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '1rem' }}>4. Automated PDF Invoices</h3>
          <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Every time a customer places an order, the system generates a professional FDA-compliant tax PDF invoice receipt containing item details, variant prices, and customer data.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--gradient-hero)', color: 'white', padding: '4rem 3rem', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--shadow-hover)' }}>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '1rem' }}>Ready to launch your online platform?</h2>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Get immediate access to all features with a 14-day free trial. No credit card required. Cancel anytime.
        </p>
        <button className="m-btn m-btn-primary" onClick={handleStartTrial} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
          Create Your Store Now
        </button>
      </div>
    </div>
  );
};

export default FeaturesPage;
