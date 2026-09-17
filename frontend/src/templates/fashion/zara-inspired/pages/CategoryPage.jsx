import React, { useState } from 'react';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A-Z', value: 'name-asc' },
];

const ALL_FILTERS = {
  Category: ['All', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Knitwear', 'Accessories', 'Shoes'],
  Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Color: ['Black', 'White', 'Beige', 'Navy', 'Grey', 'Brown', 'Green', 'Red'],
  Price: ['Under ₹1,000', '₹1,000 - ₹3,000', '₹3,000 - ₹6,000', 'Over ₹6,000'],
  Brand: ['ZARA MODE', 'Essentials', 'Premium Line', 'Studio Collection', 'Urban'],
};

export default function CategoryPage({ state }) {
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ Category: 'All', Size: null, Color: null, Price: null, Brand: null });
  const [activeCategoryTab, setActiveCategoryTab] = useState('All');
  const itemsPerPage = 12;

  const categoryTabs = ['All', 'New In', 'Clothing', 'Shoes', 'Accessories', 'Sale'];

  let products = [...(state.filteredProducts || [])];

  if (activeCategoryTab === 'New In') {
    products = products.slice().reverse();
  } else if (activeCategoryTab === 'Sale') {
    products = products.filter(p => p.originalPrice);
  } else if (activeCategoryTab === 'Clothing') {
    products = products.filter(p => {
      const c = p.category?.toLowerCase() || '';
      return c.includes('dress') || c.includes('shirt') || c.includes('top');
    });
  } else if (activeCategoryTab === 'Shoes') {
    products = products.filter(p => p.category?.toLowerCase().includes('shoe'));
  } else if (activeCategoryTab === 'Accessories') {
    products = products.filter(p => {
      const c = p.category?.toLowerCase() || '';
      return c.includes('watch') || c.includes('bag') || c.includes('jewel') || c.includes('glass');
    });
  }

  if (sortBy === 'price-asc') products.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sortBy === 'price-desc') products.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sortBy === 'name-asc') products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleProductClick = (product) => {
    state.setSelectedProduct(product);
    state.navigate('product');
  };

  return (
    <main className="zara-template" style={{ padding: '0 4%', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ padding: '2rem 0 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, margin: 0, letterSpacing: '-0.02em' }}>Shop All</h1>
        <p style={{ color: '#757575', fontSize: '0.85rem', marginTop: '0.25rem' }}>{products.length} products</p>
      </div>

      <div className="zara-filters">
        {categoryTabs.map(tab => (
          <button
            key={tab}
            className={`zara-filter-btn ${activeCategoryTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveCategoryTab(tab); setCurrentPage(1); }}
          >
            {tab}
          </button>
        ))}
        <select className="zara-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className="zara-filter-btn"
          onClick={() => setShowFilters(!showFilters)}
          style={{ marginLeft: '0.5rem' }}
        >
          {showFilters ? 'Hide Filters ↑' : 'Show Filters ↓'}
        </button>
      </div>

      {showFilters && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1.5rem', background: '#fafafa', marginBottom: '2rem' }}>
          {Object.entries(ALL_FILTERS).map(([group, options]) => (
            <div key={group}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>{group}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {options.map(opt => (
                  <label key={opt} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: activeFilters[group] === opt ? '#000' : '#757575', fontWeight: activeFilters[group] === opt ? 600 : 400 }}>
                    <input
                      type="radio"
                      name={group}
                      checked={activeFilters[group] === opt || (group === 'Category' && opt === 'All' && !activeFilters[group])}
                      onChange={() => setActiveFilters(prev => ({ ...prev, [group]: opt === 'All' && group === 'Category' ? null : opt }))}
                      style={{ accentColor: '#000' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {paginatedProducts.length === 0 ? (
        <div className="zara-empty-state">
          <div className="zara-empty-icon">🔍</div>
          <h3 className="zara-empty-title">No products found</h3>
          <p className="zara-empty-desc">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="zara-grid">
          {paginatedProducts.map(product => (
            <div key={product.id} className="zara-product-card" onClick={() => handleProductClick(product)}>
              <div className="zara-product-image-wrap">
                <img src={product.image || `https://placehold.co/400x533/f5f5f5/aaa?text=Product`} alt={product.name} className="zara-product-image" loading="lazy" />
                {product.badge && <span className="zara-product-badge">{product.badge}</span>}
                <button
                  className="zara-wishlist-btn"
                  onClick={e => { e.stopPropagation(); state.toggleWishlist(product); }}
                >
                  {state.wishlist?.some(w => w.id === product.id) ? '♥' : '♡'}
                </button>
                <button className="zara-quick-view" onClick={e => { e.stopPropagation(); handleProductClick(product); }}>Quick View</button>
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

      {totalPages > 1 && (
        <div className="zara-pagination">
          <button
            className="zara-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`zara-page-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="zara-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            →
          </button>
        </div>
      )}
    </main>
  );
}
