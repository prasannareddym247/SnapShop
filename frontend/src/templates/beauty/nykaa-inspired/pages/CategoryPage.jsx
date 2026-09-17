import React, { useState } from 'react';

const TABS = ['All', 'Makeup', 'Skincare', 'Hair Care', 'Bath & Body', 'Fragrance', 'Wellness', 'Personal Care'];

function ProductCard({ product, onAddToCart, onWishlistToggle, inWishlist, onProductClick }) {
  const price = product.discountedPrice != null ? product.discountedPrice : (product.price || 0);
  const original = product.originalPrice || (product.discountedPrice != null && product.discountedPrice < (product.price || 0) ? product.price : null);
  const imgSrc = product.image || product.imageUrl || product.thumbnail;
  return (
    <div className="glam-product-card">
      <div className="glam-product-image" onClick={() => onProductClick && onProductClick(product)}>
        <img src={imgSrc} alt={product.name} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80'; }} />
        <div className="glam-product-badges">
          {original && <span className="glam-badge glam-badge-sale">Sale</span>}
        </div>
        <button className={`glam-product-wishlist ${inWishlist ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}>{inWishlist ? '♥' : '♡'}</button>
        <button className="glam-product-quickview" onClick={(e) => { e.stopPropagation(); onProductClick && onProductClick(product); }}>Quick View</button>
      </div>
      <div className="glam-product-info">
        <div className="glam-product-brand">{product.brand || ''}</div>
        <h3 className="glam-product-name">{product.name}</h3>
        <div className="glam-product-rating">{'★'.repeat(Math.floor(product.rating || 4))}{'☆'.repeat(5 - Math.floor(product.rating || 4))}<span>({(Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || product.reviewCount || 0})</span></div>
        <div className="glam-product-price">
          ₹{Number(price).toLocaleString('en-IN')}
          {original && <span className="original">₹{Number(original).toLocaleString('en-IN')}</span>}
        </div>
        <button className="glam-product-atc" onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function CategoryPage({ state }) {
  const [activeTab, setActiveTab] = useState('All');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const PRODUCTS = state.filteredProducts || [];
  let filtered = activeTab === 'All' ? PRODUCTS : PRODUCTS.filter(p => (p.category || '').toLowerCase() === activeTab.toLowerCase());
  if (sort === 'price-low') filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sort === 'price-high') filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sort === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else filtered = [...filtered].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="glam-section">
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Shop All</h1>
      <p style={{ color: 'var(--glam-text-muted)', marginBottom: '2rem' }}>{filtered.length} products</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--glam-border)', paddingBottom: '1rem' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }} style={{
            background: activeTab === tab ? 'var(--glam-primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--glam-text-muted)',
            border: '1px solid var(--glam-border)', padding: '0.5rem 1rem', borderRadius: '6px',
            fontFamily: 'var(--glam-accent-font)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}>{tab}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
          background: 'var(--glam-surface)', color: 'var(--glam-text)', border: '1px solid var(--glam-border)',
          padding: '0.5rem 1rem', borderRadius: '6px', fontFamily: 'var(--glam-accent-font)', fontSize: '0.78rem', cursor: 'pointer', outline: 'none'
        }}>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      <div className="glam-product-grid">
        {paged.map(p => (
          <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              background: page === i + 1 ? 'var(--glam-primary)' : 'transparent', color: page === i + 1 ? '#fff' : 'var(--glam-text-muted)',
              border: '1px solid var(--glam-border)', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer',
              fontFamily: 'var(--glam-accent-font)', fontWeight: 600, transition: 'all 0.2s'
            }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}