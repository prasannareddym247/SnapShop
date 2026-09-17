import React from 'react';
export default function AccountPage({ state }) {
  return (
    <div className="custom-page-container">
      <h2>My Account</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Merchant Member</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Guest Session</p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
          <button className="custom-btn" style={{ width: '100%' }} onClick={() => state.navigate('home')}>Logout</button>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Order History</h3>
          <p style={{ color: 'var(--text-muted)' }}>You have no orders yet.</p>
        </div>
      </div>
    </div>
  );
}