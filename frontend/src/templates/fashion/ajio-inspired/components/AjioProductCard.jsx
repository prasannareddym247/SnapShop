import React from 'react';

export default function AjioProductCard({
  product = {},
  onWishlistToggle,
  isWishlisted = false,
  onProductClick,
  onAddToCart
}) {
  const stock = product.stock != null ? parseInt(product.stock) : 
    (product.variants && product.variants[0] ? parseInt(product.variants[0].stock) : 10);
  const isOutOfStock = stock === 0 || product.status === 'Inactive';

  return (
    <div 
      className="ajio-pcard" 
      style={{ display: 'flex', flexDirection: 'column', transition: 'all 0.2s', position: 'relative' }}
    >
      {/* Product Image */}
      <div 
        style={{ position: 'relative', width: '100%', paddingBottom: '133%', overflow: 'hidden', background: '#f8f8f8', cursor: 'pointer' }}
        onClick={() => onProductClick?.(product)}
      >
        <img 
          src={product.image || product.imageUrl || 'https://placehold.co/400x533'} 
          alt={product.name} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {isOutOfStock && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', background: '#ef4444', padding: '4px 12px', borderRadius: '2px' }}>OUT OF STOCK</span>
          </div>
        )}
        {/* Wishlist Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); onWishlistToggle?.(product); }}
          style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info Container */}
      <div style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#b8923a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
          {product.brand}
        </div>
        <div style={{ fontSize: '13px', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '5px' }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111' }}>₹{product.price}</span>
          {product.originalPrice && (
            <>
              <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#888' }}>₹{product.originalPrice}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff7043' }}>({product.badge || 'OFF'})</span>
            </>
          )}
        </div>
      </div>

      {/* Add to Bag Button */}
      <div style={{ padding: '0 0.25rem 0.5rem' }}>
        {isOutOfStock ? (
          <div style={{ width: '100%', padding: '8px 0', background: '#e2e8f0', color: '#64748b', border: 'none', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.5px', borderRadius: '2px', cursor: 'not-allowed' }}>
            OUT OF STOCK
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
            style={{ width: '100%', padding: '8px 0', background: '#2c3e50', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.5px', borderRadius: '2px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ff3f6c'}
            onMouseLeave={e => e.currentTarget.style.background = '#2c3e50'}
          >
            ADD TO BAG 👜
          </button>
        )}
      </div>
    </div>
  );
}
