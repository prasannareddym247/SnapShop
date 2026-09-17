import React from 'react';
import { useAuth } from '../../app/context/AuthContext';

const Navbar = ({ 
  view, 
  setView, 
  mobileSidebarOpen, 
  setMobileSidebarOpen,
}) => {
  const { token, user, logout } = useAuth();

  const handleNav = (targetView, hash = '') => {
    setView(targetView);
    window.location.hash = hash;
  };

  return (
    <nav className="navbar" style={view === 'admin' || view === 'seller' ? { position: 'static' } : { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1010 }}>
      {(view === 'seller' || view === 'admin') && (
        <button 
          className="hamburger-btn" 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      )}

      <div className="brand" onClick={() => {
        if (user?.role === 'Admin') { handleNav('admin', 'admin'); }
        else if (user?.role === 'Seller') { handleNav('seller', 'seller'); }
        else { handleNav('home'); }
      }}>
        <span className="brand-icon">🌱</span>
        <span className="brand-name">SnapShop</span>
      </div>

      <div className="nav-links">
        {user ? (
          <div className="user-badge">
            <span>👤 {user.firstName}</span>
            <button className="logout-btn" onClick={() => logout()} title="Logout">➡️</button>
          </div>
        ) : (
          <span className="nav-item" onClick={() => handleNav('auth', 'auth')}>Login / Register</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
