import React from 'react';
import ProductGrid from '../../../_shared/components/ProductGrid';

export default function WishlistPage({ state }) {
  return (
    <div className="custom-page-container">
      <h2>My Wishlist</h2>
      {state.wishlist.length === 0 ? (
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Your wishlist is empty.</p>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <ProductGrid
            products={state.wishlist}
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