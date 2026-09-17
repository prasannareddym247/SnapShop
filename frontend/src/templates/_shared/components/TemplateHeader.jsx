import React from 'react';
import { useTheme } from '../utils/ThemeEngine';
import { useAuth } from '../../../app/context/AuthContext';

export default function TemplateHeader({
  logo,
  navItems = [],
  cartCount = 0,
  onNavClick,
  onCartClick,
  onSearch,
  searchQuery = '',
  onSearchChange,
  variant = 'default',
  transparent = false,
  sticky = true
}) {
  const { palette } = useTheme();
  
  const token = localStorage.getItem('fk_customer_token');
  const user = (() => {
    try {
      const u = localStorage.getItem('fk_customer_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const headerStyle = {
    background: transparent ? 'transparent' : (palette.surface || '#ffffff'),
    borderBottom: transparent ? 'none' : `1px solid ${palette.border || '#e2e8f0'}`,
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 100,
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem'
  };

  const navListStyle = {
    display: 'flex',
    gap: '1.5rem',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const navLinkStyle = {
    color: palette.text || '#0f172a',
    textDecoration: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontSize: '0.95rem'
  };

  const searchInputStyle = {
    padding: '0.4rem 0.8rem',
    borderRadius: '2rem',
    border: `1px solid ${palette.border || '#cbd5e1'}`,
    background: palette.bg || '#f8fafc',
    color: palette.text || '#000',
    outline: 'none',
    fontSize: '0.9rem'
  };

  return (
    <header style={headerStyle}>
      <div 
        style={{ fontSize: '1.5rem', fontWeight: 800, color: palette.primary || '#2563eb', cursor: 'pointer' }}
        onClick={() => onNavClick?.('home')}
      >
        {logo}
      </div>

      <nav>
        <ul style={navListStyle}>
          {navItems.map((item, i) => (
            <li key={i}>
              <button 
                style={navLinkStyle} 
                onClick={() => onNavClick?.(item.key)}
              >
                {item.icon} {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); onSearch?.(searchQuery); }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={searchInputStyle}
          />
        </form>
        {token && user && user.role === 'Customer' ? (
          <button
            onClick={() => onNavClick?.('account')}
            style={{
              background: palette.primary || '#2563eb',
              border: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            👤 {user.firstName || 'Account'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onNavClick?.('account')}
              style={{
                background: 'none',
                border: `1px solid ${palette.primary || '#2563eb'}`,
                color: palette.primary || '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '5px 12px',
                borderRadius: '2px'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => onNavClick?.('account')}
              style={{
                background: palette.primary || '#2563eb',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '5px 12px',
                borderRadius: '2px'
              }}
            >
              Register
            </button>
          </div>
        )}

        <button 
          onClick={onCartClick}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer'
          }}
        >
          🛒
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: palette.primary || '#ef4444',
              color: '#ffffff',
              borderRadius: '50%',
              padding: '0.2rem 0.4rem',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
