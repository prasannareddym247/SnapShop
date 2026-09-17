import React from 'react';
import { useAuth } from '../../app/context/AuthContext';

const WaitingApprovalPage = ({ onRetry, onLogout }) => {
  const { user, logout, fetchProfile, token } = useAuth();
  const storedStatus = sessionStorage.getItem('seller_status');
  const storedEmail = sessionStorage.getItem('seller_email');
  const status = user?.sellerStatus || storedStatus || 'Pending';
  const userEmail = user?.email || storedEmail || '';

  const handleLogout = () => {
    sessionStorage.removeItem('seller_status');
    sessionStorage.removeItem('seller_email');
    logout();
    if (onLogout) onLogout();
    window.location.hash = '';
  };

  const timelineSteps = [
    { label: 'Registration Submitted', done: true, icon: '📝' },
    { label: 'Email Verified', done: true, icon: '📧' },
    { label: 'Under Review', done: status !== 'Pending', icon: '🔍' },
    { label: 'Approved', done: status === 'Approved', icon: '✅' }
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', padding: '2rem 1rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '520px', width: '100%', background: '#fff', borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '3rem 2.5rem',
        textAlign: 'center', border: '1px solid rgba(226,232,240,0.8)'
      }}>
        {status === 'Pending' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: '800' }}>Application Under Review</h2>
            <p style={{ color: '#64748b', margin: '0 0 1.5rem', lineHeight: '1.6' }}>
              Your seller account is <strong>pending approval</strong>. Our admin team will review your application and notify you via email once approved.
            </p>

            <div style={{
              background: '#f0f9ff', borderRadius: '12px', padding: '1.25rem',
              border: '1px solid #bae6fd', marginBottom: '1.5rem', textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#0369a1', fontWeight: '600' }}>
                ⏱ Typical review time: 24-48 hours
              </p>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#0284c7' }}>
                You'll receive an email at <strong>{userEmail}</strong> once your account is approved.
              </p>
            </div>

            <button
              onClick={() => {
                if (token) {
                  fetchProfile(token);
                }
              }}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '0.75rem',
                boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
              }}
            >
              🔄 Check Approval Status
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.875rem 1.5rem',
                background: '#fee2e2',
                color: '#ef4444',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '1.5rem'
              }}
            >
              Logout Securely
            </button>

            <div style={{ marginBottom: '2rem' }}>
              {timelineSteps.map((step, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0', opacity: step.done ? 1 : 0.5
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: step.done ? 'linear-gradient(135deg, #059669, #10b981)' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', color: step.done ? '#fff' : '#94a3b8',
                    flexShrink: 0
                  }}>
                    {step.done ? '✓' : step.icon}
                  </div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: step.done ? '600' : '400', color: step.done ? '#059669' : '#64748b' }}>
                      {step.label}
                    </p>
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div style={{
                      position: 'absolute', left: '17px', top: '36px',
                      width: '2px', height: '24px',
                      background: step.done ? '#10b981' : '#e2e8f0'
                    }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {status === 'Rejected' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: '800' }}>Application Not Approved</h2>
            <p style={{ color: '#64748b', margin: '0 0 1.5rem', lineHeight: '1.6' }}>
              Unfortunately, your seller application was <strong>rejected</strong>. This could be due to incomplete documentation or verification issues.
            </p>
            <div style={{
              background: '#fef2f2', borderRadius: '12px', padding: '1.25rem',
              border: '1px solid #fecaca', marginBottom: '1.5rem', textAlign: 'left'
            }}>
              <p style={{ margin: '0', fontSize: '0.85rem', color: '#dc2626' }}>
                Please contact support at <strong>seller-support@snapshop.com</strong> for more information about your rejection status.
              </p>
            </div>
            <button onClick={handleLogout} style={{
              padding: '0.875rem 1.5rem', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem',
              cursor: 'pointer', width: '100%'
            }}>
              Back to Home
            </button>
          </>
        )}

        {status === 'Suspended' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: '800' }}>Account Suspended</h2>
            <p style={{ color: '#64748b', margin: '0 0 1.5rem', lineHeight: '1.6' }}>
              Your seller account has been <strong>suspended</strong>. All your products are currently hidden from customers.
            </p>
            <div style={{
              background: '#fef2f2', borderRadius: '12px', padding: '1.25rem',
              border: '1px solid #fecaca', marginBottom: '1.5rem', textAlign: 'left'
            }}>
              <p style={{ margin: '0', fontSize: '0.85rem', color: '#dc2626' }}>
                Please contact support at <strong>support@snapshop.com</strong> for assistance regarding your account status.
              </p>
            </div>
            <button onClick={handleLogout} style={{
              padding: '0.875rem 1.5rem', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem',
              cursor: 'pointer', width: '100%'
            }}>
              Back to Home
            </button>
          </>
        )}

        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <p>© 2026 SnapShop SaaS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default WaitingApprovalPage;
