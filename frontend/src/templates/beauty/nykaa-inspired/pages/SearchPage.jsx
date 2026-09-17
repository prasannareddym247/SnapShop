import React from 'react';

export default function SearchPage({ state }) {
  const query = state.searchQuery || '';
  const PRODUCTS = state.filteredProducts || [];
  const results = query ? PRODUCTS.filter(p => (p.name || '').toLowerCase().includes(query.toLowerCase()) || (p.brand || '').toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="glam-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2.5rem', marginBottom: '2rem' }}>Search</h1>
      <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }}>
        <input type="text" placeholder="Search products, brands, concerns..." value={query}
          onChange={(e) => state.setSearchQuery && state.setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && state.setSearchQuery && state.navigate('search')}
          style={{ flex: 1, background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRight: 'none', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', padding: '1rem 1.5rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', fontSize: '1rem', outline: 'none' }} />
        <button onClick={() => state.navigate('search')} style={{ background: 'var(--glam-primary)', color: '#fff', border: 'none', padding: '1rem 2rem', cursor: 'pointer', fontFamily: 'var(--glam-accent-font)', fontWeight: 600, fontSize: '0.85rem', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}>Search</button>
      </div>
      {query && results.length === 0 && <p style={{ color: 'var(--glam-text-muted)', textAlign: 'center', padding: '3rem 0' }}>No results found for "{query}"</p>}
      {results.length > 0 && (
        <div className="glam-product-grid">
          {results.map(p => {
            const price = p.discountedPrice != null ? p.discountedPrice : (p.price || 0);
            const original = p.originalPrice || (p.discountedPrice != null && p.discountedPrice < (p.price || 0) ? p.price : null);
            return (
              <div key={p.id} className="glam-product-card" onClick={() => state.navigate('product', p)}>
                <div className="glam-product-image"><img src={p.image || p.imageUrl} alt={p.name} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80'; }} /></div>
                <div className="glam-product-info">
                  <div className="glam-product-brand">{p.brand || ''}</div>
                  <h3 className="glam-product-name">{p.name}</h3>
                  <div className="glam-product-price">₹{Number(price).toLocaleString('en-IN')}{original && <span className="original">₹{Number(original).toLocaleString('en-IN')}</span>}</div>
                  <div className="glam-product-rating">{'★'.repeat(Math.floor(p.rating || 4))}{'☆'.repeat(5 - Math.floor(p.rating || 4))}<span>({(Array.isArray(p.reviews) ? p.reviews.length : p.reviews) || p.reviewCount || 0})</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}