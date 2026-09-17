import React from 'react';

export default function WishlistPage({ state }) {
  const items = state.wishlist || [];

  if (items.length === 0) {
    return (
      <main className="zara-template" style={{ padding: '4rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="zara-empty-state">
          <div className="zara-empty-icon">♡</div>
          <h2 className="zara-empty-title">Your wishlist is empty</h2>
          <p className="zara-empty-desc">Save items you love to your wishlist and come back to them anytime.</p>
          <button className="zara-btn zara-btn-dark" onClick={() => state.navigate('category')}>Discover Products</button>
        </div>
      </main>
    );
  }

  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.25rem' }}>My Wishlist</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>

      <div className="zara-grid">
        {items.map(product => (
          <div key={product.id} className="zara-product-card" onClick={() => { state.setSelectedProduct(product); state.navigate('product'); }}>
            <div className="zara-product-image-wrap">
              <img src={product.image || `https://placehold.co/400x533/f5f5f5/aaa?text=Product`} alt={product.name} className="zara-product-image" loading="lazy" />
              {product.badge && <span className="zara-product-badge">{product.badge}</span>}
              <button className="zara-wishlist-btn" onClick={e => { e.stopPropagation(); state.toggleWishlist(product); }}>♥</button>
              <button className="zara-quick-view" onClick={e => { e.stopPropagation(); state.setSelectedProduct(product); state.navigate('product'); }}>Quick View</button>
            </div>
            <div className="zara-product-info">
              {product.brand && <div className="zara-product-brand">{product.brand}</div>}
              <h3 className="zara-product-name">{product.name}</h3>
              <div>
                <span className="zara-product-price">₹{product.price}</span>
                {product.originalPrice && <span className="zara-product-original-price">₹{product.originalPrice}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
