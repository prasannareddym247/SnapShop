import React from 'react';

export default function WishlistPage({ state }) {
  const wishlist = state.wishlist || [];

  if (wishlist.length === 0) {
    return (
      <div className="pure-page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>♡</div>
        <h1>Your Wishlist is Empty</h1>
        <p style={{ marginBottom: '2rem' }}>Save your favorite products and come back to them later.</p>
        <button className="pure-btn-primary" onClick={() => state.navigate('category')}>Discover Products</button>
      </div>
    );
  }

  return (
    <div className="pure-page" style={{ maxWidth: '900px' }}>
      <h1>My Wishlist ({wishlist.length})</h1>
      <div className="pure-product-grid">
        {wishlist.map(p => {
          const inWishlist = true;
          return (
            <div key={p.id} className="pure-product-card" style={{ cursor: 'pointer' }} onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
              <div className="pure-product-image">
                <img src={p.image} alt={p.name} />
                <button className={`pure-wishlist active`} onClick={(e) => { e.stopPropagation(); state.toggleWishlist(p); }}>♥</button>
                <button className="pure-quickview" onClick={(e) => { e.stopPropagation(); state.setSelectedProduct(p); state.navigate('product'); }}>Quick View</button>
              </div>
              <div className="pure-product-info">
                <h3 className="pure-product-name">{p.name}</h3>
                <div className="pure-product-desc">{p.brand || ''}</div>
                {p.rating && <div className="pure-product-rating">{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}<span>({p.reviews || 0})</span></div>}
                <div className="pure-product-price">${p.price || 0}</div>
                <button className="pure-product-atc" onClick={(e) => { e.stopPropagation(); state.addToCart(p); }}>Add to Cart</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
