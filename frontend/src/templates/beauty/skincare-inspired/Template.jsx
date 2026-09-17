import React, { useState, useEffect } from 'react';
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

const SKIN_PRODUCTS = [
  { id: 'ps1', name: 'Gentle Foaming Cleanser', brand: 'PureGlow', price: 28, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Cleansers', rating: 4.6, reviews: 312, isNew: true, isOrganic: false },
  { id: 'ps2', name: 'Vitamin C Bright Serum', brand: 'GlowLab', price: 48, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.8, reviews: 267, isNew: true, isOrganic: false },
  { id: 'ps3', name: 'Dewy Moisture Cream', brand: 'DewDrops', price: 42, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Moisturizers', rating: 4.5, reviews: 198, isNew: false, isOrganic: true },
  { id: 'ps4', name: 'Mineral Sunscreen SPF 50', brand: 'SunGuard', price: 32, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Sun Care', rating: 4.4, reviews: 156, isNew: false, isOrganic: false },
  { id: 'ps5', name: 'Hydra Sheet Mask Set', brand: 'PureGlow', price: 22, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Face Masks', rating: 4.3, reviews: 89, isNew: true, isOrganic: true },
  { id: 'ps6', name: 'Nourish Eye Cream', brand: 'GlowLab', price: 36, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Eye Care', rating: 4.6, reviews: 134, isNew: false, isOrganic: false },
  { id: 'ps7', name: 'Soothing Toner Mist', brand: 'DewDrops', price: 26, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Toners', rating: 4.4, reviews: 178, isNew: true, isOrganic: true },
  { id: 'ps8', name: 'Retinol Night Serum', brand: 'GlowLab', price: 58, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.7, reviews: 203, isNew: false, isOrganic: false },
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [searchInput, setSearchInput] = useState('');
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
    if (view === 'home') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.navigate('home'); return; }
    if (view === 'category') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.navigate('category'); return; }
    if (view === 'cart') { setCartOpen(true); return; }
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

  const subtotal = (state.cart || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 60 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="pure-template">
      {announcementVisible && (
        <div className="pure-announcement">
          FREE SHIPPING ON ORDERS OVER $60 · NEW COLLECTION JUST LAUNCHED — <a href="#" onClick={(e) => { e.preventDefault(); state.navigate('category'); }}>SHOP NOW</a>
          <button onClick={() => setAnnouncementVisible(false)} style={{ background: 'none', border: 'none', color: '#fff', marginLeft: '0.75rem', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6 }}>✕</button>
        </div>
      )}

      <header className="pure-header">
        <div className="pure-logo" onClick={() => handleNavClick('home')}>
          pure <span>skinglow</span>
        </div>
        <nav className="pure-nav">
          <button onClick={() => handleNavClick('category')}>New Arrivals</button>
          <button onClick={() => handleNavClick('category')}>Cleansers</button>
          <button onClick={() => handleNavClick('category')}>Serums</button>
          <button onClick={() => handleNavClick('category')}>Moisturizers</button>
          <button onClick={() => handleNavClick('category')}>Sunscreen</button>
          <button onClick={() => handleNavClick('category')}>Face Masks</button>
          <button onClick={() => handleNavClick('category')}>Wellness</button>
          <button className="pure-offer-link" onClick={() => handleNavClick('category')}>Offers</button>
        </nav>
        <div className="pure-actions">
          <button className="pure-search-btn" onClick={() => handleNavClick('search')} title="Search">⌕</button>
          <button onClick={() => handleNavClick('wishlist')} title="Wishlist">♡</button>
          <button onClick={() => handleNavClick('account')} title="Account">◯</button>
          <button onClick={() => setCartOpen(true)} title="Cart">
            🛒
            {(state.cart?.length || 0) > 0 && <span className="pure-cart-count">{state.cart.length}</span>}
          </button>
          <button className="pure-mobile-toggle" onClick={() => setMobileNavOpen(true)}>☰</button>
        </div>
      </header>

      <div className={`pure-mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
        <button className="pure-mobile-close" onClick={() => setMobileNavOpen(false)}>✕</button>
        <button onClick={() => handleNavClick('home')}>Home</button>
        <button onClick={() => handleNavClick('category')}>New Arrivals</button>
        <button onClick={() => handleNavClick('category')}>Cleansers</button>
        <button onClick={() => handleNavClick('category')}>Serums</button>
        <button onClick={() => handleNavClick('category')}>Moisturizers</button>
        <button onClick={() => handleNavClick('category')}>Sunscreen</button>
        <button onClick={() => handleNavClick('category')}>Face Masks</button>
        <button onClick={() => handleNavClick('category')}>Wellness</button>
        <button onClick={() => handleNavClick('category')} style={{ color: '#c97070' }}>Offers</button>
      </div>

      {/* Preview Panel */}
      {isPreview && (
        <>
          <div className={`pure-preview-overlay ${previewOpen ? 'open' : ''}`} onClick={() => setPreviewOpen(false)} />
          <div className={`pure-preview-panel ${previewOpen ? 'open' : ''}`}>
            <h2>Pure SkinGlow</h2>
            <div>
              <span className="pure-preview-tag">Skincare</span>
              <span className="pure-preview-tag">Organic</span>
              <span className="pure-preview-tag">Wellness</span>
              <span className="pure-preview-tag">Responsive</span>
              <span className="pure-preview-tag">Premium</span>
            </div>
            <div className="pure-preview-divider" />
            <div className="pure-preview-meta"><strong>Template Name:</strong> Pure SkinGlow</div>
            <div className="pure-preview-meta"><strong>Category:</strong> Skincare & Wellness</div>
            <div className="pure-preview-meta"><strong>Style:</strong> Clean · Natural · Minimal</div>
            <div className="pure-preview-meta"><strong>Best For:</strong> Skincare, Organic Beauty, Wellness, Self-Care, Dermatology Products, Natural Cosmetics</div>
            <div className="pure-preview-meta"><strong>Responsive:</strong> Desktop · Tablet · Mobile</div>
            <div className="pure-preview-divider" />
            <div className="pure-preview-actions">
              <button className="pure-preview-btn pure-preview-btn-primary">Live Preview</button>
              <button className="pure-preview-btn pure-preview-btn-secondary">Use This Template</button>
              <button className="pure-preview-btn pure-preview-btn-secondary">Design Style</button>
            </div>
            <div className="pure-preview-divider" />
            <div className="pure-preview-checklist">
              <h3>Sellers Can Customize</h3>
              {['Logo', 'Brand Colors', 'Typography', 'Homepage Banners', 'Homepage Section Order', 'Promotional Banners', 'Featured Collections', 'Category Images', 'Footer Content', 'Social Media Links', 'Store Announcements'].map(item => (
                <div key={item} className="pure-preview-checklist-item"><span className="check">✓</span> {item}</div>
              ))}
            </div>
            <div className="pure-preview-divider" />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Fully Customizable', 'Clean Design', 'Natural Aesthetic', 'Mobile First'].map(tag => (
                <span key={tag} className="pure-badge" style={{ background: 'var(--pure-accent)', color: 'var(--pure-text)', border: 'none', fontSize: '0.62rem' }}>{tag}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Slideout Cart */}
      <div className={`pure-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`pure-slideout-cart ${cartOpen ? 'open' : ''}`}>
        <div className="pure-cart-header">
          <h2>Your Bag ({state.cart?.length || 0})</h2>
          <button className="pure-cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="pure-cart-items">
          {(state.cart || []).length === 0 ? (
            <div className="pure-cart-empty">
              <div className="empty-icon">🛍️</div>
              <p>Your bag is empty</p>
              <button className="pure-btn-primary" style={{ marginTop: '1rem', fontSize: '0.78rem', padding: '0.7rem 1.5rem' }} onClick={() => { setCartOpen(false); }}>Shop Now</button>
            </div>
          ) : (
            state.cart.map((item, i) => {
              const prod = SKIN_PRODUCTS.find(p => p.id === item.id) || item;
              return (
                <div key={i} className="pure-cart-item">
                  <img src={prod.image || item.image} alt={prod.name || item.name} />
                  <div className="pure-cart-item-details">
                    <h4>{prod.name || item.name}</h4>
                    <span className="price">${((prod.price || item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                    <div className="pure-cart-qty">
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1)); }}>−</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, (item.qty || 1) + 1); }}>+</button>
                    </div>
                  </div>
                  <button className="pure-cart-item-remove" onClick={() => { if (state.removeFromCart) state.removeFromCart(item.id); }}>✕</button>
                </div>
              );
            })
          )}
        </div>
        {(state.cart || []).length > 0 && (
          <div className="pure-cart-footer">
            <div className="pure-cart-promo">
              <input type="text" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button onClick={() => { if (promoCode.trim()) alert(`Code "${promoCode}" applied!`); }}>Apply</button>
            </div>
            <div className="pure-cart-totals">
              <div className="pure-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="pure-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="pure-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
            </div>
            <button className="pure-cart-checkout-btn" onClick={() => { setCartOpen(false); state.navigate('checkout'); }}>Checkout →</button>
            <button className="pure-cart-view-btn" onClick={() => { setCartOpen(false); state.navigate('cart'); }}>View Full Bag</button>
          </div>
        )}
      </div>

      {isPreview && (
        <button onClick={() => setPreviewOpen(!previewOpen)} style={{
          position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 5000,
          background: 'var(--pure-primary)', color: '#fff', border: 'none',
          padding: '0.7rem 1.25rem', fontFamily: 'var(--pure-heading)',
          fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
          borderRadius: '8px', boxShadow: '0 4px 20px rgba(126,184,160,0.3)'
        }}>
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

      <footer className="pure-footer">
        <div className="pure-footer-grid">
          <div className="pure-footer-brand">
            <h3>pure <span>skinglow</span></h3>
            <p>Clean, natural skincare crafted with pure ingredients. Dermatologist-inspired formulations for radiant, healthy skin.</p>
            <div className="pure-footer-social">
              {['📸', '🐦', '📘', '▶️', '💡'].map((icon, i) => (
                <button key={i} onClick={() => alert(`Follow us on ${['Instagram', 'Twitter/X', 'Facebook', 'YouTube', 'TikTok'][i]}!`)}>{icon}</button>
              ))}
            </div>
          </div>
          {config.footerColumns.map((col, i) => (
            <div key={i} className="pure-footer-col">
              <h4>{col.title}</h4>
              {col.links.map((link, j) => (
                <button key={j} onClick={() => handleNavClick(link.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'))}>{link}</button>
              ))}
            </div>
          ))}
        </div>
        <div className="pure-footer-bottom">
          <p>© 2026 Pure SkinGlow. Clean beauty for every skin.</p>
          <div className="pure-footer-links">
            <button onClick={() => handleNavClick('privacy')}>Privacy</button>
            <button onClick={() => handleNavClick('terms')}>Terms</button>
            <button onClick={() => handleNavClick('faq')}>FAQs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
