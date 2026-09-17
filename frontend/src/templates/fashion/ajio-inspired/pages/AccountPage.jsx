import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';

export default function AccountPage({ state }) {
  const [tab, setTab] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [profileMessage, setProfileMessage] = useState('');

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', addressType: 'Shipping' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  const { auth } = state;

  // Load profile data when logged in
  useEffect(() => {
    if (auth.token && auth.user) {
      setProfileForm({
        firstName: auth.user.firstName || '',
        lastName: auth.user.lastName || '',
        phone: auth.user.phone || ''
      });
      loadOrders();
      loadAddresses();
    }
  }, [auth.token, auth.user]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.get('/orders/my-orders');
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await api.get('/customer/addresses');
      setAddresses(data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    try {
      if (tab === 'login') {
        await auth.login(authEmail, authPassword);
        window.location.reload();
      } else {
        await auth.register({
          email: authEmail,
          password: authPassword,
          firstName: authFirstName,
          lastName: authLastName,
          phone: authPhone,
          role: 'Customer'
        });
        setAuthMessage('Account created! Please sign in.');
        setTab('login');
      }
    } catch (err) {
      setAuthError(err.error || (tab === 'login' ? 'Invalid credentials.' : 'Registration failed.'));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      await api.put('/customer/profile', profileForm);
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileMessage('Failed to update profile.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressMessage('');
    try {
      await api.post('/customer/addresses', addressForm);
      setAddressForm({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', addressType: 'Shipping' });
      setShowAddressForm(false);
      setAddressMessage('Address added.');
      loadAddresses();
    } catch (err) {
      setAddressMessage('Failed to save address.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMessage('Passwords do not match.');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass
      });
      setPasswordMessage('Password changed successfully.');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPasswordMessage(err.error || 'Failed to change password.');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await fetch(`${api.getApiBase()}/orders/invoice/${orderId}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to download invoice.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download invoice.');
    }
  };

  // NOT LOGGED IN - Show Login/Register
  if (!auth.token) {
    return (
      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '2.5rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {authError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', color: '#ef4444', fontSize: '13px', borderRadius: '4px', marginBottom: '1rem' }}>{authError}</div>}
          {authMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', color: '#16a34a', fontSize: '13px', borderRadius: '4px', marginBottom: '1rem' }}>{authMessage}</div>}

          <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid #eaeaea' }}>
            <button onClick={() => setTab('login')} style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', borderBottom: tab === 'login' ? '2px solid #2c3e50' : '2px solid transparent', fontWeight: tab === 'login' ? 'bold' : 'normal', color: tab === 'login' ? '#2c3e50' : '#888', cursor: 'pointer', fontSize: '14px' }}>SIGN IN</button>
            <button onClick={() => setTab('register')} style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', borderBottom: tab === 'register' ? '2px solid #2c3e50' : '2px solid transparent', fontWeight: tab === 'register' ? 'bold' : 'normal', color: tab === 'register' ? '#2c3e50' : '#888', cursor: 'pointer', fontSize: '14px' }}>REGISTER</button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            {tab === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input required placeholder="First Name" value={authFirstName} onChange={e => setAuthFirstName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                <input required placeholder="Last Name" value={authLastName} onChange={e => setAuthLastName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
              </div>
            )}
            <div style={{ marginBottom: '0.75rem' }}>
              <input type="email" required placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
            </div>
            {tab === 'register' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <input placeholder="Phone (optional)" value={authPhone} onChange={e => setAuthPhone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <input type="password" required placeholder="Password (min 6 chars)" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#2c3e50', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', letterSpacing: '1px' }}>
              {tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOGGED IN - Show Account Dashboard
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '2rem', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>MY ACCOUNT</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '2.5rem' }}>
        {/* Sidebar */}
        <div style={{ borderRight: '1px solid #eaeaea', paddingRight: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { key: 'profile', label: 'My Profile' },
              { key: 'orders', label: 'Order History' },
              { key: 'addresses', label: 'Address Book' },
              { key: 'password', label: 'Change Password' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                style={{ textAlign: 'left', padding: '8px 12px', background: tab === item.key ? '#f8fafc' : 'none', border: 'none', borderLeft: tab === item.key ? '3px solid #2c3e50' : '3px solid transparent', fontWeight: tab === item.key ? 'bold' : 'normal', color: tab === item.key ? '#2c3e50' : '#555', cursor: 'pointer', fontSize: '13px' }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '1.5rem 0' }} />
          <button onClick={auth.logout} style={{ width: '100%', padding: '8px', background: 'none', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>SIGN OUT</button>
        </div>

        {/* Content */}
        <div>
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.5rem' }}>Personal Information</h3>
              {profileMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px', color: '#16a34a', fontSize: '12px', borderRadius: '4px', marginBottom: '1rem' }}>{profileMessage}</div>}
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>First Name</label>
                    <input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Last Name</label>
                    <input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Phone</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                </div>
                <button type="submit" style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>UPDATE</button>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem' }}>Order History</h3>
              {loadingOrders ? (
                <p style={{ color: '#888', fontSize: '13px' }}>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '13px' }}>You have no orders yet.</p>
                  <button className="custom-btn" onClick={() => state.navigate('category')} style={{ marginTop: '1rem', background: '#2c3e50', color: '#fff', border: 'none', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>START SHOPPING</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map(o => (
                    <div key={o.id} style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <strong style={{ fontSize: '14px' }}>Order #FK-{o.id}</strong>
                          <span style={{ marginLeft: '1rem', fontSize: '12px', color: '#888' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '2px', background: o.orderStatus === 'Delivered' ? '#f0fdf4' : '#fef3c7', color: o.orderStatus === 'Delivered' ? '#16a34a' : '#d97706' }}>{o.orderStatus}</span>
                      </div>
                      {o.items && o.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555', padding: '4px 0' }}>
                          <span>{item.productName} x{item.quantity}</span>
                          <span>₹{item.unitPrice * item.quantity}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                        <strong style={{ fontSize: '14px' }}>Total: ₹{o.totalAmount}</strong>
                        <button onClick={() => handleDownloadInvoice(o.id)} style={{ background: 'none', border: '1px solid #2c3e50', color: '#2c3e50', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '2px' }}>📄 INVOICE</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {tab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Address Book</h3>
                <button onClick={() => setShowAddressForm(!showAddressForm)} style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>{showAddressForm ? 'CANCEL' : '+ ADD ADDRESS'}</button>
              </div>
              {addressMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px', color: '#16a34a', fontSize: '12px', borderRadius: '4px', marginBottom: '1rem' }}>{addressMessage}</div>}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid #eaeaea', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input required placeholder="Address Line 1" value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input placeholder="Address Line 2 (optional)" value={addressForm.line2} onChange={e => setAddressForm({...addressForm, line2: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                    <input required placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <input required placeholder="Postal Code" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                    <select value={addressForm.addressType} onChange={e => setAddressForm({...addressForm, addressType: e.target.value})} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }}>
                      <option value="Shipping">Shipping</option>
                      <option value="Billing">Billing</option>
                    </select>
                  </div>
                  <button type="submit" style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>SAVE ADDRESS</button>
                </form>
              )}
              {addresses.length === 0 ? (
                <p style={{ color: '#888', fontSize: '13px' }}>No saved addresses.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {addresses.map(a => (
                    <div key={a.AddressId || a.id} style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '1rem' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', background: '#2c3e50', color: '#fff', padding: '2px 8px', borderRadius: '2px', float: 'right' }}>{a.AddressType || a.addressType}</span>
                      <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{a.Line1 || a.line1}{a.Line2 || a.line2 ? `, ${a.Line2 || a.line2}` : ''}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888' }}>{a.City || a.city}, {a.State || a.state} - {a.PostalCode || a.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Password Tab */}
          {tab === 'password' && (
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '1.5rem', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.5rem' }}>Change Password</h3>
              {passwordMessage && <div style={{ background: passwordMessage.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${passwordMessage.includes('success') ? '#bbf7d0' : '#fecaca'}`, padding: '8px', color: passwordMessage.includes('success') ? '#16a34a' : '#ef4444', fontSize: '12px', borderRadius: '4px', marginBottom: '1rem' }}>{passwordMessage}</div>}
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Current Password</label>
                  <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>New Password</label>
                  <input type="password" required minLength="6" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Confirm New Password</label>
                  <input type="password" required minLength="6" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                </div>
                <button type="submit" style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>CHANGE PASSWORD</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}