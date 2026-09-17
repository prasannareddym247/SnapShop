import React from 'react';

export default function WishlistPage({ state }) {
  const items = state.wishlist || [];

  return (
    <div className="urban-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '3rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '2rem' }}>Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--sw-text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Your wishlist is empty</p>
          <button className="urban-btn-primary" onClick={() => state.navigate('category')}>Explore Products</button>
        </div>
      ) : (
        <div className="urban-product-grid">
          {items.map(p => (
            <div key={p.id} className="urban-product-card">
              <div className="urban-product-card-image" onClick={() => state.navigate('product', p)}>
                <img src={p.image} alt={p.name} />
                <button className="urban-product-wishlist active" onClick={(e) => { e.stopPropagation(); state.toggleWishlist(p); }}>♥</button>
              </div>
              <div className="urban-product-card-info">
                <h3 className="urban-product-card-name">{p.name}</h3>
                <div className="urban-product-card-price">${p.price}</div>
                <button className="urban-product-card-atc" onClick={() => { state.addToCart(p); }}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
