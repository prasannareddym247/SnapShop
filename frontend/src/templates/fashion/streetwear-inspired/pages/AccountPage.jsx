import React, { useState } from 'react';

export default function AccountPage({ state }) {
  const [tab, setTab] = useState('orders');

  return (
    <div className="urban-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '3rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '2rem' }}>My Account</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '200px' }}>
          {['orders', 'profile', 'addresses', 'settings'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              display: 'block', width: '100%', textAlign: 'left', background: tab === t ? 'var(--sw-primary)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--sw-text-muted)', border: 'none', padding: '0.75rem 1rem',
              fontFamily: 'var(--sw-accent-font)', fontSize: '0.75rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.25rem'
            }}>{t}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {tab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'var(--sw-heading)', fontSize: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>Order History</h2>
              {[{ id: '#UH-1001', date: 'Jan 15, 2026', total: '$189.00', status: 'Delivered' }, { id: '#UH-1002', date: 'Feb 2, 2026', total: '$145.00', status: 'Shipped' }].map((order, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--sw-border)', marginBottom: '0.75rem', background: 'var(--sw-surface)' }}>
                  <div><div style={{ fontWeight: 600, color: 'var(--sw-text)' }}>{order.id}</div><div style={{ fontSize: '0.85rem', color: 'var(--sw-text-muted)' }}>{order.date}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600, color: 'var(--sw-text)' }}>{order.total}</div><div style={{ fontSize: '0.85rem', color: 'var(--sw-primary)', fontWeight: 600 }}>{order.status}</div></div>
                </div>
              ))}
            </div>
          )}
          {tab === 'profile' && (
            <div>
              <h2 style={{ fontFamily: 'var(--sw-heading)', fontSize: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>Profile</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {['First Name', 'Last Name', 'Email', 'Phone'].map(field => (
                  <div key={field}><div style={{ fontSize: '0.8rem', color: 'var(--sw-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem', fontFamily: 'var(--sw-accent-font)', fontWeight: 600 }}>{field}</div>
                    <input defaultValue={field === 'Email' ? 'customer@urbanhype.com' : field === 'First Name' ? 'Alex' : field === 'Last Name' ? 'Rider' : '+1 (555) 123-4567'} style={{ width: '100%', background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '0.75rem 1rem', color: 'var(--sw-text)', fontFamily: 'var(--sw-body)', fontSize: '0.9rem', outline: 'none' }} /></div>
                ))}
                <button className="urban-btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
              </div>
            </div>
          )}
          {(tab === 'addresses' || tab === 'settings') && (
            <div><p style={{ color: 'var(--sw-text-muted)' }}>{tab === 'addresses' ? 'No saved addresses yet.' : 'Notification preferences and account settings.'}</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
