import React, { useState } from 'react';

import { useTemplateState } from '../../_shared/hooks/useTemplateState';
import config from './config.json';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './styles/template.css';

const NAV_ITEMS = [
  { label: 'New Arrivals', key: 'new' },
  { label: 'Makeup', key: 'category' },
  { label: 'Skincare', key: 'category' },
  { label: 'Fragrance', key: 'category' },
  { label: 'Hair Care', key: 'category' },
  { label: 'Brands', key: 'brands' },
  { label: 'Offers', key: 'sale' },
];

const PREVIEW_ITEMS = [
  'Logo & Brand Name',
  'Brand Colors',
  'Fonts & Typography',
  'Hero Banners',
  'Promotional Banners',
  'Homepage Section Order',
  'Featured Brands',
  'Featured Collections',
  'Announcement Bar',
  'Footer Content',
  'Social Media Links',
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const { token, user } = state.auth;
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNav = (view) => {
    if (view === 'home' || view === 'new') state.navigate('home');
    else if (view === 'category') state.navigate('category');
    else if (view === 'cart') { setCartOpen(true); }
    else if (view === 'wishlist') state.navigate('wishlist');
    else if (view === 'account') state.navigate('account');
    else if (view === 'about') state.navigate('about');
    else if (view === 'contact') state.navigate('contact');
    else if (view === 'faq') state.navigate('faq');
    else if (view === 'privacy') state.navigate('privacy');
    else if (view === 'terms') state.navigate('terms');
    else if (view === 'search') state.navigate('search');
    else state.navigate('home');
  };

  const mergedConfig = {
    ...config,
    palette: {
      ...config.palette,
      primary: activeTheme?.settings?.primaryColor || config.palette.primary,
      accent: activeTheme?.settings?.accentColor || config.palette.accent,
    },
    typography: {
      ...config.typography,
      headingFont: activeTheme?.settings?.headingFont || config.typography.headingFont,
      bodyFont: activeTheme?.settings?.bodyFont || config.typography.bodyFont,
    },
    borderRadius: {
      ...config.borderRadius,
      lg: activeTheme?.settings?.borderRadius || config.borderRadius.lg,
    }
  };

  const renderPage = () => {
    switch (state.currentView) {
      case 'home': return <HomePage state={state} />;
      case 'product': return <ProductDetailPage state={state} />;
      case 'cart': return <CartPage state={{ ...state, setCartOpen }} />;
      case 'checkout': return <CheckoutPage state={state} />;
      case 'category': return <CategoryPage state={state} />;
      case 'search': return <SearchPage state={state} />;
      case 'wishlist': return <WishlistPage state={state} />;
      case 'account': return <AccountPage state={state} />;
      case 'orderSuccess': return <OrderSuccessPage state={state} />;
      case 'about': return <AboutPage state={state} />;
      case 'contact': return <ContactPage state={state} />;
      case 'faq': return <FAQPage state={state} />;
      case 'privacy': return <PrivacyPage state={state} />;
      case 'terms': return <TermsPage state={state} />;
      default: return <HomePage state={state} />;
    }
  };

  const cartItems = state.cart || [];
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + (i.price || i.variant?.price || 0) * i.quantity, 0);

  return (
    <div className="bl-body">
      {/* Announcement Bar */}
      <div className="bl-topbar">
        Free shipping on orders over ₹999 &nbsp;|&nbsp; Use code <strong>BEAUTY10</strong> for 10% off
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#fff',
        borderBottom: '1px solid var(--bl-border)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '70px',
        }}>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', fontFamily: 'inherit', padding: '0.5rem' }}
            className="bl-mobile-menu-btn"
          >
            ☰
          </button>

          <div
            onClick={() => handleNav('home')}
            style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer', color: '#1a1a1a', letterSpacing: '-0.02em' }}
          >
            {mergedConfig.storeName}
          </div>

          <nav style={{ display: 'flex', gap: '1.75rem' }}>
            {NAV_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleNav(item.key)}
                style={{
                  background: 'none', border: 'none', fontFamily: 'var(--bl-font-body)',
                  fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em',
                  textTransform: 'uppercase', cursor: 'pointer', color: '#1a1a1a',
                  padding: '0', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => handleNav('search')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem', transition: 'opacity 0.2s', lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              title="Search"
            >
              🔍
            </button>
            <button onClick={() => handleNav('wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem', transition: 'opacity 0.2s', lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              title="Wishlist"
            >
              ♡
            </button>
            <button onClick={() => handleNav('account')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', padding: '0.25rem', transition: 'opacity 0.2s', lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {token && user && user.role === 'Customer' ? user.firstName || 'Account' : 'Sign In'}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', padding: '0.25rem', transition: 'opacity 0.2s', lineHeight: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              title="Cart"
            >
              🛍️
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-6px',
                  background: '#c9a96e', color: '#fff', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.6rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: '#fff',
          padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <button onClick={() => setMobileNavOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
          {NAV_ITEMS.map((item, i) => (
            <button key={i} onClick={() => { handleNav(item.key); setMobileNavOpen(false); }}
              style={{ background: 'none', border: 'none', fontSize: '1.1rem', padding: '0.75rem 0', textAlign: 'left', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit', color: '#1a1a1a', borderBottom: '1px solid var(--bl-border)' }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Cart Slideout */}
      <div className={`bl-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`bl-cart-slideout ${cartOpen ? 'open' : ''}`}>
        <div className="bl-cart-header">
          <h3>Shopping Bag ({cartCount})</h3>
          <button className="bl-cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="bl-cart-items">
          {cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#8a8a8a', padding: '3rem 0' }}>Your bag is empty.</p>
          ) : (
            cartItems.map((item, idx) => (
              <div key={item.id || idx} className="bl-cart-item">
                <img
                  src={item.image || `https://placehold.co/140x180/f8f5f1/8a8a8a?text=P`}
                  alt={item.name}
                  className="bl-cart-item-img"
                />
                <div className="bl-cart-item-details">
                  <div className="bl-cart-item-name">{item.name}</div>
                  <div className="bl-cart-item-brand">{item.brand || 'Luxe Beauty'}</div>
                  <div className="bl-cart-item-price">₹{(item.price || item.variant?.price || 0).toLocaleString()}</div>
                  <div className="bl-cart-qty">
                    <button onClick={() => { if (item.quantity > 1) state.updateCartQuantity?.(item.id, item.quantity - 1); }}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => state.updateCartQuantity?.(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="bl-cart-remove" onClick={() => state.removeFromCart?.(item.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bl-cart-footer">
          <div className="bl-cart-promo">✨ Free sample with every order</div>
          <div className="bl-cart-total">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <button className="bl-cart-checkout-btn" onClick={() => { handleNav('cart'); setCartOpen(false); }}>
            View Bag & Checkout
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bl-preview-panel">
        <h2>{config.previewPanel.name}</h2>
        <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '1.5rem' }}>
          Template Preview — customize everything for your brand
        </p>

        <div style={{
          height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem',
          background: '#f8f5f1',
        }}>
          <img
            src={config.previewPanel.image}
            alt="Beauty Luxe Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div className="bl-preview-meta">
          <div className="bl-preview-meta-item">
            <span className="bl-preview-label">Category</span>
            <span className="bl-preview-value">{config.previewPanel.category}</span>
          </div>
          <div className="bl-preview-meta-item">
            <span className="bl-preview-label">Style</span>
            <span className="bl-preview-value">{config.previewPanel.style}</span>
          </div>
          <div className="bl-preview-meta-item">
            <span className="bl-preview-label">Best For</span>
            <span className="bl-preview-value">{config.previewPanel.bestFor}</span>
          </div>
          <div className="bl-preview-meta-item">
            <span className="bl-preview-label">Responsive</span>
            <span className="bl-preview-value">{config.previewPanel.responsive}</span>
          </div>
        </div>

        <div className="bl-preview-actions">
          <button className="bl-btn bl-btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
            🔍 Live Preview
          </button>
          <button className="bl-btn bl-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            Use This Template
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8f5f1', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1a1a1a' }}>
            ✓ Customizable Elements
          </p>
          <div className="bl-preview-check-list">
            {PREVIEW_ITEMS.map((item, i) => (
              <div key={i} className="bl-preview-check-item">
                <span className="bl-check">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (with right margin for preview panel) */}
      <div style={{ marginRight: '340px' }}>
        {renderPage()}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bl-mobile-menu-btn { display: block !important; }
          .bl-preview-panel { display: none; }
          div[style*="margin-right: 340px"] { margin-right: 0 !important; }
          header nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
