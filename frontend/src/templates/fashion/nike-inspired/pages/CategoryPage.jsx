import React, { useState } from 'react';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const CAT_TABS = ['All', 'Footwear', 'Apparel', 'Accessories', 'Equipment', 'Sale'];

export default function CategoryPage({ state }) {
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const itemsPerPage = 12;

  let products = [...(state.filteredProducts || [])];
  if (sortBy === 'price-asc') products.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sortBy === 'price-desc') products.sort((a, b) => (b.price || 0) - (a.price || 0));

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginated = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main style={{ padding: '2rem 4%', maxWidth: '1440px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>Shop All</h1>
      <p style={{ color: '#757575', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{products.length} products</p>

      <div className="sp-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', borderBottom: '2px solid #111', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
        {CAT_TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            style={{
              background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
              padding: '0.25rem 0', fontSize: '0.75rem', fontWeight: activeTab === tab ? 800 : 500,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              color: activeTab === tab ? '#111' : '#757575', fontFamily: 'inherit', marginBottom: '-0.75rem',
            }}
          >{tab}</button>
        ))}
        <select className="zara-sort-select" style={{ marginLeft: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {paginated.length === 0 ? (
        <div className="zara-empty-state"><div style={{ fontSize: '2.5rem', opacity: 0.3 }}>🏃</div><h3 style={{ fontWeight: 300 }}>No products found</h3></div>
      ) : (
        <div className="sp-grid">
          {paginated.map(p => (
            <div key={p.id} className="sp-product-card" onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
              <div className="sp-product-image-wrap">
                <img src={p.image || `https://placehold.co/400x480/f5f5f5/aaa?text=Product`} alt={p.name} className="sp-product-image" loading="lazy" />
                {p.badge && <span className={`sp-product-badge ${p.badge === 'NEW' ? 'sp-product-badge-new' : ''}`}>{p.badge}</span>}
                <button className="sp-product-wishlist" onClick={e => { e.stopPropagation(); state.toggleWishlist(p); }}>
                  {state.wishlist?.some(w => w.id === p.id) ? '♥' : '♡'}
                </button>
              </div>
              <div className="sp-product-info">
                {p.brand && <div className="sp-product-brand">{p.brand}</div>}
                <h3 className="sp-product-name">{p.name}</h3>
                <span className="sp-product-price">₹{p.price}</span>
                {p.originalPrice && <span className="sp-product-og-price">₹{p.originalPrice}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="zara-pagination">
          <button className="zara-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} className={`zara-page-btn ${page === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
          ))}
          <button className="zara-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>→</button>
        </div>
      )}
    </main>
  );
}
