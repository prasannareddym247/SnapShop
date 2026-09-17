import React from 'react';

export default function WishlistPage({ state }) {
  const items = state.wishlist || [];
  return (
    <div className="glam-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2.5rem', marginBottom: '2rem' }}>Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--glam-text-muted)', marginBottom: '2rem' }}>Your wishlist is empty</p>
          <button className="glam-btn-primary" onClick={() => state.navigate('category')}>Discover Products</button>
        </div>
      ) : (
        <div className="glam-product-grid">
          {items.map(p => (
            <div key={p.id} className="glam-product-card">
              <div className="glam-product-image" onClick={() => state.navigate('product', p)}>
                <img src={p.image} alt={p.name} />
                <button className="glam-product-wishlist active" onClick={(e) => { e.stopPropagation(); state.toggleWishlist(p); }}>♥</button>
              </div>
              <div className="glam-product-info">
                <h3 className="glam-product-name">{p.name}</h3>
                <div className="glam-product-price">${p.price}</div>
                <button className="glam-product-atc" onClick={() => { state.addToCart(p); }}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
