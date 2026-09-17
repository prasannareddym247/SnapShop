import React, { useState } from 'react';

const TABS = [
  { key: 'login', label: 'Sign In' },
  { key: 'register', label: 'Register' },
];

const DASHBOARD_TABS = [
  { key: 'profile', label: 'My Profile' },
  { key: 'orders', label: 'Order History' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'addresses', label: 'Saved Addresses' },
];

export default function AccountPage({ state }) {
  const { user: authUser, token: authToken } = state.auth || {};
  const isLoggedIn = !!(authToken && authUser);

  const [authTab, setAuthTab] = useState('login');
  const [dashboardTab, setDashboardTab] = useState('profile');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [profile, setProfile] = useState({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
  });
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', line1: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', zip: '400001', isDefault: true },
  ]);
  const [savedWishlist, setSavedWishlist] = useState(state.wishlist || []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await state.auth.login(loginForm.email, loginForm.password);
    } catch (err) {
      setAuthError(err?.response?.data?.message || err?.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    try {
      await state.auth.register({ ...registerForm, role: 'Customer' });
    } catch (err) {
      setAuthError(err?.response?.data?.message || err?.message || 'Registration failed.');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="zara-template">
        <div className="zara-auth-container">
          {authError && (
            <div style={{ background: '#fef2f2', color: '#c0392b', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <div className="zara-auth-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`zara-auth-tab ${authTab === tab.key ? 'active' : ''}`}
                onClick={() => { setAuthTab(tab.key); setAuthError(''); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="zara-form-group">
                <label className="zara-form-label">Email</label>
                <input className="zara-form-input" type="email" required value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Password</label>
                <input className="zara-form-input" type="password" required value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <button type="submit" className="zara-btn zara-btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>Sign In</button>
              <p style={{ fontSize: '0.75rem', color: '#757575', textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account? <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setAuthTab('register')}>Register</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="zara-form-group">
                  <label className="zara-form-label">First Name</label>
                  <input className="zara-form-input" required value={registerForm.firstName} onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div className="zara-form-group">
                  <label className="zara-form-label">Last Name</label>
                  <input className="zara-form-input" required value={registerForm.lastName} onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Email</label>
                <input className="zara-form-input" type="email" required value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Password</label>
                <input className="zara-form-input" type="password" required value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Confirm Password</label>
                <input className="zara-form-input" type="password" required value={registerForm.confirmPassword} onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))} />
              </div>
              <button type="submit" className="zara-btn zara-btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>Create Account</button>
              <p style={{ fontSize: '0.75rem', color: '#757575', textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setAuthTab('login')}>Sign In</span>
              </p>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.25rem' }}>My Account</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>Welcome back, {authUser?.firstName || 'valued customer'}</p>

      <div className="zara-account-grid">
        <div className="zara-account-sidebar">
          {DASHBOARD_TABS.map(tab => (
            <button
              key={tab.key}
              className={`zara-account-nav-btn ${dashboardTab === tab.key ? 'active' : ''}`}
              onClick={() => setDashboardTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
          <button
            className="zara-account-nav-btn"
            style={{ color: '#c0392b', marginTop: '2rem' }}
            onClick={() => state.auth.logout()}
          >
            Sign Out
          </button>
        </div>

        <div>
          {dashboardTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="zara-form-group">
                  <label className="zara-form-label">First Name</label>
                  <input className="zara-form-input" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="zara-form-group">
                  <label className="zara-form-label">Last Name</label>
                  <input className="zara-form-input" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Email</label>
                <input className="zara-form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Phone</label>
                <input className="zara-form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <button className="zara-btn zara-btn-dark" style={{ marginTop: '1rem' }}>Save Changes</button>
            </div>
          )}

          {dashboardTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Order History</h2>
              {state.lastOrderId ? (
                <div style={{ padding: '1rem', border: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.25rem' }}>Order #{state.lastOrderId}</p>
                      <p style={{ fontSize: '0.75rem', color: '#757575', margin: 0 }}>Placed on {new Date().toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}>Delivered</span>
                  </div>
                </div>
              ) : (
                <div className="zara-empty-state" style={{ padding: '2rem 0' }}>
                  <p style={{ fontSize: '0.9rem', color: '#757575' }}>No orders yet.</p>
                  <button className="zara-btn zara-btn-dark" style={{ marginTop: '0.75rem' }} onClick={() => state.navigate('category')}>Start Shopping</button>
                </div>
              )}
            </div>
          )}

          {dashboardTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>My Wishlist</h2>
              {(state.wishlist || []).length === 0 ? (
                <div className="zara-empty-state" style={{ padding: '2rem 0' }}>
                  <p style={{ fontSize: '0.9rem', color: '#757575' }}>Your wishlist is empty.</p>
                </div>
              ) : (
                <div className="zara-grid">
                  {(state.wishlist || []).map(product => (
                    <div key={product.id} className="zara-product-card" onClick={() => { state.setSelectedProduct(product); state.navigate('product'); }}>
                      <div className="zara-product-image-wrap">
                        <img src={product.image || `https://placehold.co/400x533/f5f5f5/aaa?text=Product`} alt={product.name} className="zara-product-image" loading="lazy" />
                        <button className="zara-wishlist-btn" onClick={e => { e.stopPropagation(); state.toggleWishlist(product); }}>♥</button>
                      </div>
                      <div className="zara-product-info">
                        <h3 className="zara-product-name">{product.name}</h3>
                        <span className="zara-product-price">₹{product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {dashboardTab === 'addresses' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Saved Addresses</h2>
              {addresses.map(addr => (
                <div key={addr.id} style={{ padding: '1rem', border: '1px solid #e8e8e8', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{addr.label} {addr.isDefault && <span style={{ fontSize: '0.65rem', color: '#757575' }}>(Default)</span>}</p>
                      <p style={{ fontSize: '0.8rem', color: '#757575', margin: 0, lineHeight: '1.5' }}>
                        {addr.line1}, {addr.city}, {addr.state} {addr.zip}
                      </p>
                    </div>
                    <button style={{ background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Edit</button>
                  </div>
                </div>
              ))}
              <button className="zara-btn" style={{ border: '1px solid #000', color: '#000', marginTop: '0.5rem' }}>+ Add New Address</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
