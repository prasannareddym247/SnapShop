import React, { useState } from 'react';

export default function AccountPage({ state }) {
  const { user: authUser, token: authToken } = state.auth || {};
  const isLoggedIn = !!(authToken && authUser);
  const [authTab, setAuthTab] = useState('login');
  const [dashboardTab, setDashboardTab] = useState('orders');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await state.auth.login(loginForm.email, loginForm.password);
    } catch (err) {
      setAuthError(err?.response?.data?.message || 'Login failed.');
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
      setAuthError(err?.response?.data?.message || 'Registration failed.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="glam-section" style={{ maxWidth: '420px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--glam-text)' }}>
          Glamour Account
        </h1>
        {authError && (
          <div style={{ background: '#fef2f2', color: '#d32f2f', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', borderRadius: '6px', border: '1px solid #fca5a5' }}>
            {authError}
          </div>
        )}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--glam-border)', marginBottom: '2rem' }}>
          {['login', 'register'].map(tab => (
            <button key={tab} onClick={() => { setAuthTab(tab); setAuthError(''); }}
              style={{
                flex: 1, padding: '0.75rem', background: 'none', border: 'none',
                borderBottom: authTab === tab ? '2px solid var(--glam-primary)' : '2px solid transparent',
                fontWeight: authTab === tab ? 700 : 400, fontSize: '0.85rem',
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'inherit', color: authTab === tab ? 'var(--glam-text)' : 'var(--glam-text-muted)',
                transition: 'all 0.2s'
              }}>
              {tab === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {authTab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" required value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input type="password" required value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <button type="submit" className="glam-btn-primary" style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>First Name</label>
                <input required value={registerForm.firstName} onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))}
                  style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Last Name</label>
                <input required value={registerForm.lastName} onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))}
                  style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" required value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input type="password" required value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
              <input type="password" required value={registerForm.confirmPassword} onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            <button type="submit" className="glam-btn-primary" style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>
              Register
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="glam-section" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--glam-text)' }}>My Account</h1>
      <p style={{ color: 'var(--glam-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Welcome back, {authUser?.firstName || 'Beauty Lover'} ✨</p>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '200px' }}>
          {['orders', 'profile', 'addresses', 'settings'].map(t => (
            <button key={t} onClick={() => setDashboardTab(t)} style={{
              display: 'block', width: '100%', textAlign: 'left', background: dashboardTab === t ? 'var(--glam-primary)' : 'transparent',
              color: dashboardTab === t ? '#fff' : 'var(--glam-text-muted)', border: 'none', padding: '0.75rem 1rem', borderRadius: '6px',
              fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.25rem'
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
          <button onClick={() => { if (state.auth.logout) state.auth.logout(); }} style={{
            display: 'block', width: '100%', textAlign: 'left', background: 'transparent',
            color: '#ef4444', border: 'none', padding: '0.75rem 1rem', borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '1rem'
          }}>Sign Out</button>
        </div>

        <div style={{ flex: 1 }}>
          {dashboardTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--glam-text)' }}>Order History</h2>
              {state.lastOrderId ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--glam-border)', borderRadius: '6px', marginBottom: '0.75rem', background: 'var(--glam-surface)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--glam-text)' }}>Order #{state.lastOrderId}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--glam-text-muted)' }}>Recent Order</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--glam-primary)', fontWeight: 600 }}>Processing</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--glam-text-muted)' }}>No orders yet. Start your beauty journey.</p>
              )}
            </div>
          )}

          {dashboardTab === 'profile' && (
            <div>
              <h2 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--glam-text)' }}>Profile</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem', fontWeight: 600 }}>First Name</div>
                  <input readOnly value={authUser?.firstName || ''} style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem', fontWeight: 600 }}>Last Name</div>
                  <input readOnly value={authUser?.lastName || ''} style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--glam-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem', fontWeight: 600 }}>Email</div>
                  <input readOnly value={authUser?.email || ''} style={{ width: '100%', background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {(dashboardTab === 'addresses' || dashboardTab === 'settings') && (
            <div>
              <p style={{ color: 'var(--glam-text-muted)' }}>
                {dashboardTab === 'addresses' ? 'No saved addresses yet.' : 'Notification preferences and account settings.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
