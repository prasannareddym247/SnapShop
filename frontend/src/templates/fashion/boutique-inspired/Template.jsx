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

const BEAUTY_PRODUCTS = [
  { id: 'mb1', name: 'Radiant Complexion Serum', brand: 'Lumière', price: 85, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.8, reviews: 234, isNew: true, isLimited: false },
  { id: 'mb2', name: 'Velvet Matte Lip Colour', brand: 'Maison Rouge', price: 42, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.6, reviews: 186, isNew: false, isLimited: true },
  { id: 'mb3', name: 'Nourishing Crème Luxe', brand: 'Éclat', price: 120, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.9, reviews: 312, isNew: true, isLimited: false },
  { id: 'mb4', name: 'Eau de Parfum Classique', brand: 'Parfumerie Noire', price: 165, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=400&auto=format&fit=crop&q=80', category: 'Fragrance', rating: 4.7, reviews: 147, isNew: false, isLimited: true },
  { id: 'mb5', name: 'Silk Repair Hair Elixir', brand: 'Tresse Luxe', price: 68, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80', category: 'Hair Care', rating: 4.4, reviews: 89, isNew: true, isLimited: false },
  { id: 'mb6', name: 'Golden Glow Face Palette', brand: 'Lumière', price: 78, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.5, reviews: 65, isNew: true, isLimited: true },
  { id: 'mb7', name: 'Crème Corporelle Essentielle', brand: 'Éclat', price: 95, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Body Care', rating: 4.5, reviews: 134, isNew: false, isLimited: false },
  { id: 'mb8', name: 'Volumizing Lash Mascara', brand: 'Maison Rouge', price: 36, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1583241800690-5f38f44d3a95?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.3, reviews: 178, isNew: true, isLimited: false },
  { id: 'mb9', name: 'Sérum à la Rose', brand: 'Fleur d\'Or', price: 110, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.7, reviews: 203, isNew: false, isLimited: true },
  { id: 'mb10', name: 'Candle Parfumée', brand: 'Maison de Beaute', price: 58, image: 'https://images.unsplash.com/photo-1602874801007-bd36a3e1e56e?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Home Fragrance', rating: 4.6, reviews: 98, isNew: true, isLimited: false },
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const isPreview = window.location.hash.includes('template-preview');

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
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="mb-body">
      {announcementVisible && (
        <div className="mb-announcement">
          Complimentary Shipping on Orders Over $100 · New Collection Arriving — <a href="#" onClick={(e) => { e.preventDefault(); state.navigate('category'); }}>Discover Now</a>
          <button onClick={() => setAnnouncementVisible(false)} style={{ background: 'none', border: 'none', color: '#999', marginLeft: '0.75rem', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
      )}

      <header className="mb-header">
        <div className="mb-logo" onClick={() => handleNavClick('home')}>
          Maison de Beaute
          <span>Luxury Beauty</span>
        </div>
        <nav className="mb-nav">
          <button onClick={() => handleNavClick('category')}>New Arrivals</button>
          <button onClick={() => handleNavClick('category')}>Makeup</button>
          <button onClick={() => handleNavClick('category')}>Skincare</button>
          <button onClick={() => handleNavClick('category')}>Fragrance</button>
          <button onClick={() => handleNavClick('category')}>Hair Care</button>
          <button onClick={() => handleNavClick('category')}>Collections</button>
          <button onClick={() => handleNavClick('category')}>Gift Sets</button>
          <button className="mb-offer-link" onClick={() => handleNavClick('category')}>Offers</button>
        </nav>
        <div className="mb-actions">
          <button onClick={() => handleNavClick('search')} title="Search">⌕</button>
          <button onClick={() => handleNavClick('wishlist')} title="Wishlist">♡</button>
          <button onClick={() => handleNavClick('account')} title="Account">◯</button>
          <button onClick={() => setCartOpen(true)} title="Cart">
            🛒
            {(state.cart?.length || 0) > 0 && <span className="mb-cart-count">{state.cart.length}</span>}
          </button>
          <button className="mb-mobile-toggle" onClick={() => setMobileNavOpen(true)}>☰</button>
        </div>
      </header>

      <div className={`mb-mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
        <button className="mb-mobile-close" onClick={() => setMobileNavOpen(false)}>✕</button>
        <button onClick={() => handleNavClick('home')}>Home</button>
        <button onClick={() => handleNavClick('category')}>New Arrivals</button>
        <button onClick={() => handleNavClick('category')}>Makeup</button>
        <button onClick={() => handleNavClick('category')}>Skincare</button>
        <button onClick={() => handleNavClick('category')}>Fragrance</button>
        <button onClick={() => handleNavClick('category')}>Hair Care</button>
        <button onClick={() => handleNavClick('category')}>Collections</button>
        <button onClick={() => handleNavClick('category')}>Gift Sets</button>
        <button onClick={() => handleNavClick('category')} style={{ color: '#c9a96e' }}>Offers</button>
      </div>

      {/* Preview Panel */}
      {isPreview && (
        <>
          <div className={`mb-preview-overlay ${previewOpen ? 'open' : ''}`} onClick={() => setPreviewOpen(false)} />
          <div className={`mb-preview-panel ${previewOpen ? 'open' : ''}`}>
            <h2>Maison de Beaute</h2>
            <div>
              <span className="mb-preview-tag">Luxury</span>
              <span className="mb-preview-tag">Beauty</span>
              <span className="mb-preview-tag">Cosmetics</span>
              <span className="mb-preview-tag">Premium</span>
              <span className="mb-preview-tag">Responsive</span>
            </div>
            <div className="mb-preview-divider" />
            <div className="mb-preview-meta"><strong>Template Name:</strong> Maison de Beaute</div>
            <div className="mb-preview-meta"><strong>Category:</strong> Luxury Beauty & Cosmetics</div>
            <div className="mb-preview-meta"><strong>Style:</strong> Luxury · Elegant · Modern</div>
            <div className="mb-preview-meta"><strong>Best For:</strong> Premium Cosmetics, Luxury Skincare, Fragrances, Spa Products, Hair Care, Beauty Boutiques</div>
            <div className="mb-preview-meta"><strong>Responsive:</strong> Desktop · Tablet · Mobile</div>
            <div className="mb-preview-divider" />
            <div className="mb-preview-actions">
              <button className="mb-preview-btn mb-preview-btn-primary">Live Preview</button>
              <button className="mb-preview-btn mb-preview-btn-secondary">Use This Template</button>
            </div>
            <div className="mb-preview-divider" />
            <div className="mb-preview-checklist">
              <h3>Sellers Can Customize</h3>
              {['Logo', 'Brand Colors', 'Typography', 'Homepage Banners', 'Homepage Section Order', 'Promotional Banners', 'Featured Collections', 'Category Images', 'Footer Content', 'Social Media Links', 'Store Announcements'].map(item => (
                <div key={item} className="mb-preview-checklist-item"><span className="check">✓</span> {item}</div>
              ))}
            </div>
            <div className="mb-preview-divider" />
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {['Luxury', 'Beauty', 'Cosmetics', 'Premium', 'Responsive', 'Fully Customizable'].map(tag => (
                <span key={tag} className="mb-badge mb-badge-new" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>{tag}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Slideout Cart */}
      <div className={`mb-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`mb-slideout-cart ${cartOpen ? 'open' : ''}`}>
        <div className="mb-cart-header">
          <h2>Your Bag ({state.cart?.length || 0})</h2>
          <button className="mb-cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="mb-cart-items">
          {(state.cart || []).length === 0 ? (
            <div className="mb-cart-empty">
              <div className="empty-icon">🛍️</div>
              <p>Your bag awaits</p>
              <button className="mb-btn-primary" style={{ fontSize: '0.72rem', padding: '0.7rem 1.5rem' }} onClick={() => { setCartOpen(false); }}>Continue Shopping</button>
            </div>
          ) : (
            state.cart.map((item, i) => {
              const prod = BEAUTY_PRODUCTS.find(p => p.id === item.id) || item;
              return (
                <div key={i} className="mb-cart-item">
                  <img src={prod.image || item.image} alt={prod.name || item.name} />
                  <div className="mb-cart-item-details">
                    <h4>{prod.name || item.name}</h4>
                    <span className="price">${((prod.price || item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                    <div className="mb-cart-qty">
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, Math.max(0, (item.qty || 1) - 1)); }}>−</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => { if (state.updateCartItem) state.updateCartItem(item.id, (item.qty || 1) + 1); }}>+</button>
                    </div>
                  </div>
                  <button className="mb-cart-item-remove" onClick={() => { if (state.removeFromCart) state.removeFromCart(item.id); }}>✕</button>
                </div>
              );
            })
          )}
        </div>
        {(state.cart || []).length > 0 && (
          <div className="mb-cart-footer">
            <div className="mb-cart-promo">
              <input type="text" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button onClick={() => { if (promoCode.trim()) alert(`Code "${promoCode}" applied!`); }}>Apply</button>
            </div>
            <div className="mb-cart-totals">
              <div className="mb-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="mb-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="mb-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
            </div>
            <button className="mb-cart-checkout-btn" onClick={() => { setCartOpen(false); state.navigate('checkout'); }}>Secure Checkout →</button>
            <button className="mb-cart-view-btn" onClick={() => { setCartOpen(false); state.navigate('cart'); }}>View Full Bag</button>
          </div>
        )}
      </div>

      {isPreview && (
        <button onClick={() => setPreviewOpen(!previewOpen)} style={{
          position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 5000,
          background: 'var(--mb-primary)', color: '#fff', border: 'none',
          padding: '0.75rem 1.35rem', fontFamily: 'var(--mb-font-heading)',
          fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
          letterSpacing: '1px', textTransform: 'uppercase',
          borderRadius: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
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

      <footer className="mb-footer">
        <div className="mb-footer-grid">
          <div className="mb-footer-brand">
            <h3>Maison de <span>Beaute</span></h3>
            <div className="mb-tagline">Luxury Beauty</div>
            <p>Timeless elegance reimagined. Curating the finest in luxury beauty, skincare, and fragrance for the discerning connoisseur.</p>
            <div className="mb-footer-social">
              {['📸', '📌', '📘', '🎵'].map((icon, i) => (
                <button key={i} onClick={() => alert(`Follow us on ${['Instagram', 'Pinterest', 'Facebook', 'TikTok'][i]}!`)}>{icon}</button>
              ))}
            </div>
          </div>
          {config.footerColumns.map((col, i) => (
            <div key={i} className="mb-footer-col">
              <h4>{col.title}</h4>
              {col.links.map((link, j) => (
                <button key={j} onClick={() => handleNavClick(link.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'))}>{link}</button>
              ))}
            </div>
          ))}
        </div>
        <div className="mb-footer-bottom">
          <p>© 2026 Maison de Beaute. All rights reserved.</p>
          <div className="mb-footer-links">
            <button onClick={() => handleNavClick('privacy')}>Privacy</button>
            <button onClick={() => handleNavClick('terms')}>Terms</button>
            <button onClick={() => handleNavClick('faq')}>FAQs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
