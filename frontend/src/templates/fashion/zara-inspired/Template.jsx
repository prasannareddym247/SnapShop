import React, { useState } from 'react';
import TemplateWrapper from '../../_shared/utils/TemplateWrapper';
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
import { useTheme } from '../../_shared/utils/ThemeEngine';
import './styles/template.css';

const navItems = [
  { label: 'New Arrivals', key: 'new-arrivals', icon: '' },
  { label: 'Women', key: 'women', icon: '' },
  { label: 'Men', key: 'men', icon: '' },
  { label: 'Kids', key: 'kids', icon: '' },
  { label: 'Collections', key: 'collections', icon: '' },
  { label: 'Sale', key: 'sale', icon: '' }
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const mergedConfig = {
    ...config,
    palette: {
      ...config.palette,
      primary: activeTheme?.settings?.primaryColor || config.palette.primary,
      secondary: activeTheme?.settings?.secondaryColor || config.palette.secondary,
    },
    typography: {
      ...config.typography,
      headingFont: activeTheme?.settings?.typography ? activeTheme.settings.typography : config.typography.headingFont,
      bodyFont: activeTheme?.settings?.typography ? activeTheme.settings.typography : config.typography.bodyFont,
    },
    borderRadius: {
      ...config.borderRadius,
      lg: activeTheme?.settings?.borderRadius || config.borderRadius.lg,
    }
  };

  const handleNavClick = (view) => {
    setMobileMenuOpen(false);
    if (view === 'home' || view === 'new-arrivals') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter(null);
      state.navigate('home');
    }
    else if (view === 'category' || view === 'collections') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter(null);
      state.navigate('category');
    }
    else if (view === 'sale') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter(null);
      state.navigate('category');
    }
    else if (view === 'men') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter('men');
      state.navigate('category');
    }
    else if (view === 'women') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter('women');
      state.navigate('category');
    }
    else if (view === 'kids') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter('kids');
      state.navigate('category');
    }
    else if (view === 'cart') setCartOpen(true);
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

  const handleCartClick = () => setCartOpen(true);

  const renderPage = () => {
    switch (state.currentView) {
      case 'home': return <HomePage state={state} />;
      case 'product': return <ProductDetailPage state={state} />;
      case 'cart': return <CartPage state={state} />;
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

  return (
    <div className="zara-template">
      <CustomHeader
        state={state}
        onNavClick={handleNavClick}
        onCartClick={handleCartClick}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        config={mergedConfig}
      />

      <div className="template-body-container">
        {renderPage()}
      </div>

      <SlideoutCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        state={state}
      />

      <CustomFooter config={mergedConfig} onNavClick={handleNavClick} />
    </div>
  );
}

function CustomHeader({ state, onNavClick, onCartClick, mobileMenuOpen, setMobileMenuOpen, config }) {
  const curUser = state.auth?.user;
  const curToken = state.auth?.token;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: config.palette.surface || '#fff',
      borderBottom: `1px solid ${config.palette.border || '#e8e8e8'}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4%',
        height: '60px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div
          style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em', cursor: 'pointer', textTransform: 'uppercase' }}
          onClick={() => onNavClick('home')}
        >
          {config.storeName || config.name || 'ZARA MODE'}
        </div>

        <nav>
          <ul className={mobileMenuOpen ? 'open' : ''} style={{
            display: 'flex',
            gap: '1.75rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            {navItems.map((item, i) => (
              <li key={i}>
                <button
                  style={{
                    color: config.palette.text || '#111',
                    textDecoration: 'none',
                    fontWeight: 400,
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                    padding: '0',
                  }}
                  onClick={() => onNavClick(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={() => onNavClick('search')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0 }}
            aria-label="Search"
          >
            Search
          </button>
          <button
            onClick={() => onNavClick('wishlist')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0 }}
            aria-label="Wishlist"
          >
            ♡
          </button>
          <button
            onClick={() => onNavClick('account')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0 }}
            aria-label="Account"
          >
            {curToken && curUser ? (curUser.firstName || 'Account') : 'Sign In'}
          </button>
          <button
            onClick={onCartClick}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: config.palette.text || '#111',
              fontFamily: 'inherit',
              padding: 0,
            }}
            aria-label="Cart"
          >
            Bag ({state.cartCount || 0})
          </button>
        </div>
      </div>
    </header>
  );
}

function SlideoutCart({ open, onClose, state }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!open) return null;

  const cartArray = Array.isArray(state.cart) ? state.cart : [];

  const subtotal = state.cartTotal || cartArray.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 5000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.05);
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = subtotal + shipping + tax - promoDiscount;

  const handlePromoApply = () => {
    if (promoCode.trim().toUpperCase() === 'ZARA10') {
      setPromoApplied(true);
    }
  };

  return (
    <div className="zara-cart-overlay" onClick={onClose}>
      <div className="zara-cart-panel" onClick={e => e.stopPropagation()}>
        <div className="zara-cart-header">
          <h3 className="zara-cart-title">Shopping Bag</h3>
          <button className="zara-cart-close" onClick={onClose}>✕</button>
        </div>

        <div className="zara-cart-items">
          {cartArray.length === 0 ? (
            <div className="zara-empty-state">
              <div className="zara-empty-icon">🛍</div>
              <h3 className="zara-empty-title">Your bag is empty</h3>
              <p className="zara-empty-desc">Discover our latest collection and find your style.</p>
              <button className="zara-btn zara-btn-dark" onClick={() => { onClose(); state.navigate('category'); }}>
                Shop Now
              </button>
            </div>
          ) : (
            cartArray.map((item, idx) => (
              <div key={item.id || idx} className="zara-cart-item">
                <img
                  src={item.image || `https://placehold.co/160x200/f5f5f5/aaa?text=Item`}
                  alt={item.name}
                  className="zara-cart-item-image"
                />
                <div className="zara-cart-item-info">
                  <h4 className="zara-cart-item-name">{item.name}</h4>
                  <p className="zara-cart-item-details">
                    {item.size && `Size: ${item.size}`}{item.color && ` | Color: ${item.color}`}
                  </p>
                  <p className="zara-cart-item-price">₹{item.price}</p>
                  <div className="zara-cart-qty">
                    <button className="zara-cart-qty-btn" onClick={() => state.updateCartQuantity?.(item.id, Math.max(1, (item.quantity || 1) - 1))}>−</button>
                    <span className="zara-cart-qty-value">{item.quantity || 1}</span>
                    <button className="zara-cart-qty-btn" onClick={() => state.updateCartQuantity?.(item.id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <button className="zara-cart-remove" onClick={() => state.removeFromCart?.(item.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartArray.length > 0 && (
          <div className="zara-cart-footer">
            <div className="zara-cart-promo">
              <input
                className="zara-cart-promo-input"
                placeholder="Promo code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
              <button className="zara-cart-promo-btn" onClick={handlePromoApply}>Apply</button>
            </div>
            {promoApplied && <p style={{ fontSize: '0.75rem', color: '#000', marginBottom: '0.75rem' }}>Promo ZARA10 applied — 10% off</p>}
            <div className="zara-cart-totals">
              <div className="zara-cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="zara-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="zara-cart-total-row"><span>Tax (5%)</span><span>₹{tax.toLocaleString()}</span></div>
              {promoDiscount > 0 && <div className="zara-cart-total-row"><span>Promo Discount</span><span>-₹{promoDiscount.toLocaleString()}</span></div>}
              <div className="zara-cart-total-row grand"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>
            <button className="zara-checkout-btn" onClick={() => { onClose(); state.navigate('checkout'); }}>
              Checkout — ₹{grandTotal.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomFooter({ config, onNavClick }) {
  const columns = config.footerColumns || [];
  const socialLinks = config.socialLinks || [];

  return (
    <footer style={{
      background: config.palette.bgAlt || '#f5f5f5',
      borderTop: `1px solid ${config.palette.border || '#e8e8e8'}`,
      padding: '3rem 4% 1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
            {config.storeName || 'ZARA MODE'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: config.palette.textMuted || '#757575', lineHeight: '1.6', maxWidth: '260px' }}>
            Minimalist luxury fashion for the modern wardrobe. Thoughtfully designed, ethically made.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {socialLinks.map((s, i) => (
              <span key={i} style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', color: config.palette.textMuted || '#757575' }}>
                {s.icon}
              </span>
            ))}
          </div>
        </div>
        {columns.map((col, idx) => (
          <div key={idx}>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 1rem', color: config.palette.text || '#111' }}>
              {col.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
              {col.links?.map((link, lIdx) => (
                <li key={lIdx}>
                  <span
                    style={{ fontSize: '0.8rem', color: config.palette.textMuted || '#757575', cursor: 'pointer', transition: 'color 0.2s' }}
                    onClick={() => {
                      const lower = link.toLowerCase();
                      if (lower.includes('contact')) onNavClick?.('contact');
                      else if (lower.includes('faq')) onNavClick?.('faq');
                      else if (lower.includes('about')) onNavClick?.('about');
                      else if (lower.includes('privacy')) onNavClick?.('privacy');
                      else if (lower.includes('terms')) onNavClick?.('terms');
                      else onNavClick?.('category');
                    }}
                  >
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${config.palette.border || '#e8e8e8'}`, marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.7rem', color: config.palette.textMuted || '#757575', letterSpacing: '0.05em' }}>
        &copy; {new Date().getFullYear()} {config.storeName || 'ZARA MODE'}. All rights reserved.
      </div>
    </footer>
  );
}
