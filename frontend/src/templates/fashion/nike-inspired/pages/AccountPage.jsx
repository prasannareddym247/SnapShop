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
      <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
        {authError && <div style={{ background: '#fef2f2', color: '#c0392b', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{authError}</div>}
        <div style={{ display: 'flex', borderBottom: '2px solid #111', marginBottom: '2rem' }}>
          {['login', 'register'].map(tab => (
            <button key={tab} onClick={() => { setAuthTab(tab); setAuthError(''); }}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authTab === tab ? '2px solid #111' : '2px solid transparent', fontWeight: authTab === tab ? 800 : 500, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', color: authTab === tab ? '#111' : '#757575' }}>
              {tab === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>
        {authTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="zara-form-group"><label className="zara-form-label">Email</label><input className="zara-form-input" type="email" required value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="zara-form-group"><label className="zara-form-label">Password</label><input className="zara-form-input" type="password" required value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} /></div>
            <button type="submit" className="sp-btn" style={{ width: '100%', marginTop: '0.5rem' }}>Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="zara-form-group"><label className="zara-form-label">First Name</label><input className="zara-form-input" required value={registerForm.firstName} onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="zara-form-group"><label className="zara-form-label">Last Name</label><input className="zara-form-input" required value={registerForm.lastName} onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div className="zara-form-group"><label className="zara-form-label">Email</label><input className="zara-form-input" type="email" required value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="zara-form-group"><label className="zara-form-label">Password</label><input className="zara-form-input" type="password" required value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div className="zara-form-group"><label className="zara-form-label">Confirm Password</label><input className="zara-form-input" type="password" required value={registerForm.confirmPassword} onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))} /></div>
            <button type="submit" className="sp-btn" style={{ width: '100%', marginTop: '0.5rem' }}>Create Account</button>
          </form>
        )}
      </main>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: 'Orders' },
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <main style={{ padding: '3rem 4%', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', marginBottom: '0.25rem' }}>My Account</h1>
      <p style={{ color: '#757575', fontSize: '0.85rem', marginBottom: '2rem' }}>Welcome back, {authUser?.firstName || 'athlete'}</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setDashboardTab(t.key)}
            style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: dashboardTab === t.key ? '2px solid #111' : '2px solid transparent', fontWeight: dashboardTab === t.key ? 800 : 500, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', color: dashboardTab === t.key ? '#111' : '#757575' }}>
            {t.label}
          </button>
        ))}
        <button onClick={() => state.auth.logout()} style={{ marginLeft: 'auto', padding: '0.75rem 1.25rem', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#c0392b', fontFamily: 'inherit' }}>Sign Out</button>
      </div>

      {dashboardTab === 'profile' && (
        <div style={{ maxWidth: '500px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="zara-form-group"><label className="zara-form-label">First Name</label><input className="zara-form-input" defaultValue={authUser?.firstName} /></div>
            <div className="zara-form-group"><label className="zara-form-label">Last Name</label><input className="zara-form-input" defaultValue={authUser?.lastName} /></div>
          </div>
          <div className="zara-form-group"><label className="zara-form-label">Email</label><input className="zara-form-input" defaultValue={authUser?.email} /></div>
          <button className="sp-btn" style={{ marginTop: '0.5rem' }}>Save</button>
        </div>
      )}
      {dashboardTab === 'orders' && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: '#757575' }}>{state.lastOrderId ? `Order #${state.lastOrderId}` : 'No orders yet. Start your journey.'}</p>
        </div>
      )}
      {dashboardTab === 'wishlist' && (
        (state.wishlist || []).length === 0
          ? <p style={{ textAlign: 'center', color: '#757575', padding: '3rem 0' }}>Your wishlist is empty.</p>
          : <div className="sp-grid">{(state.wishlist || []).map(p => (
              <div key={p.id} className="sp-product-card" onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
                <div className="sp-product-image-wrap"><img src={p.image || `https://placehold.co/400x480/f5f5f5/aaa?text=Product`} alt={p.name} className="sp-product-image" loading="lazy" /></div>
                <div className="sp-product-info"><div className="sp-product-brand">{p.brand}</div><h3 className="sp-product-name">{p.name}</h3><span className="sp-product-price">₹{p.price}</span></div>
              </div>
          ))}</div>
      )}
      {dashboardTab === 'addresses' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ color: '#757575' }}>No saved addresses.</p>
          <button className="sp-btn" style={{ marginTop: '0.75rem' }}>Add Address</button>
        </div>
      )}
    </main>
  );
}
