import React from 'react';
export default function WishlistPage({ state }) {
  const items = state.wishlist || [];
  if (!items.length) return (
    <main style={{ padding: '4rem 4%', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '1rem' }}>♡</div>
      <h2 style={{ fontWeight: 800, textTransform: 'uppercase' }}>Wishlist Empty</h2>
      <p style={{ color: '#757575', marginBottom: '1.5rem' }}>Save items you love and come back anytime.</p>
      <button className="sp-btn" onClick={() => state.navigate('category')}>Discover Products</button>
    </main>
  );
  return (
    <main style={{ padding: '3rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem' }}>Wishlist ({items.length})</h1>
      <div className="sp-grid">{items.map(p => (
        <div key={p.id} className="sp-product-card" onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
          <div className="sp-product-image-wrap"><img src={p.image || `https://placehold.co/400x480/f5f5f5/aaa?text=P`} alt={p.name} className="sp-product-image" loading="lazy" />
            <button className="sp-product-wishlist" onClick={e => { e.stopPropagation(); state.toggleWishlist(p); }}>♥</button>
          </div>
          <div className="sp-product-info"><div className="sp-product-brand">{p.brand}</div><h3 className="sp-product-name">{p.name}</h3><span className="sp-product-price">₹{p.price}</span></div>
        </div>
      ))}</div>
    </main>
  );
}
