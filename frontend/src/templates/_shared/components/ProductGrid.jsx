import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products = [],
  onAddToCart,
  onWishlistToggle,
  wishlistIds = [],
  onProductClick,
  variant = 'grid',
}) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.5rem',
  };

  return (
    <div style={gridStyle}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onWishlistToggle={onWishlistToggle}
          isWishlisted={wishlistIds.includes(product.id)}
          onProductClick={onProductClick}
          variant={variant}
        />
      ))}
    </div>
  );
}
