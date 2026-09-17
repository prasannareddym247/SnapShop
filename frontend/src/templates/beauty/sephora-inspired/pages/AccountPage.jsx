import React, { useState } from 'react';

export default function AccountPage({ state }) {
  const { user: authUser, token: authToken } = state.auth || {};
  const isLoggedIn = !!(authToken && authUser);
  const [authTab, setAuthTab] = useState('login');
  const [dashboardTab, setDashboardTab] = useState('profile');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try { await state.auth.login(loginForm.email, loginForm.password); }
    catch (err) { setAuthError(err?.response?.data?.message || 'Login failed.'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (registerForm.password !== registerForm.confirmPassword) { setAuthError('Passwords do not match.'); return; }
    try { await state.auth.register({ ...registerForm, role: 'Customer' }); }
    catch (err) { setAuthError(err?.response?.data?.message || 'Registration failed.'); }
  };

  if (!isLoggedIn) {
    return (
      <div className="bl-container" style={{ maxWidth: '420px', paddingTop: '4rem', paddingBottom: '4rem' }}>
        {authError && <div style={{ background: '#fef2f2', color: '#d32f2f', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', borderRadius: '8px' }}>{authError}</div>}
        <div style={{ display: 'flex', borderBottom: '2px solid #1a1a1a', marginBottom: '2rem' }}>
          {['login', 'register'].map(tab => (
            <button key={tab} onClick={() => { setAuthTab(tab); setAuthError(''); }}
              style={{
                flex: 1, padding: '0.75rem', background: 'none', border: 'none',
                borderBottom: authTab === tab ? '2px solid #c9a96e' : '2px solid transparent',
                fontWeight: authTab === tab ? 700 : 400, fontSize: '0.8rem',
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'inherit', color: authTab === tab ? '#1a1a1a' : '#8a8a8a',
              }}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
        {authTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="bl-form-group"><label className="bl-form-label">Email</label><input className="bl-form-input" type="email" required value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Password</label><input className="bl-form-input" type="password" required value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} /></div>
            <button type="submit" className="bl-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="bl-form-group"><label className="bl-form-label">First Name</label><input className="bl-form-input" required value={registerForm.firstName} onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="bl-form-group"><label className="bl-form-label">Last Name</label><input className="bl-form-input" required value={registerForm.lastName} onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div className="bl-form-group"><label className="bl-form-label">Email</label><input className="bl-form-input" type="email" required value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Password</label><input className="bl-form-input" type="password" required value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Confirm Password</label><input className="bl-form-input" type="password" required value={registerForm.confirmPassword} onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))} /></div>
            <button type="submit" className="bl-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>Create Account</button>
          </form>
        )}
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'My Profile' },
    { key: 'orders', label: 'Orders' },
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="bl-container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Account</h1>
      <p style={{ color: '#8a8a8a', fontSize: '0.9rem', marginBottom: '2rem' }}>Welcome back, {authUser?.firstName || 'beauty lover'} ✨</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--bl-border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setDashboardTab(t.key)}
            style={{
              padding: '0.75rem 1.25rem', background: 'none', border: 'none',
              borderBottom: dashboardTab === t.key ? '2px solid #c9a96e' : '2px solid transparent',
              fontWeight: dashboardTab === t.key ? 700 : 400, fontSize: '0.8rem',
              letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'inherit', color: dashboardTab === t.key ? '#1a1a1a' : '#8a8a8a',
            }}>
            {t.label}
          </button>
        ))}
        <button onClick={() => state.auth.logout()}
          style={{ marginLeft: 'auto', padding: '0.75rem 1.25rem', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#d32f2f', fontFamily: 'inherit', letterSpacing: '0.05em' }}>
          Sign Out
        </button>
      </div>

      {dashboardTab === 'profile' && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="bl-form-group"><label className="bl-form-label">First Name</label><input className="bl-form-input" defaultValue={authUser?.firstName} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Last Name</label><input className="bl-form-input" defaultValue={authUser?.lastName} /></div>
          </div>
          <div className="bl-form-group"><label className="bl-form-label">Email</label><input className="bl-form-input" defaultValue={authUser?.email} /></div>
          <button className="bl-btn">Save</button>
        </div>
      )}
      {dashboardTab === 'orders' && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: '#8a8a8a' }}>{state.lastOrderId ? `Order #${state.lastOrderId}` : 'No orders yet. Start your beauty journey.'}</p>
        </div>
      )}
      {dashboardTab === 'wishlist' && (
        (state.wishlist || []).length === 0
          ? <p style={{ textAlign: 'center', color: '#8a8a8a', padding: '3rem 0' }}>Your wishlist is empty.</p>
          : <div className="bl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {(state.wishlist || []).map(p => (
                <div key={p.id} className="bl-product-card" onClick={() => { state.setSelectedProduct?.(p); state.navigate?.('product'); }}>
                  <div className="bl-product-image-wrap">
                    <img src={p.image || `https://placehold.co/400x480/f5f5f5/aaa?text=P`} alt={p.name} className="bl-product-image" loading="lazy" />
                    <button className="bl-product-wishlist" onClick={e => { e.stopPropagation(); state.toggleWishlist?.(p); }}>♥</button>
                  </div>
                  <div className="bl-product-info">
                    <div className="bl-product-brand">{p.brand}</div>
                    <div className="bl-product-name">{p.name}</div>
                    <span className="bl-product-price">₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
      )}
      {dashboardTab === 'addresses' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ color: '#8a8a8a' }}>No saved addresses.</p>
          <button className="bl-btn" style={{ marginTop: '0.75rem' }}>Add Address</button>
        </div>
      )}
    </div>
  );
}
