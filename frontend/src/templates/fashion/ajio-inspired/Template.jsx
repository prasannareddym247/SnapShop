import React, { useState, useRef, useEffect } from 'react';
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

export default function Template({ activeTheme }) {
  const state = useTemplateState();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view) => {
    setShowAccountDropdown(false);
    if (view === 'home' || view === 'Home') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter(null);
      state.navigate('home');
    }
    else if (view === 'category' || view === 'Category') {
      state.setSearchQuery('');
      state.setSelectedCategory('All');
      state.setGenderFilter(null);
      state.navigate('category');
    }
    else if (view === 'cart' || view === 'Cart') state.navigate('cart');
    else if (view === 'wishlist' || view === 'Wishlist') state.navigate('wishlist');
    else if (view === 'account' || view === 'Account') state.navigate('account');
    else if (view === 'about' || view === 'About Us') state.navigate('about');
    else if (view === 'contact' || view === 'Contact Us') state.navigate('contact');
    else if (view === 'faq' || view === 'FAQ') state.navigate('faq');
    else if (view === 'privacy' || view === 'Privacy') state.navigate('privacy');
    else if (view === 'terms' || view === 'Terms') state.navigate('terms');
    else if (view === 'search' || view === 'Search') state.navigate('search');
    else state.navigate('home');
  };

  const handleMenuClick = (gender) => {
    state.setSelectedCategory('All');
    state.setSearchQuery('');
    state.setGenderFilter(gender);
    state.navigate('category');
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

  const handleAddToCart = (product) => {
    state.addToCart(product, null, 1);
  };

  return (
    <div className="ajio-clone-body" style={{ fontFamily: 'Source Sans Pro, sans-serif', background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Navigation Container */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        {/* Topbar */}
        <div className="ajio-topbar" style={{ background: '#2c3e50', color: '#fff', fontSize: '11px', padding: '6px 2rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #34495e' }}>
          <span>{state.store?.storeName || 'Fashion Store'} Business | Join Us</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => handleNavClick('account')}>My Account</span>
            <span style={{ cursor: 'pointer' }} onClick={() => handleNavClick('contact')}>Customer Care</span>
          </div>
        </div>

        {/* Main Header */}
        <header className="ajio-header" style={{ background: '#ffffff', height: '76px', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e9e9e9', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '2px', fontFamily: 'serif', color: '#0f172a', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => handleNavClick('home')}>
            {state.store?.storeName || 'Fashion Store'}
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem', fontWeight: '700', fontSize: '13px', color: '#333' }}>
            <span style={{ cursor: 'pointer', padding: '0.5rem 0' }} onClick={() => handleMenuClick("men")}>MEN</span>
            <span style={{ cursor: 'pointer', padding: '0.5rem 0' }} onClick={() => handleMenuClick("women")}>WOMEN</span>
            <span style={{ cursor: 'pointer', padding: '0.5rem 0' }} onClick={() => { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('category'); }}>ALL COLLECTIONS</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Search bar */}
          <form onSubmit={e => { e.preventDefault(); handleNavClick('search'); }} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={`Search ${state.store?.storeName || 'Fashion Store'}...`} 
              value={state.searchQuery}
              onChange={e => state.setSearchQuery(e.target.value)}
              style={{ width: '240px', padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid #ccc', background: '#f5f5f5', fontSize: '12px', outline: 'none' }} 
            />
          </form>

          {/* Auth Section */}
          {state.auth.token && state.auth.user && state.auth.user.role === 'Customer' ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                style={{ background: '#2c3e50', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                👤 {state.auth.user.firstName || 'Account'}
              </button>
              {showAccountDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #e9e9e9', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '180px', zIndex: 1100, marginTop: '6px' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #e9e9e9', fontSize: '12px', color: '#888' }}>
                    Signed in as <strong>{state.auth.user.email}</strong>
                  </div>
                  <div style={{ padding: '6px 0' }}>
                    {['My Profile', 'Order History', 'Address Book', 'Change Password'].map(item => (
                      <div key={item} style={{ padding: '8px 14px', fontSize: '13px', cursor: 'pointer', color: '#333', transition: 'background 0.15s' }}
                        onClick={() => { setShowAccountDropdown(false); state.navigate('account'); }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #e9e9e9', padding: '8px 14px' }}>
                    <button
                      onClick={() => { setShowAccountDropdown(false); state.auth.logout(); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleNavClick('account')}
                style={{ background: 'none', border: '1px solid #2c3e50', color: '#2c3e50', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '5px 12px', borderRadius: '2px' }}
              >
                SIGN IN
              </button>
              <button
                onClick={() => { state.setSearchQuery(''); state.setSelectedCategory('All'); state.setGenderFilter(null); state.navigate('account'); }}
                style={{ background: '#2c3e50', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '5px 12px', borderRadius: '2px' }}
              >
                REGISTER
              </button>
            </div>
          )}

          {/* Wishlist */}
          <button onClick={() => handleNavClick('wishlist')} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', position: 'relative' }}>
            ❤️
            {state.wishlist.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff3f6c', color: '#fff', fontSize: '10px', borderRadius: '50%', padding: '2px 5px', fontWeight: 'bold' }}>
                {state.wishlist.length}
              </span>
            )}
          </button>
          {/* Bag */}
          <button onClick={() => handleNavClick('cart')} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', position: 'relative' }}>
            👜
            {state.cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff3f6c', color: '#fff', fontSize: '10px', borderRadius: '50%', padding: '2px 5px', fontWeight: 'bold' }}>
                {state.cartCount}
              </span>
            )}
          </button>
        </div>
      </header>
      </div>

      {/* Pages Container */}
      <main style={{ flex: 1, minHeight: '500px' }}>
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="ajio-footer" style={{ background: '#2c3e50', color: '#ffffff', padding: '3.5rem 2rem 2rem', fontSize: '12px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          <div>
            <h4 style={{ color: '#fff', borderBottom: '1px solid #34495e', paddingBottom: '8px', marginBottom: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{state.store?.storeName || 'Fashion Store'}</h4>
            <p style={{ color: '#bdc3c7', lineHeight: '1.6' }}>India's ultimate online fashion destination. Handpicked styles, premium brands, and drops culture straight to your wardrobe.</p>
          </div>
          <div>
            <h4 style={{ color: '#fff', borderBottom: '1px solid #34495e', paddingBottom: '8px', marginBottom: '12px', fontWeight: 'bold' }}>Help</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('contact')}>Track Order</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('faq')}>Frequently Asked Questions</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('contact')}>Returns & Refunds</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('contact')}>Payments & Security</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', borderBottom: '1px solid #34495e', paddingBottom: '8px', marginBottom: '12px', fontWeight: 'bold' }}>Shop</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('category')}>Men's Collections</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('category')}>Women's Dresses</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('category')}>Kids Fashion</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('category')}>Brand Catalog</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', borderBottom: '1px solid #34495e', paddingBottom: '8px', marginBottom: '12px', fontWeight: 'bold' }}>Policies</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('privacy')}>Privacy Policy</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('terms')}>Terms & Conditions</li>
              <li style={{ cursor: 'pointer', color: '#bdc3c7' }} onClick={() => handleNavClick('about')}>Who We Are</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #34495e', marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center', color: '#7f8c8d' }}>
          &copy; {new Date().getFullYear()} {state.store?.storeName || 'Fashion Store'}. All rights reserved. Powered by SnapShop.
        </div>
      </footer>
    </div>
  );
}
