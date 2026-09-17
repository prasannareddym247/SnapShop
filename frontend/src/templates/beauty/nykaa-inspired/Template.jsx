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

const BEAUTY_PRODUCTS = [
  { id: 'gn1', name: 'Radiance Serum', brand: 'LuminaGlow', price: 52, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Skincare', colors: [], rating: 4.7, reviews: 234, isNew: true },
  { id: 'gn2', name: 'Velvet Matte Lipstick', brand: 'Posh Lips', price: 28, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', category: 'Makeup', colors: ['#e0557a', '#c94a6c', '#9c2744', '#6b1d30'], rating: 4.5, reviews: 186, isNew: false },
  { id: 'gn3', name: 'Hydra Glow Moisturizer', brand: 'DewySkin', price: 45, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Skincare', colors: [], rating: 4.6, reviews: 312, isNew: true },
  { id: 'gn4', name: 'Rose Petal Perfume', brand: 'Floral Essence', price: 78, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=400&auto=format&fit=crop&q=80', category: 'Fragrance', colors: [], rating: 4.8, reviews: 147, isNew: false, isSale: true },
  { id: 'gn5', name: 'Silk Shine Hair Oil', brand: 'TresseLuxe', price: 36, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80', category: 'Hair Care', colors: [], rating: 4.4, reviews: 89, isNew: true },
  { id: 'gn6', name: 'Bronze Glow Palette', brand: 'LuminaGlow', price: 42, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80', category: 'Makeup', colors: ['#d4a0b0', '#c97b5a', '#8b6b5a'], rating: 4.3, reviews: 65, isNew: false },
  { id: 'gn7', name: 'Calm & Cleanse Face Wash', brand: 'PureGlow', price: 24, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Skincare', colors: [], rating: 4.2, reviews: 203, isNew: false, isSale: true },
  { id: 'gn8', name: 'Volumizing Mascara', brand: 'LashDefine', price: 22, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1583241800690-5f38f44d3a95?w=400&auto=format&fit=crop&q=80', category: 'Makeup', colors: [], rating: 4.6, reviews: 178, isNew: true },
  { id: 'gn9', name: 'Body Butter Collection', brand: 'VelvetSkin', price: 34, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', category: 'Bath & Body', colors: [], rating: 4.5, reviews: 92, isNew: false },
  { id: 'gn10', name: 'CBD Wellness Oil', brand: 'ZenBalance', price: 58, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Wellness', colors: [], rating: 4.7, reviews: 56, isNew: true, isSale: true },
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const { token, user, logout } = state.auth || {};
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
    if (view === 'home') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('home'); return; }
    if (view === 'category') { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('category'); return; }
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

  const cartItems = (state.cart || []).slice(0, 3);
  const subtotal = (state.cart || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="glam-template">
      {announcementVisible && (
        <div className="glam-announcement">
          FREE SHIPPING ON ORDERS OVER $75 · USE CODE <a href="#" onClick={(e) => { e.preventDefault(); setPromoCode('GLOW20'); }}>GLOW20</a> FOR 20% OFF YOUR FIRST ORDER
          <button onClick={() => setAnnouncementVisible(false)} style={{ background: 'none', border: 'none', color: '#fff', marginLeft: '0.75rem', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}>✕</button>
        </div>
      )}

      <header className="glam-header">
        <div className="glam-header-top">
          <div className="glam-header-logo" onClick={() => handleNavClick('home')}>
            Glamour <span>Nykaa</span>
          </div>
          <div className="glam-header-search">
            <input
              type="text" placeholder="Search for products, brands, concerns..."
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { state.setSearchQuery && state.setSearchQuery(searchInput); state.navigate('search'); } }}
            />
            <button onClick={() => { state.setSearchQuery && state.setSearchQuery(searchInput); state.navigate('search'); }}>⌕</button>
          </div>
          <div className="glam-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => handleNavClick('search')} title="Search" className="glam-mobile-toggle">⌕</button>
            <button onClick={() => handleNavClick('wishlist')} title="Wishlist">♡</button>
            
            {token && user && user.role === 'Customer' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => handleNavClick('account')} title="My Account" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--glam-text)' }}>
                  👤 {user.firstName || 'My Account'}
                </button>
                <button onClick={() => { if (logout) logout(); }} title="Sign Out" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 500, color: '#e0557a' }}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => handleNavClick('account')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, color: 'var(--glam-text)' }}>
                Sign In / Register
              </button>
            )}

            <button className="glam-cart-btn" onClick={() => setCartOpen(true)} title="Cart">
              🛒
              {(state.cart?.length || 0) > 0 && <span className="glam-cart-count">{state.cart.length}</span>}
            </button>
            <button className="glam-mobile-toggle" onClick={() => setMobileNavOpen(true)}>☰</button>
          </div>
        </div>
        <nav className="glam-header-nav">
          <button onClick={() => { state.setSelectedCategory('All'); handleNavClick('category'); }}>All Products</button>
          {state.categories && state.categories.map(cat => (
            <button key={cat.id} onClick={() => { state.setSelectedCategory(cat.name); handleNavClick('category'); }}>
              {cat.name}
            </button>
          ))}
          <button className="glam-offers-link" onClick={() => handleNavClick('category')}>Offers</button>
        </nav>
      </header>

      <div className={`glam-mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
        <button className="glam-mobile-close" onClick={() => setMobileNavOpen(false)}>✕</button>
        <button onClick={() => handleNavClick('home')}>Home</button>
        <button onClick={() => { state.setSelectedCategory('All'); handleNavClick('category'); }}>All Products</button>
        {state.categories && state.categories.map(cat => (
          <button key={cat.id} onClick={() => { state.setSelectedCategory(cat.name); handleNavClick('category'); }}>
            {cat.name}
          </button>
        ))}
        <button onClick={() => handleNavClick('category')} style={{ color: '#e0557a' }}>Offers</button>
      </div>

      {/* Preview Panel */}
      {isPreview && (
        <>
          <div className={`glam-preview-overlay ${previewOpen ? 'open' : ''}`} onClick={() => setPreviewOpen(false)} />
          <div className={`glam-preview-panel ${previewOpen ? 'open' : ''}`}>
            <h2>Glamour Nykaa</h2>
            <div>
              <span className="glam-preview-tag">Beauty</span>
              <span className="glam-preview-tag">Cosmetics</span>
              <span className="glam-preview-tag">Wellness</span>
              <span className="glam-preview-tag">Responsive</span>
              <span className="glam-preview-tag">Premium</span>
            </div>
            <div className="glam-preview-divider" />
            <div className="glam-preview-meta"><strong>Template Name:</strong> Glamour Nykaa</div>
            <div className="glam-preview-meta"><strong>Category:</strong> Beauty & Personal Care</div>
            <div className="glam-preview-meta"><strong>Style:</strong> Modern · Elegant · Clean</div>
            <div className="glam-preview-meta"><strong>Best For:</strong> Cosmetics, Skincare, Haircare, Wellness, Fragrance, Personal Care</div>
            <div className="glam-preview-meta"><strong>Responsive:</strong> Desktop · Tablet · Mobile</div>
            <div className="glam-preview-divider" />
            <div className="glam-preview-actions">
              <button className="glam-preview-btn glam-preview-btn-primary">Live Preview</button>
              <button className="glam-preview-btn glam-preview-btn-secondary">Use This Template</button>
            </div>
            <div className="glam-preview-divider" />
            <div className="glam-preview-checklist">
              <h3>Sellers Can Customize</h3>
              {['Logo', 'Brand Colors', 'Typography', 'Homepage Banners', 'Promotional Banners', 'Homepage Section Order', 'Featured Brands', 'Featured Categories', 'Footer Content', 'Store Announcements', 'Social Media Links'].map(item => (
                <div key={item} className="glam-preview-checklist-item"><span className="check">✓</span> {item}</div>
              ))}
            </div>
            <div className="glam-preview-divider" />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Fully Customizable', 'Modern Design', 'Elegant Aesthetic', 'Mobile First'].map(tag => (
                <span key={tag} className="glam-badge" style={{ background: 'var(--glam-accent)', color: 'var(--glam-primary)', border: 'none', fontSize: '0.65rem' }}>{tag}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Slideout Cart */}
      <div className={`glam-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`glam-slideout-cart ${cartOpen ? 'open' : ''}`}>
        <div className="glam-cart-header">
          <h2>Shopping Bag ({state.cart?.length || 0})</h2>
          <button className="glam-cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="glam-cart-items">
          {(state.cart || []).length === 0 ? (
            <div className="glam-cart-empty">
              <div className="empty-icon">🛍️</div>
              <p>Your bag is empty</p>
              <button className="glam-btn-primary" style={{ marginTop: '1rem', fontSize: '0.78rem', padding: '0.7rem 1.5rem' }} onClick={() => { setCartOpen(false); }}>Shop Now</button>
            </div>
          ) : (
            state.cart.map((item, i) => {
              const prod = state.filteredProducts.find(p => String(p.id) === String(item.id)) || item;
              return (
                <div key={i} className="glam-cart-item">
                  <img src={prod.image || prod.imageUrl || item.image} alt={prod.name || item.name} />
                  <div className="glam-cart-item-details">
                    <h4>{prod.name || item.name}</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--glam-text-muted)' }}>{prod.brand || ''}</p>
                    <span className="price">₹{((prod.price || item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                    <div className="glam-cart-qty">
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1)); }}>−</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, (item.qty || 1) + 1); }}>+</button>
                    </div>
                  </div>
                  <button className="glam-cart-item-remove" onClick={() => { if (state.removeFromCart) state.removeFromCart(item.id); }}>✕</button>
                </div>
              );
            })
          )}
        </div>
        {(state.cart || []).length > 0 && (
          <div className="glam-cart-footer">
            <div className="glam-cart-promo">
              <input type="text" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button onClick={() => { if (promoCode.trim()) alert(`Code "${promoCode}" applied!`); }}>Apply</button>
            </div>
            <div className="glam-cart-totals">
              <div className="glam-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="glam-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="glam-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
            </div>
            <button className="glam-cart-checkout-btn" onClick={() => { setCartOpen(false); state.navigate('checkout'); }}>Checkout →</button>
            <button className="glam-cart-view-btn" onClick={() => { setCartOpen(false); state.navigate('cart'); }}>View Full Bag</button>
          </div>
        )}
      </div>

      {isPreview && (
        <button
          onClick={() => setPreviewOpen(!previewOpen)}
          style={{
            position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 5000,
            background: 'var(--glam-primary)', color: '#fff', border: 'none',
            padding: '0.7rem 1.25rem', fontFamily: 'var(--glam-accent-font)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            borderRadius: '6px', boxShadow: '0 4px 20px rgba(224,85,122,0.3)'
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

      <footer className="glam-footer">
        <div className="glam-footer-grid">
          <div className="glam-footer-brand">
            <h3>Glamour <span>Nykaa</span></h3>
            <p>Your premium beauty destination. Discover curated skincare, makeup, haircare, and wellness essentials from top global brands.</p>
            <div className="glam-footer-social">
              {['📸', '🐦', '📘', '▶️', '💬'].map((icon, i) => (
                <button key={i} onClick={() => alert(`Follow us on ${['Instagram', 'Twitter/X', 'Facebook', 'YouTube', 'WhatsApp'][i]}!`)}>{icon}</button>
              ))}
            </div>
          </div>
          {config.footerColumns.map((col, i) => (
            <div key={i} className="glam-footer-col">
              <h4>{col.title}</h4>
              {col.links.map((link, j) => (
                <button key={j} onClick={() => handleNavClick(link.toLowerCase().replace(/ & /g, '-').replace(/[^a-z0-9-]/g, ''))}>{link}</button>
              ))}
            </div>
          ))}
        </div>
        <div className="glam-footer-bottom">
          <p>© 2026 Glamour Nykaa. All rights reserved. Beauty redefined.</p>
          <div className="glam-footer-links">
            <button onClick={() => handleNavClick('privacy')}>Privacy</button>
            <button onClick={() => handleNavClick('terms')}>Terms</button>
            <button onClick={() => handleNavClick('faq')}>FAQs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
