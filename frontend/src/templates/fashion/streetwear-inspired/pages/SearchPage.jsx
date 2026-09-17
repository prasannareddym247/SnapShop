import React from 'react';

const PRODUCTS = [
  { id: 'sw1', name: 'Oversized Hoodie', price: 89, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', rating: 4.5, reviews: 128 },
  { id: 'sw2', name: 'Graphic Tee', price: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80', category: 'T-Shirts', rating: 4.3, reviews: 94 },
  { id: 'sw5', name: 'Sneakers Pro', price: 145, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', rating: 4.8, reviews: 203 },
  { id: 'sw9', name: 'Tech Fleece Hoodie', price: 120, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', rating: 4.6, reviews: 89 },
];

export default function SearchPage({ state }) {
  const query = state.searchQuery || '';
  const activeProducts = state.filteredProducts && state.filteredProducts.length > 0 ? state.filteredProducts : PRODUCTS;
  const results = query ? activeProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="urban-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '3rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '2rem' }}>Search</h1>
      <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }}>
        <input
          type="text" placeholder="Search products..." value={query}
          onChange={(e) => state.setSearchQuery && state.setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && state.setSearchQuery && state.navigate('search')}
          style={{ flex: 1, background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', borderRight: 'none', padding: '1rem 1.5rem', color: 'var(--sw-text)', fontFamily: 'var(--sw-body)', fontSize: '1rem', outline: 'none' }}
        />
        <button onClick={() => state.navigate('search')} style={{ background: 'var(--sw-primary)', color: '#fff', border: 'none', padding: '1rem 2rem', cursor: 'pointer', fontFamily: 'var(--sw-accent-font)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Search</button>
      </div>
      {query && results.length === 0 && <p style={{ color: 'var(--sw-text-muted)', textAlign: 'center', padding: '3rem 0' }}>No results found for "{query}"</p>}
      {results.length > 0 && (
        <div className="urban-product-grid">
          {results.map(p => (
            <div key={p.id} className="urban-product-card" onClick={() => state.navigate('product', p)}>
              <div className="urban-product-card-image"><img src={p.image} alt={p.name} /></div>
              <div className="urban-product-card-info">
                <h3 className="urban-product-card-name">{p.name}</h3>
                <div className="urban-product-card-price">${p.price}</div>
                <div className="urban-product-card-rating">{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}<span>({p.reviews})</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
