import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import { useCart } from '../../app/context/CartContext';
import customerService from '../../services/customerService';
import api from '../../services/api';
import { getCategorySpecificDescription } from '../../features/catalog/productHelpers';

// Sub-page components inside the customer layout
import CatalogPage from '../store/CatalogPage';
import ProductDetailPage from '../store/ProductDetailPage';
import CartPage from '../store/CartPage';
import CheckoutPage from '../store/CheckoutPage';

const CustomerDashboardPage = ({ 
  view, 
  setView, 
  selectedProductId, 
  setSelectedProductId, 
  mobileSidebarOpen, 
  setMobileSidebarOpen,
  customerMenuOpen,
  setCustomerMenuOpen,
  products,
  loadingProducts,
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  wishlistIds,
  onWishlistToggle,
  fetchProducts
}) => {
  const { token, user, logout } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, addresses, payments, profile, notifications, support

  useEffect(() => {
    if (view && view.startsWith('customer-')) {
      const tab = view.split('-')[1];
      const validTabs = ['orders', 'wishlist', 'addresses', 'payments', 'profile', 'support'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
        setView('customer');
      }
    } else if (view === 'orders') {
      setActiveTab('orders');
      setView('customer');
    }
  }, [view]);

  useEffect(() => {
    if (view === 'customer-notifications') {
      (async () => {
        try {
          const notifs = await customerService.getNotifications();
          setNotifications(notifs);
        } catch (err) {
          console.error('Error loading notifications:', err);
        }
      })();
    }
  }, [view]);
  
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [supportQueries, setSupportQueries] = useState([]);
  const [supportSearch, setSupportSearch] = useState('');
  const [activeProducts, setActiveProducts] = useState([]);
  const [supportForm, setSupportForm] = useState({ productId: '', subject: '', message: '' });
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const productDropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Forms states
  const [addressForm, setAddressForm] = useState({
    addressType: 'Shipping',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  
  const [paymentForm, setPaymentForm] = useState({
    type: 'Visa',
    last4: '',
    expDate: '',
    bank: ''
  });

  const [returnForm, setReturnForm] = useState({
    orderId: null,
    reason: ''
  });

  const [reviewForm, setReviewForm] = useState({
    productId: null,
    productName: '',
    rating: 5,
    comment: ''
  });

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    profilePicture: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: ''
  });

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.user) {
          setUserProfile(res.user);
          setProfileForm({
            firstName: res.user.firstName || '',
            lastName: res.user.lastName || '',
            email: res.user.email || '',
            phone: res.user.phone || '',
            alternatePhone: res.user.alternatePhone || '',
            profilePicture: res.user.profilePicture || '',
            address: res.user.address || '',
            city: res.user.city || '',
            state: res.user.state || '',
            country: res.user.country || 'India',
            postalCode: res.user.postalCode || ''
          });
        }
      } catch (err) {
        console.error('Error loading user profile on mount:', err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const orderData = await api.get('/orders/my-orders');
        setOrders(orderData);
      } else if (activeTab === 'wishlist') {
        const wl = await customerService.getWishlist();
        setWishlist(wl);
      } else if (activeTab === 'addresses') {
        const addr = await customerService.getAddresses();
        setAddresses(addr);
      } else if (activeTab === 'payments') {
        const pay = await customerService.getPaymentMethods();
        setPayments(pay);
      } else if (activeTab === 'notifications') {
        const notifs = await customerService.getNotifications();
        setNotifications(notifs);
      } else if (activeTab === 'support') {
        const qList = await api.get('/customer/queries');
        setSupportQueries(qList || []);
        const pList = await api.get('/products');
        setActiveProducts(pList || []);
      } else if (activeTab === 'profile') {
        const res = await api.get('/auth/me');
        if (res.user) {
          setProfileForm({
            firstName: res.user.firstName || '',
            lastName: res.user.lastName || '',
            email: res.user.email || '',
            phone: res.user.phone || '',
            alternatePhone: res.user.alternatePhone || '',
            profilePicture: res.user.profilePicture || '',
            address: res.user.address || '',
            city: res.user.city || '',
            state: res.user.state || '',
            country: res.user.country || 'India',
            postalCode: res.user.postalCode || ''
          });
        }
      }
    } catch (err) {
      console.error('Error loading customer dashboard tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, token]);

  useEffect(() => {
    if (!productDropdownOpen) return;
    const handler = (e) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
        setProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [productDropdownOpen]);

  useEffect(() => {
    if (!productDropdownOpen) setProductSearchTerm('');
  }, [productDropdownOpen]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const apiBase = api.getApiBase();
      const res = await fetch(`${apiBase}/orders/invoice/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Download failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Could not download invoice.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await customerService.addAddress(addressForm);
      setAddressForm({
        addressType: 'Shipping',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      });
      loadData();
      alert('Address added successfully!');
    } catch (err) {
      alert(err.error || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await customerService.deleteAddress(id);
      loadData();
    } catch (err) {
      alert('Failed to delete address.');
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (paymentForm.last4.length !== 4) {
      alert('Last 4 digits must be exactly 4 digits.');
      return;
    }
    const newCard = {
      id: payments.length + 1,
      ...paymentForm
    };
    setPayments([...payments, newCard]);
    setPaymentForm({ type: 'Visa', last4: '', expDate: '', bank: '' });
    alert('Mock payment card added!');
  };

  const handleRemoveCard = (id) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    try {
      await customerService.requestReturn(returnForm.orderId, returnForm.reason);
      setShowReturnModal(false);
      setReturnForm({ orderId: null, reason: '' });
      loadData();
      alert('Return request submitted successfully. Administrator will review the dispute.');
    } catch (err) {
      alert(err.error || 'Failed to submit return request.');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      await customerService.addReview(reviewForm.productId, reviewForm.rating, reviewForm.comment);
      setShowReviewModal(false);
      setReviewForm({ productId: null, productName: '', rating: 5, comment: '' });
      alert('Thank you for rating our product!');
    } catch (err) {
      alert(err.error || 'Failed to submit review.');
    }
  };

  const handleWishlistAddToCart = async (item) => {
    try {
      const p = await api.get(`/products/${item.productId}`);
      if (p.variants && p.variants.length > 0) {
        addToCart(p, p.variants[0], 1);
        await customerService.removeFromWishlist(item.productId);
        const wl = await customerService.getWishlist();
        setWishlist(wl);
      }
    } catch (err) {
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/customer/profile', {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        profilePicture: profileForm.profilePicture,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        country: profileForm.country,
        postalCode: profileForm.postalCode,
        alternatePhone: profileForm.alternatePhone
      });
      alert('Profile updated successfully!');
      setUserProfile(prev => ({
        ...prev,
        ...profileForm
      }));
      loadData();
    } catch (err) {
      alert(err.error || 'Failed to update profile.');
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await customerService.removeFromWishlist(productId);
      loadData();
    } catch (err) {
      alert('Failed to remove from wishlist.');
    }
  };

  const handleSupportQuerySubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.productId || !supportForm.message) {
      alert('Please select a product and type a support inquiry.');
      return;
    }
    try {
      await api.post('/customer/queries', {
        productId: parseInt(supportForm.productId),
        subject: supportForm.subject,
        message: supportForm.message
      });
      alert('Support claim created. Retailer vendor will address this shortly!');
      setSupportForm({ productId: '', subject: '', message: '' });
      loadData();
    } catch (err) {
      alert('Error creating support query.');
    }
  };

  return (
    <div className={view === 'customer' ? 'admin-layout animated-view' : 'customer-layout animated-view'}>
      {/* Customer Account Sidebar - only in customer account view */}
      {view === 'customer' && !loading && (
        <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`} style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem' }}>My Account</h3>
            <button
              onClick={() => setView('home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
          <div className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem', padding: '0.5rem' }}>
            {[
              { key: 'profile', label: 'My Profile' },
              { key: 'orders', label: 'Orders' },
              { key: 'wishlist', label: 'Wishlist' },
              { key: 'addresses', label: 'Addresses' },
              { key: 'payments', label: 'Payments' },
              { key: 'notifications', label: 'Notifications' },
              { key: 'support', label: 'Support' },
            ].map(item => (
              <button key={item.key}
                onClick={() => { setActiveTab(item.key); setMobileSidebarOpen(false); }}
                className={`sidebar-link ${activeTab === item.key ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  border: 'none',
                  background: activeTab === item.key ? 'var(--primary-glow)' : 'transparent',
                  color: activeTab === item.key ? 'var(--primary)' : 'var(--text-dark)',
                  fontWeight: activeTab === item.key ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { logout(); setView('home'); window.location.hash = ''; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                border: 'none',
                background: 'transparent',
                color: 'var(--danger)',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}
      {view === 'customer' && mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>
      )}
      {/* Main Content Area */}
      <main className="customer-content">

        {view === 'home' && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {customerMenuOpen && (
              <aside style={{ width: '220px', minWidth: '220px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'sticky', top: '90px', alignSelf: 'start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                <div style={{ padding: '0 1rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem' }}>My Account</h3>
                </div>
                {[
                  { key: 'profile', label: 'My Profile', view: 'customer-profile' },
                  { key: 'orders', label: 'Orders', view: 'orders' },
                  { key: 'wishlist', label: 'Wishlist', view: 'customer-wishlist' },
                  { key: 'addresses', label: 'Addresses', view: 'customer-addresses' },
                  { key: 'payments', label: 'Payments', view: 'customer-payments' },
                  { key: 'notifications', label: 'Notifications', view: 'customer-notifications' },
                  { key: 'support', label: 'Support', view: 'customer-support' },
                ].map(item => (
                  <button key={item.key}
                    onClick={() => { setView(item.view); setCustomerMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.6rem 1rem', border: 'none', background: 'transparent',
                      color: 'var(--text-dark)', fontWeight: 500, borderRadius: '0',
                      cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-glow)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
                <div style={{ padding: '0.75rem 1rem 0', borderTop: '1px solid var(--border)', marginTop: '0.25rem' }}>
                  <button onClick={() => { logout(); setCustomerMenuOpen(false); setView('home'); window.location.hash = ''; }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.6rem 0', border: 'none', background: 'transparent',
                      color: 'var(--danger)', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'left'
                    }}
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </aside>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <CatalogPage
                products={products}
                loading={loadingProducts}
                category={category}
                setCategory={setCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortOption={sortOption}
                setSortOption={setSortOption}
                wishlistIds={wishlistIds}
                onWishlistToggle={onWishlistToggle}
                onProductClick={(id) => {
                  setSelectedProductId(id);
                  setView('detail');
                  window.location.hash = `product/${id}`;
                }}
              />
            </div>
          </div>
        )}

        {view === 'detail' && selectedProductId && (
          <ProductDetailPage productId={selectedProductId} />
        )}

        {view === 'cart' && (
          <CartPage 
            onProceed={() => setView('checkout')} 
            onViewCatalog={() => { setView('home'); window.location.hash = ''; }} 
          />
        )}

        {view === 'checkout' && (
          <CheckoutPage 
            onOrderPlaced={(orderId) => {
              setView('customer');
              setActiveTab('orders');
              window.location.hash = 'customer';
            }} 
          />
        )}

        {view === 'customer-notifications' && (
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => setView('customer')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem 0', marginBottom: '1rem' }}>
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)' }}>Notifications & Alerts</h2>
              {notifications.some(n => !n.isRead) && (
                <button
                  className="pill"
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 1rem', cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      await customerService.markAllNotificationsRead();
                      const notifs = await customerService.getNotifications();
                      setNotifications(notifs);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id}
                    style={{
                      background: n.isRead ? '#ffffff' : 'rgba(34, 197, 94, 0.05)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(34, 197, 94, 0.2)'}`,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: n.isRead ? 'normal' : '600' }}>{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        className="pill"
                        style={{ background: 'transparent', color: 'var(--primary-light)', border: '1px solid var(--primary-light)', padding: '0.2rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={async () => {
                          try {
                            await customerService.markNotificationRead(n.id);
                            const notifs = await customerService.getNotifications();
                            setNotifications(notifs);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'customer' && (
          loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading Profile details...</div>
          ) : (
            <>
              {/* Tab content directly (sidebar nav replaces the tab bar) */}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
              <div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Order History</h2>
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>You have not placed any orders yet.</p>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="order-card" style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                      <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <strong>Order ID:</strong> #{order.id}
                          <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className={`order-status-badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div style={{ padding: '0.5rem 0 1rem' }}>
                        {order.items && order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            <span>
                              {item.productName} x {item.quantity}
                            </span>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600 }}>₹{Math.round(item.unitPrice * item.quantity)}</span>
                              <button 
                                onClick={() => {
                                  setReviewForm({ productId: item.productId || 1, productName: item.productName, rating: 5, comment: '' });
                                  setShowReviewModal(true);
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                ★ Rate Product
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Payment Status: </span>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-light)' }}>{order.paymentStatus}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {order.orderStatus !== 'Cancelled' && (
                            <button 
                              onClick={() => {
                                setReturnForm({ orderId: order.id, reason: '' });
                                setShowReturnModal(true);
                              }}
                              style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              ↩ Request Return
                            </button>
                          )}
                          <button 
                            className="action-btn" 
                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                            onClick={() => handleDownloadInvoice(order.id)}
                          >
                            📄 Invoice PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Your wishlist is currently empty.</p>
                ) : (
                  <div className="product-grid" style={{ padding: 0 }}>
                    {wishlist.map(item => (
                      <div key={item.id} className="product-card" style={{ maxWidth: '300px' }}>
                        <div className="product-image-container">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="placeholder-prod">{item.productName}</div>
                          )}
                        </div>
                        <div className="product-info">
                          <h3 className="product-title">{item.productName}</h3>
                          <p className="product-desc-excerpt">{item.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{item.price ? Math.round(item.price) : '150'}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleRemoveWishlist(item.productId)}
                                style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', cursor: 'pointer' }}
                              >
                                🗑
                              </button>
                              <button 
                                onClick={() => handleWishlistAddToCart(item)}
                                className="action-btn" 
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              >
                                🛒 Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Management Tab */}
            {activeTab === 'addresses' && (
              <div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Saved Addresses</h2>
                
                {/* List Addresses */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {addresses.map(addr => (
                    <div key={addr.id} style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        {addr.addressType}
                      </span>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Address Details</p>
                      <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        🗑 Delete Address
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Address Form */}
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', maxWidth: '500px' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Add New Address</h4>
                  <form onSubmit={handleAddAddress}>
                    <div className="form-group">
                      <label>Address Type</label>
                      <select 
                        className="form-input" 
                        value={addressForm.addressType}
                        onChange={e => setAddressForm({ ...addressForm, addressType: e.target.value })}
                      >
                        <option value="Shipping">Shipping Address</option>
                        <option value="Billing">Billing Address</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Address Line 1</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        required 
                        placeholder="House No, Apartment Name, Street Name"
                        value={addressForm.line1}
                        onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Address Line 2 (Optional)</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="Landmark, Area Details"
                        value={addressForm.line2}
                        onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>City</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          value={addressForm.city}
                          onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          value={addressForm.state}
                          onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Postal Code (PIN)</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          value={addressForm.postalCode}
                          onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          value={addressForm.country}
                          disabled
                        />
                      </div>
                    </div>
                    <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Save Address
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Saved Payment Cards Tab */}
            {activeTab === 'payments' && (
              <div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Saved Payment Methods</h2>
                
                {/* List Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {payments.map(card => (
                    <div key={card.id} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-md)', position: 'relative', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{card.bank}</p>
                          <h4 style={{ margin: 0, fontSize: '1rem', letterSpacing: '1px' }}>{card.type} Card</h4>
                        </div>
                        <button 
                          onClick={() => handleRemoveCard(card.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ fontSize: '1.1rem', letterSpacing: '2px', fontFamily: 'monospace', margin: '1rem 0' }}>
                        •••• •••• •••• {card.last4}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8 }}>
                        <span>EXP: {card.expDate}</span>
                        <span>SAVED METHOD</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Mock Card Form */}
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', maxWidth: '400px' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Link New Card</h4>
                  <form onSubmit={handleAddCard}>
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        required 
                        placeholder="State Bank of India"
                        value={paymentForm.bank}
                        onChange={e => setPaymentForm({ ...paymentForm, bank: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Card Type</label>
                      <select 
                        className="form-input"
                        value={paymentForm.type}
                        onChange={e => setPaymentForm({ ...paymentForm, type: e.target.value })}
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="RuPay">RuPay</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Last 4 Digits</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          maxLength="4" 
                          placeholder="1234"
                          value={paymentForm.last4}
                          onChange={e => setPaymentForm({ ...paymentForm, last4: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          placeholder="MM/YY"
                          value={paymentForm.expDate}
                          onChange={e => setPaymentForm({ ...paymentForm, expDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Add Saved Card
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>My Profile Settings</h2>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <form onSubmit={handleUpdateProfile}>
                    
                    {/* Avatar display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profileForm.profilePicture ? (
                          <img src={profileForm.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '2.5rem', color: '#94a3b8' }}>👤</span>
                        )}
                      </div>
                      <div>
                        <label className="action-btn" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'inline-block' }}>
                          Upload Profile Picture
                          <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ display: 'none' }} />
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>PNG, JPG or WEBP. Max size 2MB.</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>First Name</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          value={profileForm.firstName}
                          onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          value={profileForm.lastName}
                          onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>Email Address (Restricted)</label>
                        <input 
                          className="form-input" 
                          type="email" 
                          value={profileForm.email}
                          disabled 
                          style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Admin to change email</span>
                      </div>
                      <div className="form-group">
                        <label>Mobile Number (Restricted)</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          value={profileForm.phone}
                          disabled 
                          style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Admin to change mobile</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Alternate Contact Number</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="Enter alternative mobile number (optional)"
                        value={profileForm.alternatePhone}
                        onChange={e => setProfileForm({ ...profileForm, alternatePhone: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Personal Address Details</h4>
                    </div>

                    <div className="form-group">
                      <label>Address Line</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="Apartment, Street Address"
                        value={profileForm.address}
                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>City</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          value={profileForm.city}
                          onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          value={profileForm.state}
                          onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>Postal Code</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          value={profileForm.postalCode}
                          onChange={e => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <input 
                          className="form-input" 
                          type="text" 
                          value={profileForm.country}
                          onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="action-btn" style={{ marginTop: '1.5rem', width: '200px' }}>
                      Save Profile Changes
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: 'var(--primary)' }}>Notifications & Alerts</h2>
                  {notifications.some(n => !n.isRead) && (
                    <button 
                      className="pill" 
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 1rem', cursor: 'pointer' }}
                      onClick={async () => {
                        try {
                          await customerService.markAllNotificationsRead();
                          alert('All notifications marked read.');
                          loadData();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        style={{ 
                          background: n.isRead ? '#ffffff' : 'rgba(34, 197, 94, 0.05)', 
                          borderRadius: 'var(--radius-md)', 
                          padding: '1.25rem', 
                          border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(34, 197, 94, 0.2)'}`, 
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: n.isRead ? 'normal' : '600' }}>{n.message}</p>
                        </div>
                        {!n.isRead && (
                          <button 
                            className="pill" 
                            style={{ background: 'transparent', color: 'var(--primary-light)', border: '1px solid var(--primary-light)', padding: '0.2rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}
                            onClick={async () => {
                              try {
                                await customerService.markNotificationRead(n.id);
                                loadData();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Support Queries Tab */}
            {activeTab === 'support' && (
              <div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Customer Support Query Center</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  {/* Submit Support Form */}
                  <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', alignSelf: 'start' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Submit Inquiry to Retailer</h4>
                    <form onSubmit={handleSupportQuerySubmit}>
                      <div className="form-group">
                        <label>Select Product</label>
                        <div ref={productDropdownRef} style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Search & select a product..."
                            value={
                              productDropdownOpen
                                ? productSearchTerm
                                : supportForm.productId
                                  ? (() => {
                                      const p = activeProducts.find(x => x.id === parseInt(supportForm.productId));
                                      return p ? `${p.name} (${p.category})` : '';
                                    })()
                                  : ''
                            }
                            onChange={e => {
                              setProductSearchTerm(e.target.value);
                              if (supportForm.productId) {
                                setSupportForm({ ...supportForm, productId: '' });
                              }
                              if (!productDropdownOpen) setProductDropdownOpen(true);
                            }}
                            onFocus={() => setProductDropdownOpen(true)}
                            required
                          />
                          {productDropdownOpen && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: '#fff',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: 'var(--shadow-md)',
                              zIndex: 100,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                              {(() => {
                                const filtered = activeProducts.filter(p =>
                                  !productSearchTerm ||
                                  p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                  (p.category && p.category.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                );
                                return filtered.length === 0 ? (
                                  <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No products found</div>
                                ) : (
                                  filtered.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        setSupportForm({ ...supportForm, productId: p.id.toString() });
                                        setProductDropdownOpen(false);
                                        setProductSearchTerm('');
                                      }}
                                      style={{
                                        padding: '0.6rem 0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        borderBottom: '1px solid var(--border)',
                                        background: supportForm.productId === p.id.toString() ? 'var(--primary-glow)' : 'transparent'
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-glow)'}
                                      onMouseLeave={e => e.currentTarget.style.background = supportForm.productId === p.id.toString() ? 'var(--primary-glow)' : 'transparent'}
                                    >
                                      {p.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({p.category})</span>
                                    </div>
                                  ))
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Subject</label>
                        <input 
                          className="form-input"
                          type="text"
                          placeholder="e.g. Seal packaging issue, delivery delay"
                          value={supportForm.subject}
                          onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Message details</label>
                        <textarea 
                          className="form-input"
                          rows="5"
                          placeholder="Provide descriptive details of your product issue or question..."
                          value={supportForm.message}
                          onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                          required
                          style={{ resize: 'none' }}
                        />
                      </div>

                      <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                        Send Inquiry
                      </button>
                    </form>
                  </div>

                  {/* List Queries */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
                      <h4 style={{ color: 'var(--primary)', margin: 0 }}>Past Inquiries Logs</h4>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search inquiries..."
                        value={supportSearch}
                        onChange={e => setSupportSearch(e.target.value)}
                        style={{ maxWidth: '260px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    {supportQueries.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No support tickets created yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {supportQueries
                          .filter(q => {
                            if (!supportSearch.trim()) return true;
                            const term = supportSearch.toLowerCase();
                            return (q.subject && q.subject.toLowerCase().includes(term)) ||
                                   (q.productName && q.productName.toLowerCase().includes(term)) ||
                                   (q.message && q.message.toLowerCase().includes(term));
                          })
                          .map(q => (
                          <div 
                            key={q.id}
                            style={{
                              background: '#ffffff',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1.25rem',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'baseline' }}>
                              <strong style={{ color: 'var(--text-dark)' }}>{q.subject}</strong>
                              <span className={`order-status-badge ${q.status === 'Answered' ? 'paid' : 'pending'}`} style={{ fontSize: '0.65rem' }}>
                                {q.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              Product: <strong>{q.productName}</strong> | Created: {new Date(q.createdAt).toLocaleDateString()}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', margin: '0 0 1rem 0' }}>
                              {q.message}
                            </p>

                            {q.reply && (
                              <div style={{ 
                                background: 'var(--primary-glow)', 
                                borderLeft: '3px solid var(--primary)', 
                                padding: '0.75rem 1rem', 
                                borderRadius: '4px',
                                fontSize: '0.85rem' 
                              }}>
                                <strong style={{ color: 'var(--primary)' }}>Retailer Store Reply: </strong>
                                <span style={{ color: 'var(--text-dark)' }}>{q.reply}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ))}
      </main>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Request Refund & Return</h3>
            <form onSubmit={handleRequestReturn}>
              <div className="form-group">
                <label>Reason for Return</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  required 
                  placeholder="Explain why you want to return this product..."
                  value={returnForm.reason}
                  onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                  style={{ width: '100%', resize: 'none', padding: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowReturnModal(false)} style={{ background: '#e2e8f0', color: 'var(--text-dark)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" className="action-btn" style={{ padding: '0.5rem 1rem' }}>
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Submit Product Review</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Rating for: {reviewForm.productName}</p>
            <form onSubmit={handleAddReview}>
              <div className="form-group">
                <label>Rating</label>
                <select 
                  className="form-input" 
                  value={reviewForm.rating}
                  onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                >
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Review comments</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  required 
                  placeholder="Share your experience using this grocery item..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ width: '100%', resize: 'none', padding: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} style={{ background: '#e2e8f0', color: 'var(--text-dark)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" className="action-btn" style={{ padding: '0.5rem 1rem' }}>
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardPage;
