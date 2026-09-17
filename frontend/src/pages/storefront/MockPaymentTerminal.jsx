import React, { useState } from 'react';
import api from '../../services/api';

const MockPaymentTerminal = () => {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const gateway = params.get('gateway') || 'Stripe';
  const orderId = params.get('orderId');
  const sessionId = params.get('sessionId') || params.get('razorpayOrderId');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const triggerPaymentSimulation = async (success = true) => {
    setLoading(true);
    try {
      if (gateway === 'Stripe') {
        const payload = {
          id: 'evt_' + Math.random().toString(36).substring(2, 15),
          type: success ? 'checkout.session.completed' : 'checkout.session.failed',
          data: {
            object: {
              id: sessionId,
              metadata: { orderId }
            }
          }
        };
        await api.post('/webhooks/stripe', payload, {
          headers: { 'stripe-signature': 'mock_signed_stripe_sig' }
        });
      } else {
        const payload = {
          event: success ? 'order.paid' : 'order.failed',
          payload: {
            payment: {
              entity: {
                id: sessionId,
                notes: { orderId }
              }
            }
          }
        };
        await api.post('/webhooks/razorpay', payload, {
          headers: { 'x-razorpay-signature': 'mock_signed_razorpay_sig' }
        });
      }

      setStatus(success ? 'success' : 'failed');
    } catch (err) {
      console.error(err);
      alert('Simulation error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnStore = () => {
    // Navigate back to the acme organics store user orders list
    window.location.hash = '#store/acme-organics-d8k3';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      padding: '2rem'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Merchant Sandbox Terminal</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Simulated payment gateway processing for SnapShop SaaS</p>
        </div>

        <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>Order ID:</span>
            <strong>#{orderId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>Gateway:</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{gateway} Sandbox</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Session Ref:</span>
            <code style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{sessionId ? sessionId.substring(0, 20) + '...' : 'N/A'}</code>
          </div>
        </div>

        {status === null ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ border: '1px solid #475569', borderRadius: '8px', padding: '1rem', background: '#334155' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Card Details (Simulated)</label>
              <input type="text" placeholder="4111 2222 3333 4444" disabled style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', outline: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <input type="text" placeholder="12 / 29" disabled style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                <input type="text" placeholder="123" disabled style={{ width: '40px', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            <button 
              onClick={() => triggerPaymentSimulation(true)} 
              disabled={loading} 
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Processing Securely...' : 'Authorize & Pay Successfully'}
            </button>

            <button 
              onClick={() => triggerPaymentSimulation(false)} 
              disabled={loading} 
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.9rem',
                opacity: 0.8
              }}
            >
              Simulate Payment Failure
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            {status === 'success' ? (
              <div>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Payment Authorized</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Webhooks successfully verified. Your order status was transitioned to Paid/Packed.</p>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>❌</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Payment Declined</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>The transaction simulation resulted in a failure. Please try again.</p>
              </div>
            )}
            <button 
              onClick={handleReturnStore} 
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Return to Storefront
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockPaymentTerminal;
