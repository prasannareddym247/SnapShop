import React, { useState, useEffect } from 'react';
import { useCart } from '../../../app/context/CartContext';
import { useAuth } from '../../../app/context/AuthContext';
import { getProductImageSrc, getCategoryFallbackImage, getCategorySpecificDescription, formatPrice, transformProductPricing } from '../productHelpers';
const ProductCard = ({ product, onClick, isWishlisted, onWishlistToggle }) => {
  const { cart, addToCart } = useCart();
  const { token, user } = useAuth();
  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  
  // Transform product pricing from USD to INR with discount calculation
  const transformedProduct = transformProductPricing(product);
  const basePrice = firstVariant ? firstVariant.price : transformedProduct?.displayPrice || product.price || 'N/A';
  const discountPercent = transformedProduct?.discountPercentage || product.vendorDiscount || 0;
  const displayPrice = transformedProduct?.displayPrice || basePrice;
  const originalPrice = transformedProduct?.originalPrice || basePrice;

  const getDisplayLabel = () => {
    if (!firstVariant) return '';
    const qty = firstVariant.quantity || 1;
    return `Qty: ${qty}`;
  };
  const displayLabel = getDisplayLabel();

  const isOutOfStock = 
    product.status === 'Inactive' || 
    product.availabilityStatus === 'Out of Stock' || 
    product.stock === 0 || 
    product.stock === '0' ||
    (product.variants && product.variants.length > 0 && product.variants.every(v => v.stock === 0 || v.stock === '0'));
  const isInCart = firstVariant && cart.some(item => item.variantId === firstVariant.id);

  const handleAction = (e) => {
    e.stopPropagation();
    if (!token) {
      window.location.hash = 'auth';
      return;
    }
    if (!firstVariant || isOutOfStock) return;
    if (isInCart) {
      window.location.hash = 'cart';
    } else {
      addToCart(product, firstVariant, 1);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  // Render stars helper
  const renderStars = (rating = 4.5) => {
    const rounded = Math.round(rating);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  };

  // Get category-specific description
  const categoryDescription = getCategorySpecificDescription(product);

  return (
    <div className="product-card" onClick={onClick}>
      {/* Category Tag */}
      <span className="product-tag">{product.category}</span>

      {/* Wishlist Icon Button */}
      {(!user || (user.role !== 'Seller')) && (
        <button 
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 10,
            fontSize: '1.1rem',
            color: isWishlisted ? '#ef4444' : '#94a3b8',
            transition: 'transform 0.15s, color 0.15s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      )}

      {/* Product Image Panel */}
      <div className="product-image-container">
        <img 
          src={getProductImageSrc(product)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getCategoryFallbackImage(product.category, product.id);
          }}
          alt={product.name || product.product}
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.7rem',
            padding: '0.2rem 0.45rem',
            borderRadius: '4px',
            fontWeight: '700',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 3,
            textAlign: 'center'
          }}>
            {discountPercent}% OFF
          </span>
        )}

        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}>
            <span style={{
              backgroundColor: 'var(--danger)',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none'
            }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info & Footer */}
      <div className="product-info">
        <h3 className="product-title">
          {product.name || product.product}
        </h3>
        
        {/* Rating stars block */}
        <div className="rating-row">
          <span className="rating-stars">{renderStars(product.rating || 4.5)}</span>
          <span className="rating-value">({product.rating || '4.5'})</span>
        </div>

        <p className="product-desc-excerpt">
          {categoryDescription}
        </p>

        <div className="product-footer">
          <div className="price-box">
            <span className="price-label">Starts at ({displayLabel})</span>
            <div className="price-row">
              <span className="price-value">{formatPrice(displayPrice)}</span>
              {discountPercent > 0 && displayPrice !== originalPrice && (
                <span className="strikethrough">{formatPrice(originalPrice)}</span>
              )}
            </div>
          </div>
          
          {(!user || (user.role !== 'Seller')) && (
            <button 
              className="action-btn"
              onClick={handleAction}
              disabled={!firstVariant || isOutOfStock}
              style={{
                background: (!firstVariant || isOutOfStock) ? 'var(--border)' : (isInCart ? '#059669' : 'var(--primary)')
              }}
            >
              {!firstVariant || isOutOfStock 
                ? 'Out of Stock' 
                : isInCart 
                  ? '✓ Checkout' 
                  : 'Add 🛒'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;