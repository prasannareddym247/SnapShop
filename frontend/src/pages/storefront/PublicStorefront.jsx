import React, { useState, useEffect } from 'react';
import { useCart } from '../../app/context/CartContext';
import api from '../../services/api';
import customerService from '../../services/customerService';
import sellerService from '../../services/sellerService';
import { StorefrontContext } from '../../templates/_shared/hooks/useTemplateState';
import { setLiveProducts, setLiveCategories, resetDemoData } from '../../templates/_shared/data/demoProducts';
import { transformProductPricing, formatPrice } from '../../features/catalog/productHelpers';

// Fashion Templates
import AjioTemplate from '../../templates/fashion/ajio-inspired/Template';
import ZaraTemplate from '../../templates/fashion/zara-inspired/Template';
import NikeTemplate from '../../templates/fashion/nike-inspired/Template';
import BoutiqueTemplate from '../../templates/fashion/boutique-inspired/Template';
import StreetwearTemplate from '../../templates/fashion/streetwear-inspired/Template';

// Beauty Templates
import NykaaTemplate from '../../templates/beauty/nykaa-inspired/Template';
import SephoraTemplate from '../../templates/beauty/sephora-inspired/Template';
import SkincareTemplate from '../../templates/beauty/skincare-inspired/Template';
import LuxuryBeautyTemplate from '../../templates/beauty/luxury-beauty-inspired/Template';
import MakeupTemplate from '../../templates/beauty/makeup-inspired/Template';

// Electronics Templates
import AppleTemplate from '../../templates/electronics/apple-inspired/Template';
import SamsungTemplate from '../../templates/electronics/samsung-inspired/Template';
import AmazonTechTemplate from '../../templates/electronics/amazon-tech-inspired/Template';
import GamingTemplate from '../../templates/electronics/gaming-inspired/Template';
import GadgetsTemplate from '../../templates/electronics/gadgets-inspired/Template';

// Grocery Templates
import BlinkitTemplate from '../../templates/grocery/blinkit-inspired/Template';
import BigbasketTemplate from '../../templates/grocery/bigbasket-inspired/Template';
import OrganicTemplate from '../../templates/grocery/organic-inspired/Template';
import SupermarketTemplate from '../../templates/grocery/supermarket-inspired/Template';
import DailyEssentialsTemplate from '../../templates/grocery/daily-essentials-inspired/Template';

// Home & Living Templates
import IkeaTemplate from '../../templates/home-living/ikea-inspired/Template';
import ModernTemplate from '../../templates/home-living/modern-inspired/Template';
import LuxuryTemplate from '../../templates/home-living/luxury-inspired/Template';
import WoodenTemplate from '../../templates/home-living/wooden-inspired/Template';
import DecorTemplate from '../../templates/home-living/decor-inspired/Template';

// Sports Templates
import NikePerformanceTemplate from '../../templates/sports/nike-performance-inspired/Template';
import AdidasTemplate from '../../templates/sports/adidas-inspired/Template';
import GymTemplate from '../../templates/sports/gym-inspired/Template';
import OutdoorTemplate from '../../templates/sports/outdoor-inspired/Template';
import EquipmentTemplate from '../../templates/sports/equipment-inspired/Template';

// Automotive Templates
import SparePartsTemplate from '../../templates/automotive/spare-parts-inspired/Template';
import BikeTemplate from '../../templates/automotive/bike-inspired/Template';
import AccessoriesTemplate from '../../templates/automotive/accessories-inspired/Template';
import LuxuryAutoTemplate from '../../templates/automotive/luxury-auto-inspired/Template';
import GarageTemplate from '../../templates/automotive/garage-inspired/Template';

const TEMPLATE_COMPONENTS = {
  'ajio-inspired': AjioTemplate,
  'zara-inspired': ZaraTemplate,
  'nike-inspired': NikeTemplate,
  'boutique-inspired': BoutiqueTemplate,
  'streetwear-inspired': StreetwearTemplate,
  'nykaa-inspired': NykaaTemplate,
  'sephora-inspired': SephoraTemplate,
  'skincare-inspired': SkincareTemplate,
  'luxury-beauty-inspired': LuxuryBeautyTemplate,
  'makeup-inspired': MakeupTemplate,
  'apple-inspired': AppleTemplate,
  'samsung-inspired': SamsungTemplate,
  'amazon-tech-inspired': AmazonTechTemplate,
  'gaming-inspired': GamingTemplate,
  'gadgets-inspired': GadgetsTemplate,
  'blinkit-inspired': BlinkitTemplate,
  'bigbasket-inspired': BigbasketTemplate,
  'organic-inspired': OrganicTemplate,
  'supermarket-inspired': SupermarketTemplate,
  'daily-essentials-inspired': DailyEssentialsTemplate,
  'ikea-inspired': IkeaTemplate,
  'modern-inspired': ModernTemplate,
  'luxury-inspired': LuxuryTemplate,
  'wooden-inspired': WoodenTemplate,
  'decor-inspired': DecorTemplate,
  'nike-performance-inspired': NikePerformanceTemplate,
  'adidas-inspired': AdidasTemplate,
  'gym-inspired': GymTemplate,
  'outdoor-inspired': OutdoorTemplate,
  'equipment-inspired': EquipmentTemplate,
  'spare-parts-inspired': SparePartsTemplate,
  'bike-inspired': BikeTemplate,
  'accessories-inspired': AccessoriesTemplate,
  'luxury-auto-inspired': LuxuryAutoTemplate,
  'garage-inspired': GarageTemplate,
};

const PublicStorefront = ({ slug, subView, productId }) => {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getSubtotal, getTax, getShipping, getDiscount, getGrandTotal, applyCoupon, removeCoupon } = useCart();

  const [token, setCustomerToken] = useState(() => localStorage.getItem('fk_customer_token'));
  const [user, setCustomerUser] = useState(() => {
    try {
      const u = localStorage.getItem('fk_customer_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const customerLogout = () => {
    localStorage.removeItem('fk_customer_token');
    localStorage.removeItem('fk_customer_user');
    setCustomerToken(null);
    setCustomerUser(null);
  };

  const [loadingStore, setLoadingStore] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeSettings, setStoreSettings] = useState({});
  const [activeTheme, setActiveTheme] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Catalog parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');
  const [categories, setCategories] = useState([]);

  // Product detail view state
  const [detailProduct, setDetailProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Customer portal states
  const [portalTab, setPortalTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [addressForm, setAddressForm] = useState({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', addressType: 'Shipping' });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Checkout inputs
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingAddressId, setShippingAddressId] = useState('');
  const [billingAddressId, setBillingAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Authentication inputs inside storefront
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Track Order inputs
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Newsletter email
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [activePaymentGateways, setActivePaymentGateways] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');

  // Fetch Store and Settings
  useEffect(() => {
    const fetchStore = async () => {
      setLoadingStore(true);
      try {
        const maint = await api.get('/maintenance-status');
        if (maint && maint.maintenanceMode) { setMaintenanceMode(true); setLoadingStore(false); return; }
        setMaintenanceMode(false);
        const res = await api.get(`/stores/info/${slug}`);
        if (res && res.store) {
          const store = res.store;
          const settings = res.settings || {};
          const theme = res.theme || null;
          setActiveTheme(theme);

          // Cart isolation guard: check if active store matches the new store
          const currentActiveStoreId = sessionStorage.getItem('active_store_id');
          if (currentActiveStoreId && parseInt(currentActiveStoreId) !== store.id && cart.length > 0) {
            const isHeadless = navigator.webdriver || window.Cypress;
            const clearConfirm = isHeadless ? true : window.confirm(
              `You have items in your cart from another store. Clear your cart to continue shopping at "${store.name}"?`
            );
            if (clearConfirm) {
              clearCart();
              sessionStorage.setItem('active_store_id', store.id);
              sessionStorage.setItem('active_tenant_id', store.tenantId);
              sessionStorage.setItem('active_store_slug', store.slug);
            } else {
              // Redirect back to previous store
              const prevSlug = sessionStorage.getItem('active_store_slug') || 'platform';
              window.location.hash = `store/${prevSlug}`;
              return;
            }
          } else {
            sessionStorage.setItem('active_store_id', store.id);
            sessionStorage.setItem('active_tenant_id', store.tenantId);
            sessionStorage.setItem('active_store_slug', store.slug);
          }

          setStoreInfo(store);
          setStoreSettings(settings);

          // Fetch public payment gateways for this store
          try {
            const payGateways = await api.get(`/stores/info/${store.slug}/payments`);
            if (payGateways && payGateways.methods) {
              const activeOnes = payGateways.methods.filter(m => m.IsEnabled);
              setActivePaymentGateways(activeOnes);
              if (activeOnes.length > 0) {
                const def = activeOnes.find(g => g.IsDefault);
                setSelectedPaymentMethod(def ? def.MethodName : activeOnes[0].MethodName);
              } else {
                setSelectedPaymentMethod('COD');
              }
            }
          } catch (payErr) {
            console.error('Failed to load active payments settings:', payErr);
          }

          // Generate dynamic SEO Meta values
          document.title = `${settings.storeName || store.name} — Online Shop`;

          // Load public categories
          try {
            const cats = await api.get('/categories');
            setCategories(cats || []);
            setLiveCategories(cats || []);
          } catch (cErr) {
            console.error('Error fetching categories:', cErr);
          }
        }
      } catch (err) {
        console.error('Failed to load store by slug:', err);
      } finally {
        setLoadingStore(false);
      }
    };
    if (slug) fetchStore();
  }, [slug]);

  // Load products scoped to resolved tenant
  const loadStoreProducts = async () => {
    if (!storeInfo) return;
    setLoadingProducts(true);
    try {
      let catParam = selectedCategory === 'All' ? 'All' : selectedCategory;
      const params = new URLSearchParams({
        category: catParam,
        search: searchQuery,
        sort: sortOption
      });
      const data = await api.get(`/products?${params}`);
      setStoreProducts(data || []);
      setLiveProducts(data || []);
    } catch (err) {
      console.error('Error loading storefront catalog:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (storeInfo) {
      loadStoreProducts();
    }
  }, [storeInfo, selectedCategory, searchQuery, sortOption]);

  useEffect(() => {
    return () => {
      resetDemoData();
    };
  }, []);

  // Load product detail view if productId exists
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!productId) return;
      setLoadingDetail(true);
      try {
        const prod = await api.get(`/products/${productId}`);
        setDetailProduct(prod);
        if (prod && prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
        setDetailQuantity(1);
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  // Load customer portal data if logged in
  const loadPortalData = async () => {
    if (!token) return;
    try {
      const addrs = await customerService.getAddresses();
      setAddresses(addrs || []);

      const orders = await customerService.getOrders();
      setMyOrders(orders || []);

      const favs = await customerService.getWishlist();
      setWishlist(favs || []);

      if (user) {
        setProfileForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || ''
        });
      }
    } catch (err) {
      console.warn('Failed to load portal data:', err);
    }
  };

  useEffect(() => {
    if (token && storeInfo) {
      loadPortalData();
    }
  }, [token, storeInfo, portalTab]);

  if (loadingStore) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading storefront...
      </div>
    );
  }

  if (maintenanceMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', color: '#1e293b', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Currently Under Maintenance</h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: 480, lineHeight: 1.6 }}>
          This store is temporarily unavailable while we perform scheduled maintenance. We'll be back shortly.
        </p>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Store Not Found</h2>
        <p>The store you are looking for does not exist or has been suspended.</p>
        <button className="action-btn" style={{ marginTop: '1.5rem' }} onClick={() => window.location.hash = ''}>Go to Platform Home</button>
      </div>
    );
  }

  // Intercept and mount custom premium templates
  if (activeTheme && activeTheme.themeKey && TEMPLATE_COMPONENTS[activeTheme.themeKey]) {
    const CustomTemplateComponent = TEMPLATE_COMPONENTS[activeTheme.themeKey];
    return (
      <StorefrontContext.Provider value={{ realProducts: storeProducts, realCategories: categories }}>
        <CustomTemplateComponent activeTheme={activeTheme} />
      </StorefrontContext.Provider>
    );
  }

  const themeSettings = activeTheme?.settings || {};
  const themeColor = themeSettings.primaryColor || storeSettings.themeColor || '#10b981';
  const secondaryColor = themeSettings.secondaryColor || storeSettings.secondaryColor || '#047857';
  const storeName = storeSettings.storeName && storeSettings.storeName !== 'My Multi-tenant Shop' ? storeSettings.storeName : storeInfo.name;

  // Custom Navigation Handlers
  const navTo = (dest) => {
    window.location.hash = `store/${slug}${dest}`;
  };

  // Auth Submit Handlers
  const handleResendCustomerOtp = async () => {
    if (!authEmail) return;
    setAuthError('');
    setAuthMessage('');
    try {
      await api.post('/auth/send-verification-otp', { email: authEmail });
      setAuthMessage('A new verification OTP has been sent to your email.');
    } catch (err) {
      setAuthError(err.error || 'Failed to resend OTP.');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authSubmitting) return;
    setAuthError('');
    setAuthMessage('');
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        try {
          const response = await api.post('/auth/login', { email: authEmail, password: authPassword });
          localStorage.setItem('fk_customer_token', response.token);
          localStorage.setItem('fk_customer_user', JSON.stringify(response.user));
          
          // Update customer auth state immediately
          setCustomerToken(response.token);
          setCustomerUser(response.user);
          
          setAuthMessage('Logged in successfully!');
          
          // Redirect immediately based on cart contents
          if (cart && cart.length > 0) {
            navTo('/checkout');
          } else {
            navTo('');
          }
        } catch (loginErr) {
          if (loginErr && loginErr.code === 'EMAIL_NOT_VERIFIED') {
            // Automatically trigger send OTP and direct customer to OTP verification step
            try {
              await api.post('/auth/send-verification-otp', { email: authEmail });
            } catch (sendErr) {
              console.error('Failed to auto-resend verification OTP:', sendErr);
            }
            setAuthMessage('Email not verified. Verification OTP sent to your email.');
            setAuthMode('otp');
            return;
          }
          throw loginErr;
        }
      } else if (authMode === 'otp') {
        const response = await api.post('/auth/verify-signup-otp', { email: authEmail, otp: authOtp });
        localStorage.setItem('fk_customer_token', response.token);
        localStorage.setItem('fk_customer_user', JSON.stringify(response.user));
        
        // Update customer auth state immediately
        setCustomerToken(response.token);
        setCustomerUser(response.user);
        
        setAuthMessage('Email verified successfully! Logging you in...');
        
        // Redirect immediately based on cart contents
        if (cart && cart.length > 0) {
          navTo('/checkout');
        } else {
          navTo('');
        }
      } else {
        await api.post('/auth/register', {
          email: authEmail,
          password: authPassword,
          firstName: authFirstName,
          lastName: authLastName,
          phone: authPhone,
          role: 'Customer'
        });
        setAuthMessage('Account created! Please enter the 6-digit OTP code sent to your email.');
        setAuthMode('otp');
      }
    } catch (err) {
      setAuthError(err.error || 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Address book creation
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await customerService.addAddress(addressForm);
      setShowAddressForm(false);
      setAddressForm({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', addressType: 'Shipping' });
      loadPortalData();
    } catch (err) {
      alert('Failed to save address.');
    }
  };

  // Wishlist toggle
  const handleWishlistToggle = async (prodId) => {
    if (!token) {
      navTo('/account');
      return;
    }
    const isFav = wishlist.some(w => w.productId === prodId);
    try {
      if (isFav) {
        await customerService.removeFromWishlist(prodId);
      } else {
        await customerService.addToWishlist(prodId);
      }
      loadPortalData();
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Track order query
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    if (!trackOrderId) return;
    try {
      const order = await api.get(`/customer/orders/${trackOrderId}`);
      setTrackedOrder(order);
    } catch (err) {
      setTrackError('Order ID not found or access denied.');
    }
  };

  // Checkout Coupon validations
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode) return;
    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponSuccess('Coupon applied successfully!');
    } else {
      setCouponError(res.error || 'Invalid coupon.');
    }
  };

  // Place Order checkout endpoint submit
  const handlePlaceOrder = async () => {
    if (!shippingAddressId) return alert('Select shipping address.');
    setIsPlacingOrder(true);
    try {
      const checkoutItems = cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxAmount: item.taxAmount
      }));

      const res = await api.post('/orders/checkout', {
        items: checkoutItems,
        totalAmount: getGrandTotal(),
        taxAmount: getTax(),
        shippingAmount: getShipping(),
        paymentMethod: selectedPaymentMethod,
        notes: orderNotes
      });

      clearCart();
      removeCoupon();

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert(`Order placed successfully! Order ID: #${res.orderId}`);
        navTo(`/orders`);
      }
    } catch (err) {
      alert(err.error || 'Order placement failed.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Profile Form update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/customer/profile', profileForm);
      alert('Profile updated successfully.');
    } catch (err) {
      alert('Failed to update profile details.');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Brand Color Injector */}
      <style>{`
        :root {
          --store-primary: ${themeColor};
          --store-secondary: ${secondaryColor};
        }
        .store-btn {
          background: var(--store-primary);
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .store-btn:hover {
          background: var(--store-secondary);
        }
        .store-tab {
          padding: 0.5rem 1rem;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
        }
        .store-tab.active {
          border-bottom-color: var(--store-primary);
          color: var(--store-primary);
          font-weight: 700;
        }
        .store-nav-link {
          color: var(--text-dark);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .store-nav-link:hover {
          color: var(--store-primary);
        }
      `}</style>

      {/* Top Banner Message */}
      <div style={{ background: 'var(--store-secondary)', color: 'white', fontSize: '0.8rem', padding: '0.4rem 1rem', textAlign: 'center', fontWeight: 600 }}>
        ✨ Welcome to {storeName}! Standard Delivery free for orders over ₹1,000.
      </div>

      {/* Store Header Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navTo('')}>
            {storeSettings.logoUrl ? (
              <img src={storeSettings.logoUrl} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--store-primary)' }}>🛍️ {storeName}</span>
            )}
          </div>

          <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span className="store-nav-link" onClick={() => navTo('')}>Home</span>
            <span className="store-nav-link" onClick={() => navTo('/products')}>Products</span>
            <span className="store-nav-link" onClick={() => navTo('/track-order')}>Track Order</span>
            <span className="store-nav-link" onClick={() => navTo('/account')}>My Account</span>
          </nav>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {token && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <span>👤 {user.firstName}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }} onClick={() => { customerLogout(); window.location.hash = ''; }} title="Logout">➡️</button>
            </div>
          ) : (
            <span className="store-nav-link" onClick={() => navTo('/account')}>Sign In</span>
          )}

          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navTo('/cart')}>
            <span style={{ fontSize: '1.3rem' }}>🛒</span>
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: 'var(--store-primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Pages Scopes */}
      <main style={{ flex: 1, padding: '2rem' }}>

        {/* SUBVIEW 1: HOME PAGE */}
        {subView === 'home' && (
          <div>
            {/* Store Hero Banner */}
            <div style={{
              background: storeSettings.bannerUrl ? `url(${storeSettings.bannerUrl}) no-repeat center/cover` : 'linear-gradient(135deg, var(--store-secondary), var(--store-primary))',
              height: '320px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 4rem',
              color: 'white',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '3rem'
            }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.3)', marginBottom: '0.5rem' }}>{storeName}</h1>
              <p style={{ fontSize: '1.2rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)', maxWidth: '500px', marginBottom: '1.5rem' }}>{storeSettings.storeDescription || 'Premium catalog collection curated for your shopping ease.'}</p>
              <div>
                <button className="store-btn" onClick={() => navTo('/products')}>Shop Collection Now</button>
              </div>
            </div>

            {/* Categories Showcase */}
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Shop by Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {categories.map(c => (
                <div
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.name); navTo('/products'); }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--store-primary)' }}>{c.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.description || 'View Catalog'}</span>
                </div>
              ))}
            </div>

            {/* Featured Products */}
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Best Sellers & New Arrivals</h3>
            {loadingProducts ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading collection...</p>
            ) : storeProducts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No products listed.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {storeProducts.slice(0, 8).map(p => {
                  const defaultVariant = p.variants && p.variants[0] ? p.variants[0] : null;
                  const discount = p.discount || p.discountPercentage || 0;
                  // Transform pricing from USD to INR
                  const transformedPricing = transformProductPricing(p);
                  const sellingPrice = transformedPricing?.displayPrice || (defaultVariant ? defaultVariant.price : 0);
                  const originalPrice = transformedPricing?.originalPrice || sellingPrice;
                  const isFav = wishlist.some(w => w.productId === p.id);

                  return (
                    <div
                      key={p.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      {/* Favorite Button */}
                      <button
                        onClick={() => handleWishlistToggle(p.id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255,255,255,0.8)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>

                      <div style={{ cursor: 'pointer' }} onClick={() => navTo(`/product/${p.id}`)}>
                        <img src={p.imageUrl || '/assets/groceesary/1.png'} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '0.75rem' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{p.category}</span>
                        <h4 style={{ margin: '0.25rem 0', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{p.name}</h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--store-primary)' }}>₹{sellingPrice}</span>
                          {discount > 0 && (
                            <>
                              <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{originalPrice}</span>
                              <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.7rem', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 'bold' }}>{discount}% OFF</span>
                            </>
                          )}
                        </div>
                      </div>

                      {defaultVariant && defaultVariant.stock > 0 ? (
                        <button
                          className="store-btn"
                          style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                          onClick={() => {
                            addToCart(p, defaultVariant, 1);
                            alert(`${p.name} added to cart!`);
                          }}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <button disabled style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', marginTop: '0.5rem', background: '#e2e8f0', color: '#94a3b8', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'not-allowed' }}>
                          Out of Stock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 2: PRODUCTS LISTING (CATALOG) */}
        {subView === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>

            {/* Filters Sidebar */}
            <aside>
              <h4 style={{ marginBottom: '1rem', color: 'var(--store-primary)' }}>Categories</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                <span
                  className={`store-nav-link ${selectedCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                  style={{ cursor: 'pointer', fontWeight: selectedCategory === 'All' ? 'bold' : 'normal' }}
                >
                  All Categories
                </span>
                {categories.map(c => (
                  <span
                    key={c.id}
                    className={`store-nav-link ${selectedCategory === c.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(c.name)}
                    style={{ cursor: 'pointer', fontWeight: selectedCategory === c.name ? 'bold' : 'normal' }}
                  >
                    {c.name}
                  </span>
                ))}
              </div>

              <h4 style={{ marginBottom: '1rem', color: 'var(--store-primary)' }}>Sort Order</h4>
              <select value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <option value="name-asc">Alphabetical (A-Z)</option>
                <option value="name-desc">Alphabetical (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </aside>

            {/* Catalog Grid */}
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products in this store..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
              </div>

              {loadingProducts ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading storefront catalog...</p>
              ) : storeProducts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No products found matching filters.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {storeProducts.map(p => {
                    const defaultVariant = p.variants && p.variants[0] ? p.variants[0] : null;
                    const discount = p.discount || p.discountPercentage || 0;
                    // Transform pricing from USD to INR
                    const transformedPricing = transformProductPricing(p);
                    const sellingPrice = transformedPricing?.displayPrice || (defaultVariant ? defaultVariant.price : 0);
                    const originalPrice = transformedPricing?.originalPrice || sellingPrice;
                    const isFav = wishlist.some(w => w.productId === p.id);

                    return (
                      <div
                        key={p.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          position: 'relative',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <button
                          onClick={() => handleWishlistToggle(p.id)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(255,255,255,0.8)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                          }}
                        >
                          {isFav ? '❤️' : '🤍'}
                        </button>

                        <div style={{ cursor: 'pointer' }} onClick={() => navTo(`/product/${p.id}`)}>
                          <img src={p.imageUrl || '/assets/groceesary/1.png'} alt={p.name} style={{ width: '100%', height: '130px', objectFit: 'contain', marginBottom: '0.75rem' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</span>
                          <h4 style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{p.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                            <strong style={{ color: 'var(--store-primary)' }}>₹{sellingPrice}</strong>
                            {discount > 0 && (
                              <span style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{originalPrice}</span>
                            )}
                          </div>
                        </div>

                        {defaultVariant && defaultVariant.stock > 0 ? (
                          <button
                            className="store-btn"
                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              addToCart(p, defaultVariant, 1);
                              alert(`${p.name} added to cart!`);
                            }}
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <button disabled style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', background: '#e2e8f0', color: '#94a3b8', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'not-allowed' }}>
                            Out of Stock
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBVIEW 3: PRODUCT DETAILS */}
        {subView === 'detail' && (
          <div>
            {loadingDetail ? (
              <p>Loading product information...</p>
            ) : !detailProduct ? (
              <p>Product not found.</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem', background: '#fff', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>

                  {/* Left Column: Image */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
                    <img src={detailProduct.imageUrl || '/assets/groceesary/1.png'} alt={detailProduct.name} style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }} />
                  </div>

                  {/* Right Column: Info */}
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--store-primary)', textTransform: 'uppercase' }}>{detailProduct.category}</span>
                    <h1 style={{ color: 'var(--text-dark)', margin: '0.5rem 0' }}>{detailProduct.name}</h1>

                    {/* Expiry Details */}
                    {selectedVariant && selectedVariant.expiryDate && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                        📅 Expiry Date: {new Date(selectedVariant.expiryDate).toLocaleDateString()}
                      </p>
                    )}

                    <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                      {(() => {
                        const disc = detailProduct.discount || detailProduct.discountPercentage || 0;
                        // Transform pricing from USD to INR
                        const transformedDetailPricing = transformProductPricing(detailProduct);
                        const sellingPrice = transformedDetailPricing?.displayPrice || (selectedVariant ? selectedVariant.price : 0);
                        const originalPrice = transformedDetailPricing?.originalPrice || sellingPrice;
                        return (
                          <>
                            <h2 style={{ color: 'var(--store-primary)', margin: 0 }}>₹{sellingPrice}</h2>
                            {disc > 0 && (
                              <>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>₹{originalPrice}</span>
                                <span style={{ background: '#fee2e2', color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                  {disc}% OFF
                                </span>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <p style={{ lineHeight: '1.6', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>{detailProduct.description}</p>

                    {detailProduct.storageInstructions && (
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', borderLeft: '3px solid var(--store-primary)' }}>
                        <strong>Storage Instructions:</strong> {detailProduct.storageInstructions}
                      </div>
                    )}

                    {/* Weight Variant Selector */}
                    {detailProduct.variants && detailProduct.variants.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Select Pack Size:</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {detailProduct.variants.map(v => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariant(v)}
                              style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                background: selectedVariant && selectedVariant.id === v.id ? 'var(--store-primary)' : '#ffffff',
                                color: selectedVariant && selectedVariant.id === v.id ? 'white' : 'var(--text-dark)',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              {v.weightGrams >= 1000 ? `${v.weightGrams / 1000} kg` : `${v.weightGrams}g`} (Stock: {v.stock})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Adjustment */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <label style={{ fontWeight: 600 }}>Qty:</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <button style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: 'none', cursor: 'pointer' }} onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}>-</button>
                        <span style={{ padding: '0.5rem 1.25rem', fontWeight: 'bold' }}>{detailQuantity}</span>
                        <button style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: 'none', cursor: 'pointer' }} onClick={() => setDetailQuantity(detailQuantity + 1)}>+</button>
                      </div>
                    </div>

                    {(() => {
                      const isOutOfStock = detailProduct.status === 'Inactive' || detailProduct.availabilityStatus === 'Out of Stock' || (selectedVariant && selectedVariant.stock <= 0);
                      return isOutOfStock ? (
                        <button className="store-btn" style={{ padding: '0.8rem 2rem', background: 'var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed' }} disabled>Out of Stock</button>
                      ) : (
                        <button
                          className="store-btn"
                          style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
                          onClick={() => {
                            addToCart(detailProduct, selectedVariant, detailQuantity);
                            alert(`Added ${detailQuantity} pack(s) to cart!`);
                          }}
                        >
                          Add to Cart
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Related Products block */}
                <h3 style={{ marginBottom: '1.5rem' }}>Related Products</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {storeProducts
                    .filter(p => p.category === detailProduct.category && p.id !== detailProduct.id)
                    .slice(0, 4)
                    .map(p => {
                      const v = p.variants && p.variants[0];
                      if (!v) return null;
                      return (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer' }} onClick={() => navTo(`/product/${p.id}`)}>
                          <img src={p.imageUrl || '/assets/groceesary/1.png'} alt={p.name} style={{ width: '100%', height: '110px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                          <h4 style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>{p.name}</h4>
                          <strong style={{ color: 'var(--store-primary)', fontSize: '0.9rem' }}>₹{v.price}</strong>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 4: SHOPPING CART */}
        {subView === 'cart' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--store-primary)' }}>Your Shopping Cart</h2>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <span style={{ fontSize: '3rem' }}>🛒</span>
                <p style={{ margin: '1rem 0' }}>Your cart is empty.</p>
                <button className="store-btn" onClick={() => navTo('/products')}>Browse Products</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* List items */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  {cart.map(item => (
                    <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={item.imageUrl || '/assets/groceesary/1.png'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pack Size: {item.weightGrams >= 1000 ? `${item.weightGrams / 1000} kg` : `${item.weightGrams}g`}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                          <button style={{ padding: '0.2rem 0.6rem', border: 'none', background: '#f8fafc', cursor: 'pointer' }} onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}>-</button>
                          <span style={{ padding: '0.2rem 0.8rem', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button style={{ padding: '0.2rem 0.6rem', border: 'none', background: '#f8fafc', cursor: 'pointer' }} onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}>+</button>
                        </div>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>₹{item.unitPrice * item.quantity}</span>
                        <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem' }} onClick={() => removeFromCart(item.variantId)} title="Remove item">🗑️</button>
                      </div>
                    </div>
                  ))}
                  <button className="secondary-btn" style={{ marginTop: '1rem', color: 'var(--danger)' }} onClick={clearCart}>Clear Cart</button>
                </div>

                {/* Summary card */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', height: 'fit-content' }}>
                  <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Order Summary</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Subtotal:</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Tax (12%):</span>
                    <span>₹{getTax()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <span>Shipping fee:</span>
                    <span>{getShipping() === 0 ? 'FREE' : `₹${getShipping()}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.15rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: 'var(--store-primary)' }}>₹{getGrandTotal()}</span>
                  </div>
                  <button className="store-btn" style={{ width: '100%', padding: '0.8rem' }} onClick={() => navTo('/checkout')}>Proceed to Checkout</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 5: CHECKOUT */}
        {subView === 'checkout' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--store-primary)' }}>Secure Store Checkout</h2>
            {!token ? (
              <div style={{ maxWidth: '450px', margin: '2rem auto', textAlign: 'center', background: '#fff', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <h3>Authentication Required</h3>
                <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>You must register or log in to complete your checkout order.</p>
                <button className="store-btn" onClick={() => navTo('/account')}>Login or Register</button>
              </div>
            ) : cart.length === 0 ? (
              <p>Your cart is empty. Please add items to checkout.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Checkout Steps Column */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>

                  {/* Step 1: Shipping Address Selection */}
                  {checkoutStep === 1 && (
                    <div>
                      <h3 style={{ marginBottom: '1rem' }}>Select Shipping Address</h3>
                      {addresses.length === 0 ? (
                        <div>
                          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No saved addresses found. Please add a shipping address in your portal profile.</p>
                          <button className="store-btn" onClick={() => navTo('/account')}>Go add Address</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                          {addresses.map(a => (
                            <label key={a.AddressId} style={{ display: 'flex', gap: '1rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                              <input type="radio" name="shipping" checked={shippingAddressId === a.AddressId} onChange={() => setShippingAddressId(a.AddressId)} />
                              <div>
                                <strong>{a.AddressType} Address</strong>
                                <div>{a.Line1}, {a.Line2 ? `${a.Line2}, ` : ''}{a.City}, {a.State} - {a.PostalCode}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      <button className="store-btn" disabled={!shippingAddressId} onClick={() => setCheckoutStep(2)}>Continue to Billing</button>
                    </div>
                  )}

                  {/* Step 2: Billing & Notes */}
                  {checkoutStep === 2 && (
                    <div>
                      <h3 style={{ marginBottom: '1rem' }}>Billing & Notes</h3>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Select Billing Address</label>
                        {addresses.map(a => (
                          <label key={a.AddressId} style={{ display: 'flex', gap: '1rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '0.5rem' }}>
                            <input type="radio" name="billing" checked={billingAddressId === a.AddressId} onChange={() => setBillingAddressId(a.AddressId)} />
                            <div>
                              <strong>{a.AddressType} Address</strong>
                              <div>{a.Line1}, {a.Line2 ? `${a.Line2}, ` : ''}{a.City}, {a.State} - {a.PostalCode}</div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Order Notes / Special Requests</label>
                        <textarea className="form-input" rows="3" placeholder="Add delivery requests, timings, or options..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="secondary-btn" onClick={() => setCheckoutStep(1)}>Back</button>
                        <button className="store-btn" onClick={() => setCheckoutStep(3)}>Continue to Payment</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment Method & Place Order */}
                  {checkoutStep === 3 && (
                    <div>
                      <h3 style={{ marginBottom: '1rem' }}>Select Payment Method</h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {activePaymentGateways.length === 0 ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: '#f8fafc' }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="COD"
                              checked={selectedPaymentMethod === 'COD'}
                              onChange={() => setSelectedPaymentMethod('COD')}
                            />
                            <div>
                              <strong>💵 Cash on Delivery (COD)</strong>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pay with cash upon package receipt.</div>
                            </div>
                          </label>
                        ) : (
                          <>
                            {activePaymentGateways.map(g => (
                              <label key={g.MethodName} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedPaymentMethod === g.MethodName ? '#f0fdf4' : '#f8fafc', borderColor: selectedPaymentMethod === g.MethodName ? 'var(--primary)' : 'var(--border)' }}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={g.MethodName}
                                  checked={selectedPaymentMethod === g.MethodName}
                                  onChange={() => setSelectedPaymentMethod(g.MethodName)}
                                />
                                <div>
                                  <strong>{g.MethodName === 'COD' ? '💵 Cash on Delivery (COD)' : g.MethodName === 'Stripe' ? '💳 Pay with Stripe' : '💳 Pay with Razorpay'}</strong>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {g.MethodName === 'COD' ? 'Pay upon delivery.' : `Process payment sandbox via connected ${g.MethodName} merchant key.`}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </>
                        )}
                      </div>

                      {selectedPaymentMethod !== 'COD' && (
                        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', background: '#f8fafc' }}>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>You will be redirected to the secure sandbox terminal to simulate payment validation.</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="secondary-btn" onClick={() => setCheckoutStep(2)}>Back</button>
                        <button className="store-btn" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                          {isPlacingOrder ? 'Processing...' : selectedPaymentMethod === 'COD' ? 'Place COD Order' : 'Proceed to Sandbox Payment'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Summary Column */}
                <div>
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Cart Checkout Items</h3>
                    {cart.map(item => (
                      <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{item.unitPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Promotional Coupon</h3>
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input type="text" placeholder="COUPON50" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', flex: 1, textTransform: 'uppercase' }} />
                      <button className="store-btn" style={{ padding: '0.5rem 1rem' }} type="submit">Apply</button>
                    </form>
                    {couponError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: 0 }}>{couponError}</p>}
                    {couponSuccess && <p style={{ color: 'var(--success)', fontSize: '0.8rem', margin: 0 }}>{couponSuccess}</p>}

                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span>Subtotal:</span>
                        <span>₹{getSubtotal()}</span>
                      </div>
                      {getDiscount() > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                          <span>Discount Applied:</span>
                          <span>-₹{getDiscount()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                        <span>Tax:</span>
                        <span>₹{getTax()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>
                        <span>Shipping:</span>
                        <span>{getShipping() === 0 ? 'FREE' : `₹${getShipping()}`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <span>Order Total:</span>
                        <span>₹{getGrandTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 6: CUSTOMER ACCOUNT AREA */}
        {subView === 'account' && (
          <div>
            {!token ? (
              <div style={{ maxWidth: '400px', margin: '3rem auto', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
                {authError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>{authError}</div>}
                {authMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>{authMessage}</div>}

                <form onSubmit={handleAuthSubmit}>
                  {authMode === 'login' ? (
                    <>
                      <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--store-primary)' }}>Customer Sign In</h3>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
                        <input className="form-input" type="email" required placeholder="name@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</label>
                        <input className="form-input" type="password" required placeholder="Enter password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                      </div>
                      <button className="store-btn" style={{ width: '100%', padding: '0.7rem' }} type="submit" disabled={authSubmitting}>Sign In</button>
                      <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                        New to this store? <span style={{ color: 'var(--store-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setAuthMode('register'); setAuthError(''); setAuthMessage(''); }}>Register here</span>
                      </p>
                    </>
                  ) : authMode === 'otp' ? (
                    <>
                      <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--store-primary)' }}>Verify Email</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                        Enter the 6-digit verification code sent to <strong>{authEmail}</strong>
                      </p>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>OTP Code</label>
                        <input className="form-input" type="text" maxLength="6" required placeholder="000000" value={authOtp} onChange={e => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '4px', fontFamily: 'monospace' }} />
                      </div>
                      <button className="store-btn" style={{ width: '100%', padding: '0.7rem' }} type="submit" disabled={authSubmitting}>{authSubmitting ? 'Verifying...' : 'Verify OTP'}</button>
                      <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                        Didn't receive code? <span style={{ color: 'var(--store-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleResendCustomerOtp}>Resend OTP</span>
                      </p>
                      <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }}>Back to Sign In</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--store-primary)' }}>Create Customer Account</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>First Name</label>
                          <input className="form-input" required placeholder="John" value={authFirstName} onChange={e => setAuthFirstName(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Last Name</label>
                          <input className="form-input" required placeholder="Doe" value={authLastName} onChange={e => setAuthLastName(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
                        <input className="form-input" type="email" required placeholder="john.doe@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone</label>
                        <input className="form-input" placeholder="+91 98765 43210" value={authPhone} onChange={e => setAuthPhone(e.target.value)} />
                      </div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password (min 6 chars)</label>
                        <input className="form-input" type="password" required minLength="6" placeholder="Choose secure password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                      </div>
                      <button className="store-btn" style={{ width: '100%', padding: '0.7rem' }} type="submit" disabled={authSubmitting}>Create Account</button>
                      <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                        Already have an account? <span style={{ color: 'var(--store-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }}>Sign In instead</span>
                      </p>
                    </>
                  )}
                </form>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2.5rem' }}>

                {/* Account Navigation */}
                <aside style={{ borderRight: '1px solid var(--border)', paddingRight: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span className={`store-tab ${portalTab === 'profile' ? 'active' : ''}`} onClick={() => setPortalTab('profile')}>👤 My Profile</span>
                    <span className={`store-tab ${portalTab === 'addresses' ? 'active' : ''}`} onClick={() => setPortalTab('addresses')}>🏠 Address Book</span>
                    <span className={`store-tab ${portalTab === 'orders' ? 'active' : ''}`} onClick={() => setPortalTab('orders')}>📦 Order History</span>
                    <span className={`store-tab ${portalTab === 'wishlist' ? 'active' : ''}`} onClick={() => setPortalTab('wishlist')}>❤️ My Wishlist</span>
                  </div>
                </aside>

                {/* Portal Content Area */}
                <div>

                  {/* TAB 1: PROFILE */}
                  {portalTab === 'profile' && (
                    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: '500px' }}>
                      <h3 style={{ marginBottom: '1.5rem' }}>Personal Specifications</h3>
                      <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>First Name</label>
                            <input className="form-input" value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Last Name</label>
                            <input className="form-input" value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                          </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contact Phone</label>
                          <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                        </div>
                        <button className="store-btn" type="submit">Update Information</button>
                      </form>
                    </div>
                  )}

                  {/* TAB 2: ADDRESSES */}
                  {portalTab === 'addresses' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Saved Addresses</h3>
                        <button className="store-btn" style={{ padding: '0.4rem 1rem' }} onClick={() => setShowAddressForm(!showAddressForm)}>
                          {showAddressForm ? 'Cancel' : '+ New Address'}
                        </button>
                      </div>

                      {showAddressForm && (
                        <form onSubmit={handleAddAddress} style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', maxWidth: '500px' }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Address Line 1</label>
                            <input className="form-input" required placeholder="Street address or block number" value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} />
                          </div>
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Address Line 2 (Optional)</label>
                            <input className="form-input" placeholder="Apartment, suite, or unit" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>City</label>
                              <input className="form-input" required placeholder="New Delhi" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>State</label>
                              <input className="form-input" required placeholder="Delhi" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Postal Code / ZIP</label>
                              <input className="form-input" required placeholder="110001" value={addressForm.postalCode} onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Address Label</label>
                              <select className="form-input" value={addressForm.addressType} onChange={e => setAddressForm({ ...addressForm, addressType: e.target.value })}>
                                <option value="Shipping">Shipping</option>
                                <option value="Billing">Billing</option>
                              </select>
                            </div>
                          </div>
                          <button className="store-btn" type="submit">Save Address</button>
                        </form>
                      )}

                      {addresses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No addresses saved yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                          {addresses.map(a => (
                            <div key={a.AddressId} style={{ border: '1px solid var(--border)', background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--store-primary)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '12px', float: 'right' }}>
                                {a.AddressType}
                              </span>
                              <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>🏠 Home</strong>
                              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-dark)' }}>
                                {a.Line1}, {a.Line2 ? `${a.Line2}, ` : ''}{a.City}, {a.State} - {a.PostalCode}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ORDER HISTORY */}
                  {portalTab === 'orders' && (
                    <div>
                      <h3 style={{ marginBottom: '1.5rem' }}>Tenant Specific Order History</h3>
                      {myOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No orders placed under this store yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {myOrders.map(o => (
                            <div key={o.id} style={{ border: '1px solid var(--border)', background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                  <strong>Order #{o.id}</strong>
                                  <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed: {new Date(o.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`order-status-badge ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                              </div>

                              <div style={{ marginBottom: '1rem' }}>
                                {o.items && o.items.map(item => (
                                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <span>{item.productName} ({item.weightGrams >= 1000 ? `${item.weightGrams / 1000} kg` : `${item.weightGrams}g`}) x{item.quantity}</span>
                                    <span>₹{item.unitPrice * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                <span>Grand Total Paid:</span>
                                <span>₹{o.totalAmount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: WISHLIST */}
                  {portalTab === 'wishlist' && (
                    <div>
                      <h3 style={{ marginBottom: '1.5rem' }}>My Wishlist Favorites</h3>
                      {wishlist.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Your wishlist is empty.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                          {wishlist.map(fav => {
                            const p = storeProducts.find(prod => prod.id === fav.productId);
                            if (!p) return null;
                            const v = p.variants && p.variants[0];

                            return (
                              <div key={fav.WishlistId} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                                <img src={p.imageUrl || '/assets/groceesary/1.png'} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                                <h4 style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>{p.name}</h4>
                                {v && <strong style={{ color: 'var(--store-primary)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>₹{v.price}</strong>}
                                <button className="secondary-btn" style={{ width: '100%', padding: '0.3rem', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => handleWishlistToggle(p.id)}>Remove</button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 7: TRACK ORDER STATUS */}
        {subView === 'track-order' && (
          <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--store-primary)', marginBottom: '1rem', textAlign: 'center' }}>Track Your Order</h2>
              <form onSubmit={handleTrackOrder} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter Order ID (e.g., 1)"
                  value={trackOrderId}
                  onChange={e => setTrackOrderId(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                />
                <button className="store-btn" type="submit">Track Status</button>
              </form>
              {trackError && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' }}>{trackError}</p>}
            </div>

            {trackedOrder && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Order ID: #{trackedOrder.id}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed on: {new Date(trackedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`order-status-badge ${trackedOrder.orderStatus.toLowerCase()}`} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                    {trackedOrder.orderStatus}
                  </span>
                </div>

                {/* Fulfillment Timeline */}
                <h4 style={{ marginBottom: '1rem' }}>Fulfillment Timeline</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: 'var(--border)', zIndex: 1 }} />

                  {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const statuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
                    const currentIdx = statuses.indexOf(trackedOrder.orderStatus);
                    const stepIdx = statuses.indexOf(step);
                    const isActive = stepIdx <= currentIdx;

                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2, position: 'relative' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isActive ? 'var(--store-primary)' : 'var(--bg-card)',
                          color: isActive ? '#ffffff' : 'var(--text-muted)',
                          border: '2px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}>
                          {isActive ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'var(--store-primary)' : 'var(--text-muted)' }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {trackedOrder.shipmentTracking && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <h4 style={{ color: 'var(--store-primary)', margin: '0 0 0.75rem 0' }}>📦 Shipping & Carrier Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div><strong>Courier Name:</strong> {trackedOrder.shipmentTracking.courierName}</div>
                      <div><strong>Tracking Number:</strong> <code style={{ background: '#e2e8f0', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{trackedOrder.shipmentTracking.trackingNumber}</code></div>
                    </div>
                    {trackedOrder.shipmentTracking.estimatedDelivery && (
                      <div style={{ color: 'var(--text-muted)' }}>
                        <strong>Estimated Delivery:</strong> {new Date(trackedOrder.shipmentTracking.estimatedDelivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Items */}
                <h4 style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1rem' }}>Order Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {trackedOrder.items && trackedOrder.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>{item.productName} ({item.weightGrams >= 1000 ? `${item.weightGrams / 1000} kg` : `${item.weightGrams}g`}) x{item.quantity}</span>
                      <span>₹{item.unitPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: 'var(--store-primary)' }}>₹{trackedOrder.totalAmount}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Newsletter & Public Footer Section */}
      <footer style={{ background: '#f8fafc', borderTop: '1px solid var(--border)', marginTop: 'auto', padding: '3rem 2rem 1.5rem' }}>

        {/* Newsletter Signup */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2.5rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Keep in touch with {storeName}</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Subscribe to get latest variant stock arrivals and discount offerings.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {newsletterSubscribed ? (
              <span style={{ color: 'var(--store-primary)', fontWeight: 'bold' }}>✓ Subscribed successfully! Thank you.</span>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="your.email@domain.com"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: '260px', outline: 'none' }}
                />
                <button className="store-btn" onClick={() => setNewsletterSubscribed(true)}>Subscribe</button>
              </>
            )}
          </div>
        </div>

        {/* Business Contact Footer Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', fontSize: '0.9rem' }}>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--store-primary)' }}>🛍️ {storeName}</span>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '300px' }}>Powered by SnapShop SaaS Multi-Tenant Commerce Engine.</p>
          </div>
          <div>
            <h5 style={{ margin: '0 0 0.75rem 0', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Merchant Contact</h5>
            <div style={{ color: 'var(--text-dark)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span>📞 Phone: {storeSettings.contactPhone || '9876543210'}</span>
              <span>📧 Email: {storeSettings.supportEmail || 'support@snapshop.com'}</span>
              <span>🏢 Address: {storeSettings.businessAddress || 'India'}</span>
            </div>
          </div>
          <div>
            <h5 style={{ margin: '0 0 0.75rem 0', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Legal Policy</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span className="store-nav-link" onClick={() => window.location.hash = 'privacy'}>Privacy Policy</span>
              <span className="store-nav-link" onClick={() => window.location.hash = 'terms'}>Terms of Use</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '2.5rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} {storeName} Store. All rights reserved. Managed under SnapShop isolated networks.
        </div>
      </footer>

    </div>
  );
};

export default PublicStorefront;
