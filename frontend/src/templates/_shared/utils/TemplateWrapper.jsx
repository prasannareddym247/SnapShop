import React from 'react';
import { ThemeProvider } from './ThemeEngine';
import TemplateHeader from '../components/TemplateHeader';
import TemplateFooter from '../components/TemplateFooter';

export default function TemplateWrapper({
  config,
  children,
  headerProps = {},
  footerProps = {},
  navItems = [],
  onNavClick,
  cartCount = 0,
  onCartClick,
  searchQuery = '',
  onSearchChange,
  onSearch,
}) {
  return (
    <ThemeProvider config={config}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TemplateHeader
          logo={config?.storeName || config?.name || 'Store'}
          navItems={navItems}
          cartCount={cartCount}
          onNavClick={onNavClick}
          onCartClick={onCartClick}
          onSearch={onSearch}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          variant={config?.headerVariant || 'default'}
          transparent={config?.headerTransparent}
          sticky={config?.headerSticky !== false}
          {...headerProps}
        />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <TemplateFooter
          logo={config?.storeName || config?.name || 'Store'}
          description={config?.description || 'Your one-stop shop for everything.'}
          columns={config?.footerColumns}
          socialLinks={config?.socialLinks}
          onNavClick={onNavClick}
          variant={config?.footerVariant || 'default'}
          {...footerProps}
        />
      </div>
    </ThemeProvider>
  );
}
