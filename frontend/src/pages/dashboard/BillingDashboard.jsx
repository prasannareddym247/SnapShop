import React, { useState, useEffect } from 'react';
import subscriptionService from '../../services/subscriptionService';
import PlanComparison from './PlanComparison';
import InvoiceDetail from './InvoiceDetail';

const BillingDashboard = ({ impersonateStoreId, impersonateTenantId }) => {
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subData, invData] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getMyInvoices()
      ]);
      if (subData) {
        setSubscription(subData.subscription);
        setPlan(subData.plan);
        setUsage(subData.usage);
      }
      setInvoices(invData?.invoices || []);
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePlanSelect = async (planKey) => {
    try {
      const sub = subscription;
      if (sub && sub.status === 'trial') {
        const res = await subscriptionService.startTrial(planKey);
        alert(res.message || 'Trial started!');
      } else if (plan && plan.monthlyPrice > 0) {
        const res = await subscriptionService.upgradePlan(planKey);
        alert(res.message || 'Plan upgraded!');
      } else {
        const res = await subscriptionService.downgradePlan(planKey);
        alert(res.message || 'Plan updated!');
      }
      setShowPlans(false);
      loadData();
    } catch (err) {
      alert(err.error || 'Failed to update plan.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure? Your subscription will be cancelled.')) return;
    try {
      await subscriptionService.cancelSubscription();
      alert('Subscription cancelled.');
      loadData();
    } catch (err) {
      alert(err.error || 'Failed to cancel.');
    }
  };

  const getBadgeStyle = (status) => {
    const styles = {
      active: { background: '#dcfce7', color: '#15803d' },
      trial: { background: '#fef3c7', color: '#b45309' },
      past_due: { background: '#fee2e2', color: '#b91c1c' },
      cancelled: { background: '#f1f5f9', color: '#475569' },
      expired: { background: '#f1f5f9', color: '#475569' },
      paid: { background: '#dcfce7', color: '#15803d' },
      pending: { background: '#fef3c7', color: '#b45309' },
      failed: { background: '#fee2e2', color: '#b91c1c' },
      overdue: { background: '#fee2e2', color: '#b91c1c' },
    };
    return styles[status] || styles.pending;
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading billing info...</div>;

  const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : '-';

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Current Plan Card */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT PLAN</span>
          <h2 style={{ color: 'var(--primary)', margin: '0.25rem 0' }}>{plan?.name || 'No Plan'}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ ...getBadgeStyle(subscription?.status || 'active'), padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
              {subscription?.status || 'active'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Billing period ends: {periodEnd}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="action-btn" onClick={() => setShowPlans(!showPlans)}>
            {showPlans ? 'Hide Plans' : 'Compare Plans'}
          </button>
          {subscription?.status !== 'cancelled' && (
            <button className="secondary-btn" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={handleCancelSubscription}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Plan Comparison */}
      {showPlans && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Compare Plans</h3>
          <PlanComparison currentPlanKey={subscription?.planKey} onSelect={handlePlanSelect} />
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Usage This Month</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {usage.products && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Products</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
                  {usage.products.used} / {usage.products.limit === -1 ? '∞' : usage.products.limit}
                </div>
                {usage.products.limit !== -1 && (
                  <div style={{ background: 'var(--border)', height: '6px', borderRadius: '3px', marginTop: '0.25rem' }}>
                    <div style={{ background: usage.products.used >= usage.products.limit ? '#ef4444' : 'var(--primary)', height: '100%', width: `${Math.min((usage.products.used / usage.products.limit) * 100, 100)}%`, borderRadius: '3px' }} />
                  </div>
                )}
              </div>
            )}
            {usage.orders && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders (This Month)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
                  {usage.orders.used} / {usage.orders.limit === -1 ? '∞' : usage.orders.limit}
                </div>
                {usage.orders.limit !== -1 && (
                  <div style={{ background: 'var(--border)', height: '6px', borderRadius: '3px', marginTop: '0.25rem' }}>
                    <div style={{ background: usage.orders.used >= usage.orders.limit ? '#ef4444' : 'var(--accent)', height: '100%', width: `${Math.min((usage.orders.used / usage.orders.limit) * 100, 100)}%`, borderRadius: '3px' }} />
                  </div>
                )}
              </div>
            )}
            {usage.storage && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Storage</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
                  {usage.storage.used} MB / {usage.storage.limit === -1 ? '∞' : `${usage.storage.limit} MB`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Billing Invoices</h3>
        {invoices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No invoices yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}</td>
                  <td>{inv.planName || '-'}</td>
                  <td>₹{inv.total != null ? Number(inv.total).toFixed(2) : '0.00'}</td>
                  <td>
                    <span style={{ ...getBadgeStyle(inv.status), padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => setSelectedInvoice(inv)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};

export default BillingDashboard;
