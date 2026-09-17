import React from 'react';

export default function WishlistPage({ state }) {
  const wishlist = state.wishlist || [];

  if (wishlist.length === 0) {
    return (
      <div className="mb-page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>♡</div>
        <h1>Your Wishlist is Empty</h1>
        <p style={{ marginBottom: '2rem', fontWeight: 300 }}>Save your cherished beauty discoveries for later.</p>
        <button className="mb-btn-primary" onClick={() => state.navigate('category')}>Explore Collection</button>
      </div>
    );
  }

  return (
    <div className="mb-page" style={{ maxWidth: '900px' }}>
      <h1>My Wishlist ({wishlist.length})</h1>
      <div className="mb-product-grid">
        {wishlist.map(p => {
          const inWishlist = true;
          return (
            <div key={p.id} className="mb-product-card" onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
              <div className="mb-product-image">
                <img src={p.image} alt={p.name} />
                <button className={`mb-wishlist active`} onClick={(e) => { e.stopPropagation(); state.toggleWishlist(p); }}>♥</button>
                <button className="mb-quickview" onClick={(e) => { e.stopPropagation(); state.setSelectedProduct(p); state.navigate('product'); }}>Quick View</button>
              </div>
              <div className="mb-product-info">
                <div className="mb-product-brand">{p.brand || ''}</div>
                <h3 className="mb-product-name">{p.name}</h3>
                {p.rating && <div className="mb-product-rating">{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}<span>({p.reviews || 0})</span></div>}
                <div className="mb-product-price">${p.price || 0}</div>
                <button className="mb-product-atc" onClick={(e) => { e.stopPropagation(); state.addToCart(p); }}>Add to Cart</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
