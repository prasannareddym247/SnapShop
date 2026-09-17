import { useState, useEffect, useRef } from 'react';

const PROTECTED_VIEWS = ['admin', 'seller', 'generator', 'billing', 'orders', 'customer'];

const isProtectedView = (view) =>
  view === 'admin' || view.startsWith('admin/') ||
  view === 'seller' || view === 'seller/notifications' ||
  view === 'generator' || view === 'billing' ||
  view === 'orders' || view === 'customer' ||
  view.startsWith('customer-');

export const useHashRouter = (initialView, logout, token, user) => {
  const [view, setView] = useState(initialView);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [storefrontSlug, setStorefrontSlug] = useState('');
  const [storefrontSubView, setStorefrontSubView] = useState('home');
  const [storefrontProductId, setStorefrontProductId] = useState(null);

  const tokenRef = useRef(token);
  const userRef = useRef(user);
  tokenRef.current = token;
  userRef.current = user;

  const navStackRef = useRef([]);
  const isRedirectRef = useRef(false);
  const lastKnownHashRef = useRef('__init__');

  // Guard: when auth is lost on a protected view, redirect to Landing Page
  useEffect(() => {
    if (isProtectedView(view) && !token) {
      setView('home');
      window.location.hash = '';
    }
  }, [token, view]);

  // Redirect to correct dashboard when login completes (token appears)
  useEffect(() => {
    console.log('[HashRouter] Redirect effect:', { token: !!token, user: user?.role, view, sellerStatus: user?.sellerStatus });
    if (token && user && view === 'auth') {
      const role = user.role;
      console.log('[HashRouter] Redirecting authenticated user from auth page, role:', role);
      isRedirectRef.current = true; // Mark this as a programmatic redirect
      if (role === 'Admin') {
        setView('admin');
        window.location.hash = 'admin';
      } else if (role === 'Seller') {
        if (user.sellerStatus === 'Pending' || user.sellerStatus === 'Rejected' || user.sellerStatus === 'Suspended') {
          setView('waiting-approval');
          window.location.hash = 'waiting-approval';
        } else {
          setView('seller');
          window.location.hash = 'seller';
        }
      }
    }
  }, [token, user, view]);

  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.substring(1);
      if (hash.startsWith('/')) {
        hash = hash.substring(1);
      }
      const marketingHashes = ['features', 'pricing', 'templates', 'about', 'contact', 'faq', 'privacy', 'terms'];
      const baseHash = hash.split('?')[0];

      if (baseHash === 'cart' || baseHash === 'orders' || baseHash === 'customer' ||
        baseHash.startsWith('customer/') || baseHash === 'seller' ||
        baseHash === 'seller/notifications' || baseHash === 'admin' ||
        baseHash === 'admin/notifications' || baseHash === 'admin/stores' ||
        baseHash === 'admin/support' || baseHash === 'admin/announcements' ||
        baseHash === 'admin/settings' ||
        baseHash === 'admin/audit-logs' || baseHash === 'admin/system-health' ||
        baseHash === 'admin/reports' || baseHash === 'generator' ||
        baseHash === 'auth' || baseHash === '/auth' ||
        baseHash.startsWith('product/') || baseHash.startsWith('category/') ||
        baseHash === 'store-catalog' || baseHash === 'billing' ||
        baseHash === 'admin/billing' || marketingHashes.includes(baseHash) ||
        baseHash.startsWith('store/') || baseHash === 'store-payment-simulator' ||
        baseHash.startsWith('template-preview') ||
        baseHash === 'waiting-approval'
      ) {

        if (!isRedirectRef.current && lastKnownHashRef.current !== '__init__') {
          const stack = navStackRef.current;
          if (stack.length > 0 && stack[stack.length - 1] === hash) {
            stack.pop();
          } else {
            const prev = lastKnownHashRef.current;
            stack.push(prev === '' ? '__home__' : prev);
          }
        }
        isRedirectRef.current = false;
        lastKnownHashRef.current = hash;

        if (baseHash === 'cart') setView('cart');
        else if (baseHash === 'orders') setView('orders');
        else if (baseHash === 'customer') setView('customer');
        else if (baseHash.startsWith('customer/')) {
          const tab = baseHash.split('/')[1];
          setView(`customer-${tab}`);
        }
        else if (baseHash === 'seller') setView('seller');
        else if (baseHash === 'seller/notifications') setView('seller/notifications');
        else if (baseHash === 'admin') setView('admin');
        else if (baseHash === 'admin/notifications') setView('admin/notifications');
        else if (baseHash === 'admin/stores') setView('admin/stores');
        else if (baseHash === 'admin/support') setView('admin/support');
        else if (baseHash === 'admin/announcements') setView('admin/announcements');
        else if (baseHash === 'admin/settings') setView('admin/settings');
        else if (baseHash === 'admin/audit-logs') setView('admin/audit-logs');
        else if (baseHash === 'admin/system-health') setView('admin/system-health');
        else if (baseHash === 'admin/reports') setView('admin/reports');
        else if (baseHash === 'generator') setView('generator');
        else if (baseHash === 'store-catalog') setView('store-catalog');
        else if (baseHash === 'store-payment-simulator') setView('store-payment-simulator');
        else if (baseHash.startsWith('template-preview')) setView('template-preview');
        else if (baseHash === 'billing') setView('billing');
        else if (baseHash === 'admin/billing') setView('admin/billing');
        else if (baseHash === 'waiting-approval') setView('waiting-approval');
        else if (marketingHashes.includes(baseHash)) setView(baseHash);
        else if (hash === 'auth' || hash === '/auth') {
          setView('auth');
        }
        else if (hash.startsWith('product/')) {
          const id = hash.split('/')[1];
          setSelectedProductId(id);
          setView('detail');
          window.location.hash = `product/${id}`;
        } else if (hash.startsWith('category/')) {
          const cat = decodeURIComponent(hash.split('/')[1]);
          setView('store-catalog');
        } else if (baseHash.startsWith('store/')) {
          const parts = baseHash.split('/');
          const slug = parts[1] || '';
          setStorefrontSlug(slug);

          let subView = 'home';
          let prodId = null;

          if (parts[2]) {
            if (parts[2] === 'products') {
              subView = 'products';
            } else if (parts[2] === 'product' && parts[3]) {
              subView = 'detail';
              prodId = parts[3];
            } else if (parts[2] === 'cart') {
              subView = 'cart';
            } else if (parts[2] === 'checkout') {
              subView = 'checkout';
            } else if (parts[2] === 'account') {
              subView = 'account';
            } else if (parts[2] === 'orders') {
              subView = 'orders';
            }
          }
          setStorefrontSubView(subView);
          setStorefrontProductId(prodId);
          setView('storefront');
        }
      } else {
        if (isRedirectRef.current) {
          isRedirectRef.current = false;
          lastKnownHashRef.current = '';
          setView('home');
          return;
        }

        if (navStackRef.current.length > 0) {
          const prev = navStackRef.current.pop();
          isRedirectRef.current = true;
          window.location.hash = prev === '__home__' ? '' : prev;
          return;
        }

        lastKnownHashRef.current = '';
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [logout]);

  const navigateTo = (targetView, hash = '') => {
    setView(targetView);
    window.location.hash = hash;
  };

  return {
    view,
    setView,
    selectedProductId,
    setSelectedProductId,
    navigateTo,
    storefrontSlug,
    setStorefrontSlug,
    storefrontSubView,
    setStorefrontSubView,
    storefrontProductId,
    setStorefrontProductId
  };
};
