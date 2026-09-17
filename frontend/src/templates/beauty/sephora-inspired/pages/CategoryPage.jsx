import React, { useState } from 'react';

const TABS = ['All', 'Makeup', 'Skincare', 'Fragrance', 'Hair Care', 'Bath & Body', 'Sale'];

const ITEMS_PER_PAGE = 8;

function ProductCard({ p, state }) {
  const price = p.discountedPrice != null ? p.discountedPrice : (p.price || 0);
  const original = p.originalPrice || (p.discountedPrice != null && p.discountedPrice < (p.price || 0) ? p.price : null);
  return (
    <div key={p.id} className="bl-product-card" onClick={() => state.setSelectedProduct?.(p)}>
      <div className="bl-product-image-wrap">
        {p.badge && <span className="bl-product-badge">{p.badge}</span>}
        <img src={p.image || p.imageUrl} alt={p.name} className="bl-product-image" loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/400x480/f8f5f1/8a8a8a?text=Product'; }} />
        <button className="bl-product-wishlist" onClick={e => { e.stopPropagation(); state.toggleWishlist?.(p); }}>
          {state.wishlist?.some(w => w.id === p.id) ? '♥' : '♡'}
        </button>
      </div>
      <div className="bl-product-info">
        <div className="bl-product-brand">{p.brand || ''}</div>
        <div className="bl-product-name">{p.name}</div>
        <div className="bl-product-rating">
          {'★'.repeat(Math.floor(p.rating || 4))}{'☆'.repeat(5 - Math.floor(p.rating || 4))}
          <span>({(Array.isArray(p.reviews) ? p.reviews.length : p.reviews) || p.reviewCount || 0})</span>
        </div>
        <div>
          <span className="bl-product-price">₹{Number(price).toLocaleString('en-IN')}</span>
          {original && <span className="bl-product-price-original">₹{Number(original).toLocaleString('en-IN')}</span>}
        </div>
        <button className="bl-add-to-cart" onClick={e => { e.stopPropagation(); state.addToCart?.(p); }}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function CategoryPage({ state }) {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);

  const PRODUCTS = state.filteredProducts || [];
  let filtered = activeTab === 'All' ? [...PRODUCTS] : PRODUCTS.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const tab = activeTab.toLowerCase();
    if (tab === 'makeup') return cat.includes('beauty') || cat.includes('makeup');
    if (tab === 'skincare') return cat.includes('skin') || cat.includes('beauty');
    if (tab === 'fragrance') return cat.includes('fragrance');
    if (tab === 'hair care') return cat.includes('hair');
    if (tab === 'bath & body') return cat.includes('bath') || cat.includes('body') || cat.includes('skin');
    if (tab === 'sale') return p.discountedPrice != null && p.discountedPrice < (p.price || 0);
    return true;
  });

  if (sortBy === 'price-low') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sortBy === 'price-high') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bl-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Shop All</h1>
      <p style={{ color: '#8a8a8a', fontSize: '0.9rem', marginBottom: '2rem' }}>{filtered.length} products</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
              style={{
                padding: '0.5rem 1rem', border: 'none', borderRadius: '20px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: activeTab === tab ? 600 : 400,
                background: activeTab === tab ? '#1a1a1a' : '#f5f5f5',
                color: activeTab === tab ? '#fff' : '#1a1a1a',
                transition: 'all 0.2s',
              }}>
              {tab}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
          style={{
            padding: '0.5rem 1rem', border: '1px solid var(--bl-border)', borderRadius: '8px',
            fontFamily: 'inherit', fontSize: '0.8rem', background: '#fff', cursor: 'pointer',
            color: '#1a1a1a',
          }}>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <div className="bl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {paged.map(p => <ProductCard key={p.id} p={p} state={state} />)}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: page === i + 1 ? 'none' : '1px solid var(--bl-border)',
                background: page === i + 1 ? '#1a1a1a' : 'transparent', color: page === i + 1 ? '#fff' : '#1a1a1a',
                cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.85rem',
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}