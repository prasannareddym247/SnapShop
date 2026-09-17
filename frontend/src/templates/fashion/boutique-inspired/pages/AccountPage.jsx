import React, { useState } from 'react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: 'Guest', email: 'guest@maisondebeaute.com', phone: '' });

  return (
    <div className="mb-page" style={{ maxWidth: '800px' }}>
      <h1>My Account</h1>
      <div className="mb-tabs">
        {['profile', 'orders', 'addresses', 'membership'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`mb-tab ${activeTab === tab ? 'active' : ''}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Personal Information</h2>
          {[{ k: 'name', label: 'Full Name' }, { k: 'email', label: 'Email' }, { k: 'phone', label: 'Phone' }].map(f => (
            <div key={f.k} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mb-text-muted)', marginBottom: '0.3rem' }}>{f.label}</label>
              <input value={profile[f.k]} onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))}
                style={{ width: '100%', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button className="mb-btn-primary" onClick={() => alert('Your profile has been updated.')}>Save Changes</button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}>📦</div>
          <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.5rem' }}>No Orders Yet</h3>
          <p style={{ color: 'var(--mb-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 300 }}>Your order history will appear here.</p>
          <button className="mb-btn-primary" onClick={() => window.location.hash = '#/category'}>Discover Luxury</button>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}>📍</div>
          <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.5rem' }}>No Saved Addresses</h3>
          <p style={{ color: 'var(--mb-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 300 }}>Add a shipping address for a seamless checkout experience.</p>
          <button className="mb-btn-primary" onClick={() => alert('Add address feature coming soon.')}>Add Address</button>
        </div>
      )}

      {activeTab === 'membership' && (
        <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Le Cercle — Membership</h2>
          <p style={{ color: 'var(--mb-text-muted)', marginBottom: '1.5rem', fontWeight: 300 }}>Join Le Cercle to enjoy exclusive benefits including early access to collections, complimentary gifts, and priority shipping.</p>
          {['Early Access to Collections', 'Complimentary Gifts with Purchase', 'Priority Express Shipping', 'Birthday Surprise'].map(ben => (
            <label key={ben} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--mb-border)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--mb-text)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--mb-secondary)', width: '16px', height: '16px' }} />
              {ben}
            </label>
          ))}
          <button className="mb-btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => alert('Welcome to Le Cercle!')}>Join Le Cercle</button>
        </div>
      )}
    </div>
  );
}
