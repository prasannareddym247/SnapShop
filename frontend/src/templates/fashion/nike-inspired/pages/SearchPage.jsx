import React from 'react';
export default function SearchPage({ state }) {
  const results = state.filteredProducts || [];
  return (
    <main style={{ padding: '2rem 4%', maxWidth: '1200px', margin: '0 auto' }}>
      <form onSubmit={e => { e.preventDefault(); }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #111', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
          <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.25rem', fontFamily: 'inherit', background: 'transparent', color: '#111' }} placeholder="Search products..." value={state.searchQuery} onChange={e => state.setSearchQuery(e.target.value)} autoFocus />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontFamily: 'inherit', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Search</button>
        </div>
      </form>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>{results.length} results</p>
      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}><p style={{ color: '#757575' }}>No results found.</p></div>
      ) : (
        <div className="sp-grid">{results.map(p => (
          <div key={p.id} className="sp-product-card" onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
            <div className="sp-product-image-wrap"><img src={p.image || `https://placehold.co/400x480/f5f5f5/aaa?text=P`} alt={p.name} className="sp-product-image" loading="lazy" /></div>
            <div className="sp-product-info"><div className="sp-product-brand">{p.brand}</div><h3 className="sp-product-name">{p.name}</h3><span className="sp-product-price">₹{p.price}</span></div>
          </div>
        ))}</div>
      )}
    </main>
  );
}
