import React from 'react';
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

const navItems = [
  { label: 'Home', key: 'home', icon: '🏠' },
  { label: 'Shop All', key: 'category', icon: '🛒' },
  { label: 'About Us', key: 'about', icon: 'ℹ️' },
  { label: 'Contact', key: 'contact', icon: '📞' }
];

export default function Template({ activeTheme }) {
  const state = useTemplateState();

  const handleNavClick = (view) => {
    if (view === 'home' || view === 'Home') state.navigate('home');
    else if (view === 'category' || view === 'Category') state.navigate('category');
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

  // Merge default template config with custom merchant colors/fonts/spacing overrides
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
    <TemplateWrapper
      config={mergedConfig}
      navItems={navItems}
      onNavClick={handleNavClick}
      cartCount={state.cartCount}
      onCartClick={() => state.navigate('cart')}
      searchQuery={state.searchQuery}
      onSearchChange={state.setSearchQuery}
      onSearch={(q) => { state.setSearchQuery(q); state.navigate('search'); }}
    >
      <div className="template-body-container">
        {renderPage()}
      </div>
    </TemplateWrapper>
  );
}
