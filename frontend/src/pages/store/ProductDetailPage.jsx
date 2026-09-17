import React, { useState, useEffect } from 'react';
import { useCart } from '../../app/context/CartContext';
import { useAuth } from '../../app/context/AuthContext';
import api from '../../services/api';
import { getProductImageSrc, getCategoryFallbackImage, getCategorySpecificDescription, formatPrice } from '../../features/catalog/productHelpers';

const ProductDetailPage = ({ productId }) => {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/products/${productId}`);
        setProduct(data);
        setQuantity(1);
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchDetail();
    }
  }, [productId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: 'var(--danger)' }}>
        Product not found.
      </div>
    );
  }

  const isBlocked = product.status !== 'Active';
  const isOutOfStock = 
    product.status === 'Inactive' || 
    product.availabilityStatus === 'Out of Stock' || 
    product.stock === 0 || 
    product.stock === '0' ||
    (product.variants && product.variants.length > 0 && product.variants.every(v => v.stock === 0 || v.stock === '0'));
  const isPurchaseDisabled = isOutOfStock || isBlocked;

  const bullets = product.bullets 
    ? (Array.isArray(product.bullets) ? product.bullets : product.bullets.split(';')) 
    : [
        '100% natural and clean direct source',
        'Hygienically sorted and processed',
        'Free from artificial gloss, colors, or additives',
        'Excellent nutrient content for healthy living'
      ];

  const categoryDescription = getCategorySpecificDescription(product);
  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const unitPrice = firstVariant ? firstVariant.price : 0;
  const discountPercent = product.discountPercentage || product.discount || product.vendorDiscount || 0;
  const effectivePrice = discountPercent > 0 ? Math.round(unitPrice * (1 - discountPercent / 100)) : unitPrice;
  const displayPrice = formatPrice(effectivePrice);
  const totalPrice = effectivePrice * quantity;

  return (
    <div className="detail-container animated-view">
      {isBlocked && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontWeight: 600,
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.95rem'
        }}>
          <span>⚠️</span>
          This product is currently <strong>{product.status}</strong> and is not available for purchase on the storefront.
        </div>
      )}

      <div className="detail-gallery" style={{ position: 'relative' }}>
        <img 
          src={getProductImageSrc(product)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getCategoryFallbackImage(product.category, product.id);
          }}
          alt={product.name || product.product}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
        />
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-lg)',
            zIndex: 2
          }}>
            <span style={{
              backgroundColor: 'var(--danger)',
              color: 'white',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none'
            }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="detail-info">
        <span className="detail-category">{product.category}</span>
        <h1 className="detail-name">{product.name || product.product}</h1>
        
        <div className="detail-price-box" style={{ margin: '0.5rem 0 1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.8rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1 }}>
            {displayPrice}
          </span>
          {discountPercent > 0 && (
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through', opacity: 0.6 }}>
              {formatPrice(unitPrice)}
            </span>
          )}
          {discountPercent > 0 && (
            <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, background: 'rgba(46, 184, 92, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              {discountPercent}% OFF
            </span>
          )}
          {quantity > 1 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.8 }}>
              ({formatPrice(unitPrice)} each)
            </span>
          )}
          {isOutOfStock && (
            <span className="out-of-stock-badge" style={{ marginLeft: '1rem', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600 }}>
              Out of Stock
            </span>
          )}
        </div>

        <div className="detail-specs" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Key Specifications</h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {categoryDescription}
          </p>
        </div>

        <p className="detail-desc" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {product.description}
        </p>

        {/* Product Key Points */}
        {bullets && bullets.length > 0 && (
          <ul className="detail-bullets" style={{ marginBottom: '1.5rem' }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>{b}</li>
            ))}
          </ul>
        )}

        {product.storageInstructions && (
          <div className="storage-highlight" style={{
            padding: '1rem',
            background: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem'
          }}>
            <strong>Storage Guideline:</strong> {product.storageInstructions}
          </div>
        )}

        {/* Add to Cart Actions */}
        <div className="purchase-actions">
        {(!user || user.role !== 'Seller') ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '2rem' }}>
            <div className="qty-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="qty-btn" 
                disabled={isPurchaseDisabled} 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid var(--border)',
                  background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1.2rem',
                  cursor: isPurchaseDisabled ? 'not-allowed' : 'pointer',
                  opacity: isPurchaseDisabled ? 0.5 : 1
                }}
              >
                -
              </button>
              <span className="qty-val" style={{ 
                minWidth: '50px', 
                textAlign: 'center', 
                fontSize: '1.1rem',
                fontWeight: 600
              }}>{quantity}</span>
              <button 
                className="qty-btn" 
                disabled={isPurchaseDisabled} 
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid var(--border)',
                  background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1.2rem',
                  cursor: isPurchaseDisabled ? 'not-allowed' : 'pointer',
                  opacity: isPurchaseDisabled ? 0.5 : 1
                }}
              >
                +
              </button>
            </div>
            <button 
              className="add-cart-large" 
              disabled={isPurchaseDisabled} 
              onClick={() => addToCart(product, { ...firstVariant, quantity }, quantity)}
              style={{ 
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: isPurchaseDisabled ? 'var(--border)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                cursor: isPurchaseDisabled ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                opacity: isPurchaseDisabled ? 0.6 : 1
              }}
            >
              {isBlocked
                ? 'Unavailable'
                : isOutOfStock
                  ? 'Out of Stock' 
                  : `Add to Cart • ₹${Math.round(totalPrice)}`}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 600 }}>
            ℹ️ You are viewing this page as a Seller. Purchases and cart features are disabled.
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;