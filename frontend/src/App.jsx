import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './app/context/AuthContext';
import { CartProvider } from './app/context/CartContext';
// Layout & UI Components
import StoreLayout from './layouts/StoreLayout';

// Page Feature Modules
import AuthPage from './pages/auth/AuthPage';
import WaitingApprovalPage from './pages/auth/WaitingApprovalPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import GeneratorPage from './pages/generator/GeneratorPage';
import SellerDashboardPage from './pages/dashboard/SellerDashboardPage';
import BillingDashboard from './pages/dashboard/BillingDashboard';
import PublicStorefront from './pages/storefront/PublicStorefront';
import MockPaymentTerminal from './pages/storefront/MockPaymentTerminal';
import TemplatePreview from './pages/preview/TemplatePreview';

// Custom Hooks
import { useHashRouter } from './hooks/useHashRouter';

// Lazy loaded Marketing Components
const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const FeaturesPage = lazy(() => import('./pages/marketing/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'));
const TemplatesPage = lazy(() => import('./pages/marketing/TemplatesPage'));
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'));
const FAQPage = lazy(() => import('./pages/marketing/FAQPage'));
const PrivacyPage = lazy(() => import('./pages/marketing/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/marketing/TermsPage'));
const MarketingLayout = lazy(() => import('./layouts/MarketingLayout'));

import './App.css';

function AppContent() {
  const { token, user, loading: authLoading, logout } = useAuth();
  
  // Hash Routing using our custom hook
  const { 
    view, 
    setView, 
    selectedProductId, 
    setSelectedProductId, 
    storefrontSlug, 
    storefrontSubView, 
    storefrontProductId 
  } = useHashRouter('home', logout, token, user);
  
  // Responsive Sidebar States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Shared state for AI Generator -> Admin Product Form prefill
  const [prefilledProduct, setPrefilledProduct] = useState(null);

  // Guard: after auth check completes, redirect protected views to Landing Page if not authenticated
  useEffect(() => {
    if (authLoading) return;
    
    console.log('[App.jsx] Redirect effect:', { view, token: !!token, userRole: user?.role, sellerStatus: user?.sellerStatus, authLoading });

    // 1. Unauthenticated on a protected view → Landing Page
    const isProtected = view === 'seller' || view === 'seller/notifications' ||
      view === 'admin' || view.startsWith('admin/') ||
      view === 'generator' || view === 'billing';
    if (isProtected && !token) {
      console.log('[App.jsx] Redirecting to home - not authenticated on protected view');
      setView('home');
      window.location.hash = '';
      return;
    }

    // 2. Role mismatch on dashboard views → redirect to correct dashboard
    if (token && user) {
      const isAdminView = view === 'admin' || view.startsWith('admin/') || view === 'generator';
      const isSellerView = view === 'seller' || view === 'seller/notifications';
      if (isAdminView && user.role !== 'Admin') {
        const target = user.role === 'Seller' ? 'seller' : 'home';
        console.log('[App.jsx] Role mismatch - redirecting to', target);
        setView(target);
        window.location.hash = target === 'home' ? '' : target;
        return;
      }
      if (isSellerView && user.role !== 'Seller') {
        const target = user.role === 'Admin' ? 'admin' : 'home';
        console.log('[App.jsx] Role mismatch - redirecting to', target);
        setView(target);
        window.location.hash = target === 'home' ? '' : target;
        return;
      }
      // Redirect sellers with pending/rejected/suspended status to waiting-approval
      if (user.role === 'Seller' && user.sellerStatus && user.sellerStatus !== 'Approved') {
        if (isSellerView || view === 'home' || view === '') {
          console.log('[App.jsx] Seller not approved - redirecting to waiting-approval');
          setView('waiting-approval');
          window.location.hash = 'waiting-approval';
          return;
        }
      }
      // Redirect approved sellers from waiting-approval to seller dashboard
      if (user.role === 'Seller' && user.sellerStatus === 'Approved' && view === 'waiting-approval') {
        console.log('[App.jsx] Seller is approved - redirecting to seller dashboard');
        setView('seller');
        window.location.hash = 'seller';
        return;
      }
      // Customers are not allowed in the SaaS app - redirect to home (unless on a public storefront)
      if (user.role === 'Customer' && view !== 'storefront') {
        console.log('[App.jsx] Customer redirecting to home');
        setView('home');
        window.location.hash = '';
        return;
      }
    }

    // 3. On initial load, redirect authenticated users to their dashboard
    if (token && user) {
      const isOnLandingOrPublic = view === 'home' || view === '' || view === 'features' || view === 'pricing';
      const isOnAuthPage = view === 'auth';
      console.log('[App.jsx] Checking redirect:', { isOnLandingOrPublic, isOnAuthPage, view });
      if (isOnLandingOrPublic || isOnAuthPage) {
        if (user.role === 'Admin') {
          console.log('[App.jsx] Redirecting admin to admin dashboard');
          setView('admin');
          window.location.hash = 'admin';
        } else if (user.role === 'Seller') {
          if (user.sellerStatus === 'Pending' || user.sellerStatus === 'Rejected' || user.sellerStatus === 'Suspended') {
            console.log('[App.jsx] Redirecting seller to waiting-approval');
            setView('waiting-approval');
            window.location.hash = 'waiting-approval';
          } else {
            console.log('[App.jsx] Redirecting seller to seller dashboard');
            setView('seller');
            window.location.hash = 'seller';
          }
        } else {
          console.log('[App.jsx] Redirecting customer to home');
          setView('home');
          window.location.hash = '';
        }
      }
    }
  }, [authLoading, token, user, view]);

  if (authLoading && token && !user) {
    return (
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (view === 'storefront') {
    return (
      <PublicStorefront 
        slug={storefrontSlug} 
        subView={storefrontSubView} 
        productId={storefrontProductId} 
      />
    );
  }

  if (view === 'template-preview') {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    const params = {};
    if (qIdx !== -1) {
      hash.substring(qIdx + 1).split('&').forEach(pair => {
        const [key, val] = pair.split('=');
        if (key) params[key] = decodeURIComponent(val || '');
      });
    }
    return <TemplatePreview templateId={params.template} storeName={params.storeName} onBack={() => { setView('templates'); window.location.hash = 'templates'; }} />;
  }

  if (view === 'store-payment-simulator') {
    return (
      <MockPaymentTerminal />
    );
  }

  // Check if we should render the SaaS marketing layout
  const marketingViews = ['home', 'features', 'pricing', 'templates', 'about', 'contact', 'faq', 'privacy', 'terms'];
  const isMarketingView = marketingViews.includes(view) && (!token || !user);

  if (isMarketingView) {
    return (
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      }>
        <MarketingLayout currentView={view} setView={setView}>
          {view === 'home' && <LandingPage setView={setView} />}
          {view === 'features' && <FeaturesPage setView={setView} />}
          {view === 'pricing' && <PricingPage setView={setView} />}
          {view === 'templates' && <TemplatesPage setView={setView} />}
          {view === 'about' && <AboutPage />}
          {view === 'contact' && <ContactPage />}
          {view === 'faq' && <FAQPage />}
          {view === 'privacy' && <PrivacyPage />}
          {view === 'terms' && <TermsPage />}
        </MarketingLayout>
      </Suspense>
    );
  }

  if (view === 'waiting-approval') {
    return (
      <WaitingApprovalPage
        onLogout={() => { setView('home'); window.location.hash = ''; }}
        onRetry={() => { setView('auth'); window.location.hash = 'auth'; }}
      />
    );
  }

  if (view === 'auth') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <AuthPage />
      </div>
    );
  }

  // Renders the storefront template layout wrapping buyer catalog and merchant dashboards
  return (
    <StoreLayout
      view={view}
      setView={setView}
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
      user={user}
    >

      {view === 'billing' && token && (
        <BillingDashboard />
      )}

      {(view === 'seller' || view === 'seller/notifications') && token && (
        <SellerDashboardPage 
          mobileSidebarOpen={mobileSidebarOpen} 
          setMobileSidebarOpen={setMobileSidebarOpen} 
          view={view}
          {...(() => {
            const hash = window.location.hash;
            const qIdx = hash.indexOf('?');
            if (qIdx === -1) return {};
            const query = hash.substring(qIdx + 1);
            const params = {};
            query.split('&').forEach(pair => {
              const [key, val] = pair.split('=');
              if (key) params[key] = decodeURIComponent(val || '');
            });
            return params;
          })()}
        />
      )}

      {(view === 'admin' || view.startsWith('admin/')) && user && user.role === 'Admin' && (
        <AdminDashboardPage 
          prefilledProduct={prefilledProduct}
          clearPrefilledProduct={() => setPrefilledProduct(null)}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          view={view}
        />
      )}

      {view === 'generator' && user && user.role === 'Admin' && (
        <GeneratorPage
          onApplyToForm={(productData) => {
            setPrefilledProduct(productData);
            setView('admin');
            window.location.hash = 'admin';
          }}
          onProductAdded={() => {
            setView('admin');
            window.location.hash = 'admin';
          }}
        />
      )}
    </StoreLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}