import React from 'react';
export default function WishlistPage({ state }) {
  const items = state.wishlist || [];
  if (!items.length) return (
    <div className="bl-container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '1rem' }}>♡</div>
      <h2 style={{ fontFamily: 'var(--bl-font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>Wishlist Empty</h2>
      <p style={{ color: '#8a8a8a', marginBottom: '1.5rem' }}>Save your favorite beauty finds and come back anytime.</p>
      <button className="bl-btn" onClick={() => state.navigate?.('category')}>Discover Products</button>
    </div>
  );
  return (
    <div className="bl-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Wishlist ({items.length})</h1>
      <div className="bl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {items.map(p => (
          <div key={p.id} className="bl-product-card" onClick={() => { state.setSelectedProduct?.(p); state.navigate?.('product'); }}>
            <div className="bl-product-image-wrap">
              <img src={p.image || `https://placehold.co/400x480/f8f5f1/8a8a8a?text=P`} alt={p.name} className="bl-product-image" loading="lazy" />
              <button className="bl-product-wishlist" onClick={e => { e.stopPropagation(); state.toggleWishlist?.(p); }}>♥</button>
            </div>
            <div className="bl-product-info">
              <div className="bl-product-brand">{p.brand}</div>
              <div className="bl-product-name">{p.name}</div>
              <span className="bl-product-price">₹{p.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
