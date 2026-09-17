import React, { useState } from 'react';

export default function AccountPage({ state }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: 'Guest User', email: 'guest@example.com', phone: '' });

  return (
    <div className="pure-page" style={{ maxWidth: '800px' }}>
      <h1>My Account</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--pure-border)', paddingBottom: '0.75rem' }}>
        {[
          { key: 'profile', label: 'Profile' },
          { key: 'orders', label: 'Orders' },
          { key: 'addresses', label: 'Addresses' },
          { key: 'settings', label: 'Settings' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ background: activeTab === tab.key ? 'var(--pure-primary)' : 'transparent', color: activeTab === tab.key ? '#fff' : 'var(--pure-text-muted)', border: 'none', padding: '0.4rem 1.25rem', borderRadius: '6px', fontFamily: 'var(--pure-heading)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeTab === tab.key ? 500 : 400 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Personal Information</h2>
          {[{ k: 'name', label: 'Full Name' }, { k: 'email', label: 'Email' }, { k: 'phone', label: 'Phone' }].map(f => (
            <div key={f.k} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--pure-text-muted)', marginBottom: '0.3rem' }}>{f.label}</label>
              <input value={profile[f.k]} onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))}
                style={{ width: '100%', background: '#fff', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '0.7rem 1rem', fontFamily: 'var(--pure-body)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button className="pure-btn-primary" onClick={() => alert('Profile updated successfully!')}>Save Changes</button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}>📦</div>
          <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.5rem' }}>No Orders Yet</h3>
          <p style={{ color: 'var(--pure-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Your order history will appear here.</p>
          <button className="pure-btn-primary" onClick={() => state.navigate('category')}>Start Shopping</button>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}>📍</div>
          <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.5rem' }}>No Saved Addresses</h3>
          <p style={{ color: 'var(--pure-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Add a shipping address for faster checkout.</p>
          <button className="pure-btn-primary" onClick={() => alert('Add address form coming soon!')}>Add Address</button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Preferences</h2>
          {['Email Newsletter', 'SMS Alerts', 'Product Recommendations'].map(pref => (
            <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--pure-border)', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--pure-text)' }}>
              <input type="checkbox" defaultChecked={pref === 'Email Newsletter'} style={{ accentColor: 'var(--pure-primary)', width: '16px', height: '16px' }} />
              {pref}
            </label>
          ))}
          <button className="pure-btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => alert('Preferences saved!')}>Save Preferences</button>
        </div>
      )}
    </div>
  );
}
