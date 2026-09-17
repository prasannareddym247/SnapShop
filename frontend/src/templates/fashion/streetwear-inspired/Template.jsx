import React, { useState, useEffect, useRef } from 'react';
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

const URBAN_PRODUCTS = [
  { id: 'sw1', name: 'Oversized Hoodie', price: 89, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1578768079052-aa76e54e22f1?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', colors: ['#111', '#fff', '#ff2d55', '#222'], rating: 4.5, reviews: 128, isNew: true, isLimited: false },
  { id: 'sw2', name: 'Graphic Tee', price: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&auto=format&fit=crop&q=80', category: 'T-Shirts', colors: ['#fff', '#111', '#ff2d55'], rating: 4.3, reviews: 94, isNew: true, isLimited: false },
  { id: 'sw3', name: 'Cargo Pants', price: 110, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80', category: 'Pants', colors: ['#222', '#3a3a3a', '#111'], rating: 4.6, reviews: 67, isNew: false, isLimited: true },
  { id: 'sw4', name: 'Bomber Jacket', price: 180, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#111', '#2a2a2a'], rating: 4.7, reviews: 42, isNew: false, isLimited: false },
  { id: 'sw5', name: 'Sneakers Pro', price: 145, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#ff2d55', '#222'], rating: 4.8, reviews: 203, isNew: true, isLimited: false },
  { id: 'sw6', name: 'Trucker Cap', price: 35, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1534215754734-18f55d13e65d?w=400&auto=format&fit=crop&q=80', category: 'Caps', colors: ['#111', '#ff2d55', '#fff', '#222'], rating: 4.2, reviews: 56, isNew: false, isLimited: false },
  { id: 'sw7', name: 'Crossbody Bag', price: 65, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&auto=format&fit=crop&q=80', category: 'Bags', colors: ['#111', '#fff', '#222'], rating: 4.4, reviews: 38, isNew: true, isLimited: false },
  { id: 'sw8', name: 'Chain Necklace', price: 55, image: 'https://images.unsplash.com/photo-1515562141589-80e5a2e3c2b4?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&auto=format&fit=crop&q=80', category: 'Accessories', colors: ['#c0c0c0', '#ffd700'], rating: 4.1, reviews: 29, isNew: false, isLimited: true },
  { id: 'sw9', name: 'Tech Fleece Hoodie', price: 120, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1578768079052-aa76e54e22f1?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', colors: ['#222', '#555', '#111'], rating: 4.6, reviews: 89, isNew: true, isLimited: false },
  { id: 'sw10', name: 'Runner Sneakers', price: 130, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#ff6b35'], rating: 4.7, reviews: 156, isNew: false, isLimited: false },
  { id: 'sw11', name: 'Denim Jacket', price: 160, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1527016021513-09774b4c77c5?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#2a4a7f', '#111'], rating: 4.5, reviews: 73, isNew: false, isLimited: true },
  { id: 'sw12', name: 'Slim Joggers', price: 75, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80', category: 'Pants', colors: ['#111', '#333', '#555'], rating: 4.3, reviews: 112, isNew: false, isLimited: false },
];

const CATEGORIES = [
  { name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&auto=format&fit=crop&q=80', count: '24 Items' },
  { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&auto=format&fit=crop&q=80', count: '36 Items' },
  { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&auto=format&fit=crop&q=80', count: '18 Items' },
  { name: 'Sneakers', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop&q=80', count: '42 Items' },
  { name: 'Pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&auto=format&fit=crop&q=80', count: '28 Items' },
  { name: 'Caps', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80', count: '15 Items' },
  { name: 'Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80', count: '12 Items' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1515562141589-80e5a2e3c2b4?w=300&auto=format&fit=crop&q=80', count: '30 Items' },
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [previewBtnText, setPreviewBtnText] = useState('Preview Demo from Dashboard');
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const isPreview = window.location.hash.includes('template-preview');

  useEffect(() => { if (state.cartCount === undefined) state.cartCount = 0; }, []);

  const mergedConfig = {
    ...config,
    palette: { ...config.palette, primary: activeTheme?.settings?.primaryColor || config.palette.primary, secondary: activeTheme?.settings?.secondaryColor || config.palette.secondary },
    typography: { ...config.typography, headingFont: activeTheme?.settings?.typography || config.typography.headingFont, bodyFont: activeTheme?.settings?.typography || config.typography.bodyFont },
    borderRadius: { ...config.borderRadius, lg: activeTheme?.settings?.borderRadius || config.borderRadius.lg }
  };

  const handleNavClick = (view) => {
    setMobileNavOpen(false);
    if (view === 'home' || view === 'Home') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('home'); return; }
    if (view === 'category' || view === 'Category') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('category'); return; }
    if (view === 'men') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter('men'); state.navigate('category'); return; }
    if (view === 'women') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter('women'); state.navigate('category'); return; }
    if (view === 'cart' || view === 'Cart') { setCartOpen(true); return; }
    if (view === 'wishlist') state.navigate('wishlist');
    else if (view === 'account') state.navigate('account');
    else if (view === 'search') state.navigate('search');
    else if (view === 'about') state.navigate('about');
    else if (view === 'contact') state.navigate('contact');
    else if (view === 'faq') state.navigate('faq');
    else if (view === 'privacy') state.navigate('privacy');
    else if (view === 'terms') state.navigate('terms');
    else state.navigate('home');
  };

  const cartItems = (state.cart || []).slice(0, 3);
  const subtotal = (state.cart || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const colorMap = { 'Sneakers': 'sw5', 'Apparel': 'sw1', 'Accessories': 'sw8' };

  return (
    <div className="urban-template">
      {announcementVisible && (
        <div className="urban-announcement">
          FREE SHIPPING ON ORDERS OVER $100 · USE CODE: <a href="#" onClick={(e) => { e.preventDefault(); setPromoCode('URBAN10'); }}>URBAN10</a> FOR 10% OFF
          <button onClick={() => setAnnouncementVisible(false)} style={{ background: 'none', border: 'none', color: '#fff', marginLeft: '1rem', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}>✕</button>
        </div>
      )}

      <header className="urban-header">
        <div className="urban-header-logo" onClick={() => handleNavClick('home')}>
          URBAN<span>HYPE</span>
        </div>
        <nav className="urban-header-nav">
          <button onClick={() => handleNavClick('category')}>New Drops</button>
          <button onClick={() => handleNavClick('men')}>Men</button>
          <button onClick={() => handleNavClick('women')}>Women</button>
          <button onClick={() => handleNavClick('category')}>Sneakers</button>
          <button onClick={() => handleNavClick('category')}>Apparel</button>
          <button onClick={() => handleNavClick('category')}>Accessories</button>
          <button onClick={() => handleNavClick('category')}>Collections</button>
          <button className="urban-sale-link" onClick={() => handleNavClick('category')}>Sale</button>
        </nav>
        <div className="urban-header-actions">
          <button onClick={() => handleNavClick('search')} title="Search">⌕</button>
          <button onClick={() => handleNavClick('wishlist')} title="Wishlist">♡</button>
          <button onClick={() => handleNavClick('account')} title="Account">◯</button>
          <button className="urban-cart-btn" onClick={() => setCartOpen(true)} title="Cart">
            🛒
            {(state.cart?.length || 0) > 0 && <span className="urban-cart-count">{state.cart.length}</span>}
          </button>
          <button className="urban-mobile-toggle" onClick={() => setMobileNavOpen(true)}>☰</button>
        </div>
      </header>

      <div className={`urban-mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
        <button className="urban-mobile-close" onClick={() => setMobileNavOpen(false)}>✕</button>
        <button onClick={() => handleNavClick('home')}>Home</button>
        <button onClick={() => handleNavClick('category')}>New Drops</button>
        <button onClick={() => handleNavClick('men')}>Men</button>
        <button onClick={() => handleNavClick('women')}>Women</button>
        <button onClick={() => handleNavClick('category')}>Sneakers</button>
        <button onClick={() => handleNavClick('category')}>Apparel</button>
        <button onClick={() => handleNavClick('category')}>Accessories</button>
        <button onClick={() => handleNavClick('category')}>Collections</button>
        <button onClick={() => handleNavClick('category')} style={{ color: '#ff2d55' }}>Sale</button>
        <button onClick={() => handleNavClick('search')}>Search</button>
      </div>

      {/* Preview Panel */}
      {isPreview && (
        <>
          <div className={`urban-preview-overlay ${previewOpen ? 'open' : ''}`} onClick={() => setPreviewOpen(false)} />
          <div className={`urban-preview-panel ${previewOpen ? 'open' : ''}`}>
            <h2>UrbanHype Streetwear</h2>
            <div>
              <span className="urban-preview-tag">Streetwear</span>
              <span className="urban-preview-tag">Urban Fashion</span>
              <span className="urban-preview-tag">Responsive</span>
              <span className="urban-preview-tag">Premium</span>
            </div>
            <div className="urban-preview-divider" />
            <div className="urban-preview-meta"><strong>Template Name:</strong> UrbanHype Streetwear</div>
            <div className="urban-preview-meta"><strong>Category:</strong> Streetwear & Urban Fashion</div>
            <div className="urban-preview-meta"><strong>Style:</strong> Bold · Modern · Urban</div>
            <div className="urban-preview-meta"><strong>Best For:</strong> Streetwear, Sneakers, Hoodies, Apparel, Accessories, Lifestyle Brands</div>
            <div className="urban-preview-meta"><strong>Responsive:</strong> Desktop · Tablet · Mobile</div>
            <div className="urban-preview-divider" />
            <div className="urban-preview-actions">
              <button className="urban-preview-btn urban-preview-btn-primary">Live Preview</button>
              <button className="urban-preview-btn urban-preview-btn-secondary">Use This Template</button>
              <button className="urban-preview-btn urban-preview-btn-secondary">Design Style</button>
            </div>
            <div className="urban-preview-divider" />
            <div className="urban-preview-checklist">
              <h3>Sellers Can Customize</h3>
              {['Logo', 'Brand Colors', 'Typography', 'Homepage Banners', 'Hero Images', 'Homepage Section Order', 'Promotional Banners', 'Featured Collections', 'Category Images', 'Footer Content', 'Social Media Links', 'Store Announcements'].map(item => (
                <div key={item} className="urban-preview-checklist-item">
                  <span className="check">✓</span> {item}
                </div>
              ))}
            </div>
            <div className="urban-preview-divider" />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Fully Customizable', 'Modern Design', 'Bold Aesthetic', 'Mobile First'].map(tag => (
                <span key={tag} className="urban-badge" style={{ background: 'transparent', border: '1px solid var(--sw-primary)', color: 'var(--sw-primary)' }}>{tag}</span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={`urban-slideout-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`urban-slideout-cart ${cartOpen ? 'open' : ''}`}>
        <div className="urban-cart-header">
          <h2>Shopping Bag ({state.cart?.length || 0})</h2>
          <button className="urban-cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="urban-cart-items">
          {(state.cart || []).length === 0 ? (
            <div className="urban-cart-empty">
              <div className="empty-icon">🛍️</div>
              <p>Your bag is empty</p>
              <button className="urban-btn-primary" style={{ marginTop: '1rem', fontSize: '0.75rem', padding: '0.75rem 1.5rem' }} onClick={() => { setCartOpen(false); }}>Shop Now</button>
            </div>
          ) : (
            state.cart.map((item, i) => {
              const prod = URBAN_PRODUCTS.find(p => p.id === item.id) || item;
              return (
                <div key={i} className="urban-cart-item">
                  <img src={prod.image || item.image} alt={prod.name || item.name} />
                  <div className="urban-cart-item-details">
                    <h4>{prod.name || item.name}</h4>
                    <p>Qty: {item.qty || 1}</p>
                    <span className="price">${((prod.price || item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                    <div className="urban-cart-qty">
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1)); }}>−</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, (item.qty || 1) + 1); }}>+</button>
                    </div>
                  </div>
                  <button className="urban-cart-item-remove" onClick={() => { if (state.removeFromCart) state.removeFromCart(item.id); }}>✕</button>
                </div>
              );
            })
          )}
        </div>
        {(state.cart || []).length > 0 && (
          <div className="urban-cart-footer">
            <div className="urban-cart-promo">
              <input type="text" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button onClick={() => { if (promoCode.trim()) alert(`Code "${promoCode}" applied!`); }}>Apply</button>
            </div>
            <div className="urban-cart-totals">
              <div className="urban-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="urban-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="urban-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
            </div>
            <button className="urban-cart-checkout-btn" onClick={() => { setCartOpen(false); state.navigate('checkout'); }}>Checkout →</button>
            <button className="urban-cart-view-btn" onClick={() => { setCartOpen(false); state.navigate('cart'); }}>View Full Bag</button>
          </div>
        )}
      </div>

      {isPreview && (
        <button
          onClick={() => setPreviewOpen(!previewOpen)}
          style={{
            position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 5000,
            background: 'var(--sw-primary)', color: '#fff', border: 'none',
            padding: '0.75rem 1.25rem', fontFamily: 'var(--sw-accent-font)',
            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,45,85,0.4)'
          }}
        >
          {previewOpen ? '✕ Close' : '⚙ Template Info'}
        </button>
      )}

      <main>
        {(() => {
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
        })()}
      </main>

      <footer className="urban-footer">
        <div className="urban-footer-grid">
          <div className="urban-footer-brand">
            <h3>URBAN<span>HYPE</span></h3>
            <p>Premium streetwear culture since 2020. Limited drops, bold designs, and urban essentials curated for those who define the culture.</p>
            <div className="urban-footer-social">
              {['📸', '🐦', '📘', '🎵', '▶️'].map((icon, i) => (
                <button key={i} onClick={() => alert(`Follow us on ${['Instagram', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube'][i]}!`)}>{icon}</button>
              ))}
            </div>
          </div>
          {config.footerColumns.map((col, i) => (
            <div key={i} className="urban-footer-col">
              <h4>{col.title}</h4>
              {col.links.map((link, j) => (
                <button key={j} onClick={() => handleNavClick(link.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'))}>{link}</button>
              ))}
            </div>
          ))}
        </div>
        <div className="urban-footer-bottom">
          <p>© 2026 UrbanHype. All rights reserved. Built for the culture.</p>
          <div className="urban-footer-bottom-links">
            <button onClick={() => handleNavClick('privacy')}>Privacy</button>
            <button onClick={() => handleNavClick('terms')}>Terms</button>
            <button onClick={() => handleNavClick('faq')}>FAQs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
