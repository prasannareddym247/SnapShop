import React from 'react';
import '../../layouts/marketing.css';
import SUBSCRIPTION_PLANS from '../../templates/_shared/data/subscriptionPlans';

const PricingPage = ({ setView }) => {
  const activePlans = SUBSCRIPTION_PLANS.filter(p => p.isActive);

  const handleChoosePlan = () => {
    setView('auth');
    window.location.hash = 'auth';
  };

  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <p className="section-tagline">PLANS & TIERS</p>
      <h1 className="section-main-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Flexible plans built to grow with you.</h1>
      <p style={{ textAlign: 'center', color: 'var(--saas-text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
        No setup fees, no contracts. Choose the plan that aligns with your transaction volume and operational scale.
      </p>

      <div className="pricing-grid" style={{ marginTop: '2rem', gap: '2.5rem' }}>
        {activePlans.map((plan, idx) => (
          <div key={plan.key} className={`pricing-card${plan.isRecommended ? ' premium' : ''}`} style={{ position: 'relative' }}>
            {plan.badge && <div className="popular-badge">{plan.badge}</div>}
            <div className="pricing-header">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <div className="pricing-price">
              ₹{plan.priceINR}<span>/mo</span>
            </div>
            <ul className="pricing-features">
              {plan.features.map((f, i) => (
                <li key={i} style={{ opacity: f.included ? 1 : 0.5 }}>{f.text}</li>
              ))}
            </ul>
            <button
              className={`m-btn ${plan.isRecommended ? 'm-btn-primary' : 'm-btn-outline'}`}
              onClick={handleChoosePlan}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {plan.priceINR === 0 ? 'Get Started Free' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
