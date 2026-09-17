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
import './styles/template.css';

const CUSTOMIZABLE_ITEMS = [
  'Logo & Brand Name', 'Brand Colors', 'Hero Banners', 'Homepage Sections',
  'Typography & Fonts', 'Promotional Banners', 'Footer Content & Links',
];

const navItems = [
  { label: 'New', key: 'new-arrivals', icon: '' },
  { label: 'Men', key: 'men', icon: '' },
  { label: 'Women', key: 'women', icon: '' },
  { label: 'Kids', key: 'kids', icon: '' },
  { label: 'Collections', key: 'collections', icon: '' },
  { label: 'Sale', key: 'sale', icon: '' },
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const [showPanel, setShowPanel] = useState(false);
  const isPreview = window.location.hash.includes('template-preview');
  const [cartOpen, setCartOpen] = useState(false);

  const mergedConfig = {
    ...config,
    palette: {
      ...config.palette,
      primary: activeTheme?.settings?.primaryColor || config.palette.primary,
      accent: activeTheme?.settings?.accentColor || config.palette.accent,
    },
    typography: {
      ...config.typography,
      headingFont: activeTheme?.settings?.typography || config.typography.headingFont,
      bodyFont: activeTheme?.settings?.typography || config.typography.bodyFont,
    },
  };

  const handleNavClick = (view) => {
    if (view === 'home' || view === 'new-arrivals') {
      state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('home');
    } else if (view === 'category' || view === 'collections' || view === 'sale') {
      state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('category');
    } else if (view === 'men') {
      state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter('men'); state.navigate('category');
    } else if (view === 'women') {
      state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter('women'); state.navigate('category');
    } else if (view === 'kids') {
      state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter('kids'); state.navigate('category');
    }
    else if (view === 'cart') setCartOpen(true);
    else if (view === 'wishlist') state.navigate('wishlist');
    else if (view === 'account') state.navigate('account');
    else if (view === 'search') state.navigate('search');
    else if (view === 'about') state.navigate('about');
    else if (view === 'contact') state.navigate('contact');
    else if (view === 'faq') state.navigate('faq');
    else if (view === 'privacy') state.navigate('privacy');
    else if (view === 'terms') state.navigate('terms');
    else state.navigate('home');
  };

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
    <div className="sports-template">
      <CustomHeader state={state} onNavClick={handleNavClick} onCartClick={() => setCartOpen(true)} config={mergedConfig} />

      <div className="template-body-container">
        {renderPage()}
      </div>

      {isPreview && (
        <PreviewPanel config={mergedConfig} show={showPanel} onToggle={() => setShowPanel(!showPanel)} onUseTemplate={() => {}} />
      )}

      <SlideoutCart open={cartOpen} onClose={() => setCartOpen(false)} state={state} />

      <CustomFooter config={mergedConfig} onNavClick={handleNavClick} />
    </div>
  );
}

function PreviewPanel({ config, show, onToggle, onUseTemplate }) {
  const info = config.previewPanel || {};

  return (
    <>
      <button
        onClick={onToggle}
        style={{
          position: 'fixed', top: '70px', right: show ? '300px' : '0', zIndex: 95,
          background: '#111', color: '#fff', border: 'none', padding: '8px 12px',
          cursor: 'pointer', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', fontFamily: 'inherit', transition: 'right 0.3s',
        }}
      >
        {show ? '✕' : '📋 Info'}
      </button>

      <div className={`sp-preview-panel ${show ? 'show' : ''}`} style={{ transform: show ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>Template Info</h3>
          <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#111' }}>✕</button>
        </div>

        <div className="sp-preview-row"><span className="sp-preview-label">Name</span><span className="sp-preview-value">{info.templateName || 'Sports Performance'}</span></div>
        <div className="sp-preview-row"><span className="sp-preview-label">Category</span><span className="sp-preview-value">{info.category || 'Sports & Activewear'}</span></div>
        <div className="sp-preview-row"><span className="sp-preview-label">Style</span><span className="sp-preview-value">{info.style || 'Modern / Premium / Athletic'}</span></div>
        <div className="sp-preview-row"><span className="sp-preview-label">Responsive</span><span className="sp-preview-value">{info.responsive || 'Desktop, Tablet, Mobile'}</span></div>
        <div className="sp-preview-row"><span className="sp-preview-label">Best For</span><span className="sp-preview-value">{info.bestFor || 'Sportswear, Footwear, Fitness'}</span></div>

        <div className="sp-preview-actions">
          <button className="sp-btn-primary" onClick={() => window.location.hash = 'template-preview?template=nike-inspired'}>
            Preview Template
          </button>
          <button className="sp-btn-secondary" onClick={onUseTemplate}>
            Use This Template
          </button>
        </div>

        <h3 style={{ marginTop: '1.5rem' }}>Customizable Elements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {['Logo & Brand Name', 'Brand Colors', 'Hero Banners', 'Homepage Sections', 'Typography', 'Promotional Banners', 'Footer Content'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#333' }}>
              <span style={{ color: '#00e676' }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CustomHeader({ state, onNavClick, onCartClick, config }) {
  const curUser = state.auth?.user;
  const curToken = state.auth?.token;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 80,
      background: config.palette.surface || '#fff',
      borderBottom: `1px solid ${config.palette.border || '#e0e0e0'}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4%', height: '56px', maxWidth: '1440px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div
            style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.2em', cursor: 'pointer', textTransform: 'uppercase' }}
            onClick={() => onNavClick('home')}
          >
            {config.storeName || 'SPORTS PERFORMANCE'}
          </div>
          <nav>
            <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {navItems.map((item, i) => (
                <li key={i}>
                  <button
                    style={{
                      color: config.palette.text || '#111', textDecoration: 'none', fontWeight: 600, cursor: 'pointer',
                      background: 'none', border: 'none', fontSize: '0.72rem', letterSpacing: '0.08em',
                      textTransform: 'uppercase', fontFamily: 'inherit', padding: 0,
                    }}
                    onClick={() => onNavClick(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button onClick={() => onNavClick('search')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0 }} aria-label="Search">🔍</button>
          <button onClick={() => onNavClick('wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0 }} aria-label="Wishlist">♡</button>
          <button onClick={() => onNavClick('account')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0, letterSpacing: '0.05em' }}>
            {curToken && curUser ? (curUser.firstName || 'Account') : 'Sign In'}
          </button>
          <button onClick={onCartClick} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: config.palette.text || '#111', fontFamily: 'inherit', padding: 0, fontWeight: 600 }} aria-label="Cart">
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
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>🏃</div>
              <h3 className="zara-empty-title">Your bag is empty</h3>
              <p className="zara-empty-desc">Gear up with our latest performance collection.</p>
              <button className="sp-btn" onClick={() => { onClose(); state.navigate('category'); }}>Shop Now</button>
            </div>
          ) : (
            cartArray.map((item, idx) => (
              <div key={item.id || idx} className="zara-cart-item">
                <img src={item.image || `https://placehold.co/160x200/f5f5f5/aaa?text=Item`} alt={item.name} className="zara-cart-item-image" />
                <div className="zara-cart-item-info">
                  <h4 className="zara-cart-item-name">{item.name}</h4>
                  <p className="zara-cart-item-details">{item.size ? `Size: ${item.size}` : ''}{item.color ? ` | ${item.color}` : ''}</p>
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
              <input className="zara-cart-promo-input" placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
              <button className="zara-cart-promo-btn" onClick={() => { if (promoCode.toUpperCase() === 'SPORT10') setPromoApplied(true); }}>Apply</button>
            </div>
            {promoApplied && <p style={{ fontSize: '0.75rem', color: '#00e676', marginBottom: '0.75rem', fontWeight: 600 }}>✓ SPORT10 applied — 10% off</p>}
            <div className="zara-cart-totals">
              <div className="zara-cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="zara-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="zara-cart-total-row"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
              {promoDiscount > 0 && <div className="zara-cart-total-row"><span>Discount</span><span>-₹{promoDiscount.toLocaleString()}</span></div>}
              <div className="zara-cart-total-row grand"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>
            <button className="zara-checkout-btn" onClick={() => { onClose(); state.navigate('checkout'); }}>Checkout</button>
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
    <footer style={{ background: '#111', color: '#fff', padding: '3rem 4% 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 1rem', color: '#fff' }}>
            {config.storeName || 'SPORTS PERFORMANCE'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: '1.6', maxWidth: '240px' }}>
            Premium sportswear engineered for champions. Push your limits with performance gear designed to go further.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {socialLinks.map((s, i) => (
              <span key={i} style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', color: '#888', transition: 'color 0.2s' }}>{s.icon}</span>
            ))}
          </div>
        </div>
        {columns.map((col, idx) => (
          <div key={idx}>
            <h4 style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 1rem', color: '#fff' }}>{col.title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
              {col.links?.map((link, lIdx) => (
                <li key={lIdx}>
                  <span style={{ fontSize: '0.75rem', color: '#888', cursor: 'pointer', transition: 'color 0.2s' }}
                    onClick={() => {
                      const l = link.toLowerCase();
                      if (l.includes('contact')) onNavClick('contact');
                      else if (l.includes('faq')) onNavClick('faq');
                      else if (l.includes('about')) onNavClick('about');
                      else if (l.includes('privacy')) onNavClick('privacy');
                      else if (l.includes('terms')) onNavClick('terms');
                      else onNavClick('category');
                    }}
                  >{link}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.65rem', color: '#666', letterSpacing: '0.05em' }}>
        &copy; {new Date().getFullYear()} {config.storeName || 'SPORTS PERFORMANCE'}. All rights reserved.
      </div>
    </footer>
  );
}
