import React from 'react';
import { useTheme } from '../utils/ThemeEngine';

export default function ProductCard({
  product = {},
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  onProductClick,
  variant = 'grid',
}) {
  const { palette, config, typography } = useTheme();

  const cardStyle = {
    background: palette.surface || '#fff',
    borderRadius: config?.borderRadius?.lg || '0.75rem',
    overflow: 'hidden',
    border: `1px solid ${palette.border || '#e2e8f0'}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    position: 'relative',
  };

  const imgContainerStyle = {
    position: 'relative',
    width: '100%',
    paddingTop: variant === 'list' ? '0' : '100%',
    background: palette.bgAlt || '#f8fafc',
    overflow: 'hidden',
  };

  const imgStyle = {
    position: variant === 'list' ? 'relative' : 'absolute',
    top: 0,
    left: 0,
    width: variant === 'list' ? '140px' : '100%',
    height: variant === 'list' ? '140px' : '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    padding: '0.2rem 0.6rem',
    background: palette.error || '#ef4444',
    color: '#fff',
    borderRadius: config?.borderRadius?.sm || '0.375rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    zIndex: 2,
  };

  const heartStyle = {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: palette.surface || '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 2,
    transition: 'transform 0.2s',
  };

  const nameStyle = {
    fontSize: '0.9rem',
    fontWeight: 600,
    fontFamily: typography.bodyFont || 'inherit',
    color: palette.text || '#0f172a',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const priceStyle = {
    fontSize: '1rem',
    fontWeight: 700,
    color: palette.primary || '#2563eb',
    fontFamily: typography.bodyFont || 'inherit',
  };

  const originalPriceStyle = {
    fontSize: '0.8rem',
    color: palette.textMuted || '#64748b',
    textDecoration: 'line-through',
    marginLeft: '0.5rem',
  };

  const btnStyle = {
    width: '100%',
    padding: '0.6rem',
    background: palette.primary || '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: config?.borderRadius?.md || '0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginTop: '0.75rem',
    transition: 'opacity 0.2s',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => onProductClick?.(product)}
    >
      <div style={imgContainerStyle}>
        {product.badge && <span style={badgeStyle}>{product.badge}</span>}
        <img
          src={product.image || product.imageUrl || `https://placehold.co/400x400/f1f5f9/94a3b8?text=${encodeURIComponent(product.name || 'Product')}`}
          alt={product.name || 'Product'}
          style={imgStyle}
          loading="lazy"
        />
        <button
          style={heartStyle}
          onClick={e => { e.stopPropagation(); onWishlistToggle?.(product); }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div style={{ padding: '0.75rem' }}>
        {product.brand && (
          <div style={{
            fontSize: '0.7rem',
            color: palette.textMuted || '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
            marginBottom: '0.25rem',
          }}>
            {product.brand}
          </div>
        )}
        <div style={nameStyle}>{product.name || 'Product Name'}</div>
        {product.rating && (
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.25rem' }}>
            {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            <span style={{ color: palette.textMuted || '#64748b', marginLeft: '0.25rem' }}>
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={priceStyle}>₹{product.price || '999'}</span>
          {product.originalPrice && <span style={originalPriceStyle}>₹{product.originalPrice}</span>}
        </div>
        <button
          style={btnStyle}
          onClick={e => { e.stopPropagation(); onAddToCart?.(product); }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
