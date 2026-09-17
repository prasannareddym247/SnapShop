import React from 'react';
import AjioProductCard from './AjioProductCard';

export default function AjioProductGrid({
  products = [],
  onWishlistToggle,
  wishlistIds = [],
  onProductClick,
  onAddToCart
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem 1rem' }}>
      {products.map(p => (
        <AjioProductCard 
          key={p.id}
          product={p}
          onWishlistToggle={onWishlistToggle}
          isWishlisted={wishlistIds.includes(p.id)}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
