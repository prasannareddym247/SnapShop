import React from 'react';
import ProductGrid from '../../../_shared/components/ProductGrid';

export default function SearchPage({ state }) {
  return (
    <div className="custom-page-container">
      <h2>Search Results for: "{state.searchQuery}"</h2>
      {state.filteredProducts.length === 0 ? (
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>No products found matching your search term.</p>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <ProductGrid
            products={state.filteredProducts}
            onAddToCart={state.addToCart}
            onWishlistToggle={state.toggleWishlist}
            wishlistIds={state.wishlist.map(p => p.id)}
            onProductClick={(p) => state.navigate('product', p)}
          />
        </div>
      )}
    </div>
  );
}