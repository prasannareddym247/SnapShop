import React, { useState, useEffect } from 'react';
import subscriptionService from '../../services/subscriptionService';

const PlanComparison = ({ currentPlanKey, onSelect, readOnly }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await subscriptionService.getPlans();
        setPlans(data);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading plans...</div>;
  if (plans.length === 0) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>No plans available.</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: '700px', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', minWidth: '160px' }}>Feature</th>
            {plans.map(p => (
              <th key={p.key} style={{
                background: p.key === currentPlanKey ? 'var(--primary-glow)' : 'transparent',
                borderBottom: p.key === currentPlanKey ? '2px solid var(--primary)' : undefined
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{p.name}</div>
                <div style={{ fontSize: '1.3rem', color: 'var(--primary-light)', margin: '0.25rem 0' }}>₹{p.monthlyPrice}/mo</div>
                {p.yearlyPrice && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{p.yearlyPrice}/yr</div>}
                {p.trialDays > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>{p.trialDays}-day trial</div>}
                {p.key === currentPlanKey && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 600 }}>CURRENT</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Price (Monthly)</td>
            {plans.map(p => <td key={p.key}>₹{p.monthlyPrice}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Price (Yearly)</td>
            {plans.map(p => <td key={p.key}>{p.yearlyPrice ? `₹${p.yearlyPrice}` : '-'}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Max Products</td>
            {plans.map(p => <td key={p.key}>{p.features?.maxProducts === -1 ? 'Unlimited' : p.features?.maxProducts || 0}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Orders/Month</td>
            {plans.map(p => <td key={p.key}>{p.features?.maxOrdersPerMonth === -1 ? 'Unlimited' : p.features?.maxOrdersPerMonth || 0}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Storage</td>
            {plans.map(p => <td key={p.key}>{p.features?.storageMB === -1 ? 'Unlimited' : `${p.features?.storageMB || 0} MB`}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Custom Domain</td>
            {plans.map(p => <td key={p.key}>{p.features?.customDomain ? '✓' : '-'}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>SEO Tools</td>
            {plans.map(p => <td key={p.key}>{p.features?.seoTools ? '✓' : '-'}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>API Access</td>
            {plans.map(p => <td key={p.key}>{p.features?.apiAccess ? '✓' : '-'}</td>)}
          </tr>
          <tr>
            <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-dark)' }}>Priority Support</td>
            {plans.map(p => <td key={p.key}>{p.features?.prioritySupport ? '✓' : '-'}</td>)}
          </tr>
          {!readOnly && (
            <tr>
              <td></td>
              {plans.map(p => (
                <td key={p.key} style={{ padding: '1rem' }}>
                  {p.key !== currentPlanKey ? (
                    <button
                      className="action-btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => onSelect && onSelect(p.key)}
                    >
                      {p.monthlyPrice === 0 ? 'Start Free' : 'Select'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Plan</span>
                  )}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlanComparison;
