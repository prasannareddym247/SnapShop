import React from 'react';
import ProductGrid from '../../../_shared/components/ProductGrid';

export default function CategoryPage({ state }) {
  return (
    <div className="custom-page-container" style={{ maxWidth: '1200px' }}>
      <h2>Shop Catalog</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div>
          <h3>Categories</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li
              style={{ padding: '0.5rem', cursor: 'pointer', fontWeight: state.selectedCategory === 'All' ? 'bold' : 'normal', color: state.selectedCategory === 'All' ? 'var(--primary-color)' : 'inherit' }}
              onClick={() => state.setSelectedCategory('All')}
            >
              All Products
            </li>
            {(state.categories || []).map(cat => (
              <li
                key={cat.id}
                style={{ padding: '0.5rem', cursor: 'pointer', fontWeight: state.selectedCategory === cat.name ? 'bold' : 'normal', color: state.selectedCategory === cat.name ? 'var(--primary-color)' : 'inherit' }}
                onClick={() => state.setSelectedCategory(cat.name)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <ProductGrid
            products={state.filteredProducts}
            onAddToCart={state.addToCart}
            onWishlistToggle={state.toggleWishlist}
            wishlistIds={state.wishlist.map(p => p.id)}
            onProductClick={(p) => state.navigate('product', p)}
          />
        </div>
      </div>
    </div>
  );
}