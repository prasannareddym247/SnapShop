import React from 'react';
import AjioProductGrid from '../components/AjioProductGrid';
import { demoProducts, demoCategories } from '../../../_shared/data/demoProducts';

export default function CategoryPage({ state }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '1.5rem', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>
        SHOP COLLECTION / {state.selectedCategory.toUpperCase()}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem' }}>
        {/* Filters */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>Filter Categories</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px', fontSize: '13px' }}>
            <li 
              style={{ cursor: 'pointer', fontWeight: state.selectedCategory === 'All' ? 'bold' : 'normal', color: state.selectedCategory === 'All' ? '#ff3f6c' : '#333' }}
              onClick={() => state.setSelectedCategory('All')}
            >
              All Products
            </li>
            {state.categories.map(cat => (
              <li 
                key={cat.id}
                style={{ cursor: 'pointer', fontWeight: state.selectedCategory === cat.name ? 'bold' : 'normal', color: state.selectedCategory === cat.name ? '#ff3f6c' : '#333' }}
                onClick={() => state.setSelectedCategory(cat.name)}
              >
                {cat.name.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>

        {/* Product Catalog */}
        <div>
          <AjioProductGrid 
            products={state.filteredProducts}
            onWishlistToggle={state.toggleWishlist}
            wishlistIds={state.wishlist.map(p => p.id)}
            onProductClick={(p) => state.navigate('product', p)}
            onAddToCart={(p) => state.addToCart(p, null, 1)}
          />
        </div>
      </div>
    </div>
  );
}
