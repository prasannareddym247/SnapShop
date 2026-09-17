import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Menu, X, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import './marketing.css';

const MarketingLayout = ({ children, currentView, setView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (targetView) => {
    setView(targetView);
    window.location.hash = targetView === 'home' ? '' : targetView;
    setMobileMenuOpen(false);
  };

  const handleStartTrial = () => {
    sessionStorage.setItem('start_seller_onboarding', 'true');
    setView('auth');
    window.location.hash = 'auth';
  };

  const links = [
    { label: 'Home', view: 'home' },
    { label: 'Features', view: 'features' },
    { label: 'Templates', view: 'templates' },
    { label: 'Pricing', view: 'pricing' },
  ];

  const dropdownItems = [
    { label: 'About Us', view: 'about' },
    { label: 'Contact Us', view: 'contact' },
    { label: 'FAQ', view: 'faq' },
    { label: 'Privacy Policy', view: 'privacy' },
    { label: 'Terms of Service', view: 'terms' },
  ];

  return (
    <div className="marketing-root">
      <header className={`marketing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="marketing-container marketing-nav-content">
          <div className="marketing-logo" onClick={() => handleNav('home')}>
            <Store size={28} />
            <span>SnapShop</span>
          </div>

          <nav>
            <ul className="marketing-nav-links">
              {links.map(link => (
                <li key={link.view}>
                  <span
                    className={`marketing-nav-link ${currentView === link.view ? 'active' : ''}`}
                    onClick={() => handleNav(link.view)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleNav(link.view)}
                  >
                    {link.label}
                  </span>
                </li>
              ))}
              <li className="marketing-dropdown">
                <span className="marketing-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Resources <ChevronDown size={14} />
                </span>
                <div className="marketing-dropdown-menu">
                  {dropdownItems.map(item => (
                    <span
                      key={item.view}
                      className="marketing-dropdown-item"
                      onClick={() => handleNav(item.view)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleNav(item.view)}
                    >
                      <ChevronRight size={14} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </li>
            </ul>
          </nav>

          <div className="marketing-nav-buttons">
            <motion.span
              className="marketing-nav-link"
              onClick={() => handleNav('auth')}
              style={{ cursor: 'pointer' }}
              whileHover={{ opacity: 0.7 }}
            >
              Login
            </motion.span>
            <motion.button
              className="m-btn m-btn-primary navbar-cta-btn"
              onClick={handleStartTrial}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Free Trial
            </motion.button>
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
              {links.map(link => (
                <span
                  key={link.view}
                  className="mobile-menu-link"
                  onClick={() => handleNav(link.view)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleNav(link.view)}
                >
                  {link.label}
                </span>
              ))}
              <div className="mobile-menu-divider" />
              {dropdownItems.map(item => (
                <span
                  key={item.view}
                  className="mobile-menu-link"
                  onClick={() => handleNav(item.view)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleNav(item.view)}
                  style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}
                >
                  {item.label}
                </span>
              ))}
              <div className="mobile-menu-divider" />
              <motion.button
                className="m-btn m-btn-primary"
                onClick={handleStartTrial}
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial <ArrowRight size={16} />
              </motion.button>
              <motion.button
                className="m-btn m-btn-ghost"
                onClick={() => handleNav('auth')}
                style={{ width: '100%', justifyContent: 'center' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main style={{ flex: 1 }}>{children}</main>

      <footer className="marketing-footer">
        <div className="marketing-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3><Store size={24} /> SnapShop</h3>
              <p>The premium, all-in-one store builder platform that empowers entrepreneurs to create, run, and scale online stores with ease. Start your free trial today.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul className="footer-links">
                <li><span className="footer-link" onClick={() => handleNav('features')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('features')}>Features</span></li>
                <li><span className="footer-link" onClick={() => handleNav('templates')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('templates')}>Templates</span></li>
                <li><span className="footer-link" onClick={() => handleNav('pricing')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('pricing')}>Pricing</span></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><span className="footer-link" onClick={() => handleNav('about')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('about')}>About Us</span></li>
                <li><span className="footer-link" onClick={() => handleNav('contact')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('contact')}>Contact Us</span></li>
                <li><span className="footer-link" onClick={() => handleNav('faq')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('faq')}>FAQ Support</span></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><span className="footer-link" onClick={() => handleNav('privacy')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('privacy')}>Privacy Policy</span></li>
                <li><span className="footer-link" onClick={() => handleNav('terms')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleNav('terms')}>Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} SnapShop Platform. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
