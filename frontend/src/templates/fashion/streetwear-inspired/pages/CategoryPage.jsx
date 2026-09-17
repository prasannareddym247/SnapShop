import React, { useState } from 'react';

const PRODUCTS = [
  { id: 'sw1', name: 'Oversized Hoodie', price: 89, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', colors: ['#111', '#fff', '#ff2d55', '#222'], rating: 4.5, reviews: 128, isNew: true },
  { id: 'sw2', name: 'Graphic Tee', price: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80', category: 'T-Shirts', colors: ['#fff', '#111', '#ff2d55'], rating: 4.3, reviews: 94, isNew: true },
  { id: 'sw3', name: 'Cargo Pants', price: 110, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80', category: 'Pants', colors: ['#222', '#3a3a3a', '#111'], rating: 4.6, reviews: 67, isLimited: true },
  { id: 'sw4', name: 'Bomber Jacket', price: 180, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#111', '#2a2a2a'], rating: 4.7, reviews: 42 },
  { id: 'sw5', name: 'Sneakers Pro', price: 145, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#ff2d55', '#222'], rating: 4.8, reviews: 203, isNew: true },
  { id: 'sw6', name: 'Trucker Cap', price: 35, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80', category: 'Caps', colors: ['#111', '#ff2d55', '#fff', '#222'], rating: 4.2, reviews: 56 },
  { id: 'sw7', name: 'Crossbody Bag', price: 65, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80', category: 'Bags', colors: ['#111', '#fff', '#222'], rating: 4.4, reviews: 38, isNew: true },
  { id: 'sw8', name: 'Chain Necklace', price: 55, image: 'https://images.unsplash.com/photo-1515562141589-80e5a2e3c2b4?w=400&auto=format&fit=crop&q=80', category: 'Accessories', colors: ['#c0c0c0', '#ffd700'], rating: 4.1, reviews: 29, isLimited: true },
  { id: 'sw9', name: 'Tech Fleece Hoodie', price: 120, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', colors: ['#222', '#555', '#111'], rating: 4.6, reviews: 89, isNew: true },
  { id: 'sw10', name: 'Runner Sneakers', price: 130, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#ff6b35'], rating: 4.7, reviews: 156 },
  { id: 'sw11', name: 'Denim Jacket', price: 160, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#2a4a7f', '#111'], rating: 4.5, reviews: 73, isLimited: true },
  { id: 'sw12', name: 'Slim Joggers', price: 75, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&auto=format&fit=crop&q=80', category: 'Pants', colors: ['#111', '#333', '#555'], rating: 4.3, reviews: 112 },
  { id: 'sw13', name: 'Varsity Jacket', price: 195, image: 'https://images.unsplash.com/photo-1556306535-0f09c5376f0a?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#111', '#8b0000'], rating: 4.6, reviews: 55, isLimited: true },
  { id: 'sw14', name: 'Slip-On Sneakers', price: 95, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#222'], rating: 4.4, reviews: 88 },
  { id: 'sw15', name: 'Bucket Hat', price: 30, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&auto=format&fit=crop&q=80', category: 'Caps', colors: ['#111', '#ff2d55', '#222'], rating: 4.0, reviews: 34 },
  { id: 'sw16', name: 'Backpack', price: 85, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80', category: 'Bags', colors: ['#111', '#222', '#333'], rating: 4.3, reviews: 47 },
];

const TABS = ['All', 'Hoodies', 'T-Shirts', 'Jackets', 'Sneakers', 'Pants', 'Caps', 'Bags', 'Accessories', 'Sale'];

export default function CategoryPage({ state }) {
  const [activeTab, setActiveTab] = useState('All');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const activeProducts = state.filteredProducts && state.filteredProducts.length > 0 ? state.filteredProducts : PRODUCTS;
  let filtered = activeProducts;
  if (activeTab !== 'All') {
    filtered = activeProducts.filter(p => {
      const c = p.category?.toLowerCase() || '';
      const tab = activeTab.toLowerCase();
      if (tab === 't-shirts') return c.includes('shirt') || c.includes('top');
      if (tab === 'sneakers') return c.includes('shoe') || c.includes('slipper');
      if (tab === 'jackets') return c.includes('jacket') || c.includes('outerwear') || c.includes('coat');
      if (tab === 'caps') return c.includes('glass') || c.includes('eyewear') || c.includes('sunglasses');
      if (tab === 'bags') return c.includes('bag');
      if (tab === 'accessories') return c.includes('watch') || c.includes('jewel');
      if (tab === 'hoodies') return c.includes('hoodie') || c.includes('sweatshirt') || c.includes('shirt');
      return c.includes(tab.slice(0, -1));
    });
  }
  if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="urban-section">
      <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '3rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shop All</h1>
      <p style={{ color: 'var(--sw-text-muted)', marginBottom: '2rem' }}>{filtered.length} products</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--sw-border)', paddingBottom: '1rem' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }} style={{
            background: activeTab === tab ? 'var(--sw-primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--sw-text-muted)',
            border: activeTab === tab ? 'none' : '1px solid var(--sw-border)', padding: '0.5rem 1rem',
            fontFamily: 'var(--sw-accent-font)', fontSize: '0.75rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s'
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
          background: 'var(--sw-surface)', color: 'var(--sw-text)', border: '1px solid var(--sw-border)',
          padding: '0.5rem 1rem', fontFamily: 'var(--sw-accent-font)', fontSize: '0.75rem',
          textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', outline: 'none'
        }}>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="urban-product-grid">
        {paged.map(p => (
          <div key={p.id} className="urban-product-card">
            <div className="urban-product-card-image" onClick={() => state.navigate('product', p)}>
              <img src={p.image} alt={p.name} />
              <div className="urban-product-badges">
                {p.isNew && <span className="urban-badge urban-badge-new">New Drop</span>}
                {p.isLimited && <span className="urban-badge urban-badge-limited">Limited</span>}
              </div>
              <button className={`urban-product-wishlist ${(state.wishlist || []).some(w => w.id === p.id) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); state.toggleWishlist(p); }}>
                {(state.wishlist || []).some(w => w.id === p.id) ? '♥' : '♡'}
              </button>
              <button className="urban-product-quickview" onClick={(e) => { e.stopPropagation(); state.navigate('product', p); }}>Quick View</button>
            </div>
            <div className="urban-product-card-info">
              <h3 className="urban-product-card-name">{p.name}</h3>
              <div className="urban-product-card-price">${p.price}</div>
              <div className="urban-product-card-colors">{p.colors.map((c, i) => <span key={i} className="urban-color-dot" style={{ background: c }} />)}</div>
              <div className="urban-product-card-rating">{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}<span>({p.reviews})</span></div>
              <button className="urban-product-card-atc" onClick={() => state.addToCart(p)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              background: page === i + 1 ? 'var(--sw-primary)' : 'transparent', color: page === i + 1 ? '#fff' : 'var(--sw-text-muted)',
              border: '1px solid var(--sw-border)', width: '40px', height: '40px', cursor: 'pointer',
              fontFamily: 'var(--sw-accent-font)', fontWeight: 600, transition: 'all 0.2s'
            }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
