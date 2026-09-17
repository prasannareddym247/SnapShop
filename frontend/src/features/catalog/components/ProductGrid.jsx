import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onProductClick, wishlistIds = [], onWishlistToggle, seeAllTarget, onSeeAllClick, fixedColumns }) => {
  return (
    <div className={`product-grid ${fixedColumns ? 'showcase' : ''}`}>
      {products.map((prod, i) => (
        <div key={prod.id} style={{ position: 'relative' }}>
          {seeAllTarget && i === products.length - 1 && (
            <div
              className="see-all-overlay"
              onClick={(e) => { e.stopPropagation(); onSeeAllClick(); }}
            >
              <span className="see-all-arrow">→</span>
              <span>See All {seeAllTarget}</span>
            </div>
          )}
          <ProductCard
            product={prod}
            isWishlisted={wishlistIds.includes(prod.id)}
            onWishlistToggle={onWishlistToggle}
            onClick={() => seeAllTarget && i === products.length - 1 ? onSeeAllClick() : onProductClick(prod.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
