import React from 'react';
export default function SearchPage({ state }) {
  const results = state.filteredProducts || [];
  return (
    <div className="bl-container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '900px' }}>
      <form onSubmit={e => { e.preventDefault(); }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
          <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.25rem', fontFamily: 'inherit', background: 'transparent', color: '#1a1a1a' }} placeholder="Search beauty products..." value={state.searchQuery} onChange={e => state.setSearchQuery(e.target.value)} autoFocus />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Search</button>
        </div>
      </form>
      <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '2rem' }}>{results.length} results</p>
      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}><p style={{ color: '#8a8a8a' }}>No results found.</p></div>
      ) : (
        <div className="bl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {results.map(p => (
            <div key={p.id} className="bl-product-card" onClick={() => { state.setSelectedProduct?.(p); state.navigate?.('product'); }}>
              <div className="bl-product-image-wrap">
                <img src={p.image || `https://placehold.co/400x480/f8f5f1/8a8a8a?text=P`} alt={p.name} className="bl-product-image" loading="lazy" />
              </div>
              <div className="bl-product-info">
                <div className="bl-product-brand">{p.brand}</div>
                <div className="bl-product-name">{p.name}</div>
                <span className="bl-product-price">₹{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
