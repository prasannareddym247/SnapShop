import React, { useState } from 'react';

export default function SearchPage({ state }) {
  const [localQuery, setLocalQuery] = useState(state.searchQuery || '');

  const results = state.filteredProducts || [];

  const handleSearch = (e) => {
    e.preventDefault();
    state.setSearchQuery(localQuery);
  };

  return (
    <main className="zara-template" style={{ padding: '2rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #000', paddingBottom: '0.5rem' }}>
          <input
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '1.25rem',
              fontFamily: 'inherit', background: 'transparent', color: '#111',
            }}
            placeholder="Search products..."
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', fontWeight: 600 }}>Search</button>
        </div>
      </form>

      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>
        {results.length} result{results.length !== 1 ? 's' : ''} for "{localQuery || state.searchQuery || 'all'}"
      </p>

      {results.length === 0 ? (
        <div className="zara-empty-state" style={{ padding: '3rem 0' }}>
          <div className="zara-empty-icon">🔍</div>
          <h3 className="zara-empty-title">No results found</h3>
          <p className="zara-empty-desc">Try adjusting your search terms or browse our collections.</p>
          <button className="zara-btn zara-btn-dark" onClick={() => state.navigate('category')}>Browse All</button>
        </div>
      ) : (
        <div className="zara-grid">
          {results.map(product => (
            <div key={product.id} className="zara-product-card" onClick={() => { state.setSelectedProduct(product); state.navigate('product'); }}>
              <div className="zara-product-image-wrap">
                <img src={product.image || `https://placehold.co/400x533/f5f5f5/aaa?text=Product`} alt={product.name} className="zara-product-image" loading="lazy" />
                {product.badge && <span className="zara-product-badge">{product.badge}</span>}
                <button className="zara-wishlist-btn" onClick={e => { e.stopPropagation(); state.toggleWishlist(product); }}>
                  {state.wishlist?.some(w => w.id === product.id) ? '♥' : '♡'}
                </button>
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
      )}
    </main>
  );
}
