import React, { useState } from 'react';

export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct || { name: 'Product', brand: '', price: 0, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80', rating: 4, reviews: 0 };
  const images = product.images || (product.image ? [product.image] : [product.imageUrl].filter(Boolean)) || ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80'];
  const price = product.discountedPrice != null ? product.discountedPrice : (product.price || 0);
  const original = product.originalPrice || (product.discountedPrice != null && product.discountedPrice < (product.price || 0) ? product.price : null);

  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="glam-section" style={{ maxWidth: '1100px' }}>
      <button onClick={() => state.navigate('category')} style={{ background: 'none', border: 'none', color: 'var(--glam-text-muted)', cursor: 'pointer', marginBottom: '2rem', fontFamily: 'var(--glam-accent-font)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>← Back to Shop</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div>
          <div style={{ background: 'var(--glam-bg)', border: '1px solid var(--glam-border)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <img src={images[selectedImg]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', padding: '1rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {images.map((img, i) => (
              <div key={i} onClick={() => setSelectedImg(i)} style={{ width: '80px', height: '80px', background: 'var(--glam-bg)', border: selectedImg === i ? '2px solid var(--glam-primary)' : '1px solid var(--glam-border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="glam-product-brand" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>{product.brand || ''}</div>
          <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2rem', color: 'var(--glam-text)', marginBottom: '0.5rem' }}>{product.name}</h1>
          <div className="glam-product-price" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            ₹{Number(price).toLocaleString('en-IN')}
            {original && <span className="original" style={{ fontSize: '1rem', textDecoration: 'line-through', marginLeft: '0.75rem', color: '#8a8a8a' }}>₹{Number(original).toLocaleString('en-IN')}</span>}
          </div>
          <div className="glam-product-rating" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{'★'.repeat(Math.floor(product.rating || 4))}{'☆'.repeat(5 - Math.floor(product.rating || 4))} <span>({(Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || product.reviewCount || 0} reviews)</span></div>
          <p style={{ color: 'var(--glam-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>{product.description || 'Premium quality product.'}</p>
          {product.availabilityStatus && (
            <p style={{ marginBottom: '1rem', fontWeight: 600, color: product.stock > 0 ? '#10b981' : '#ef4444' }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glam-cart-qty" style={{ border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.25rem' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={{ minWidth: '30px', textAlign: 'center', fontFamily: 'var(--glam-accent-font)', fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="glam-btn-primary" onClick={() => { state.addToCart({ ...product, qty }); }} style={{ flex: 1 }}>Add to Cart — ₹{Number(price * qty).toLocaleString('en-IN')}</button>
            <button className={`glam-product-wishlist ${(state.wishlist || []).some(w => w.id === product.id) ? 'active' : ''}`} style={{ position: 'relative', top: '0', right: '0', width: '48px', height: '48px', fontSize: '1.1rem' }} onClick={() => state.toggleWishlist(product)}>{(state.wishlist || []).some(w => w.id === product.id) ? '♥' : '♡'}</button>
          </div>
          {[{ title: 'Product Details', content: product.description || 'Premium quality product.' }, { title: 'Shipping & Returns', content: product.shippingInformation || 'Standard shipping applies.' }].map((section, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--glam-border)' }}>
              <button onClick={() => setExpandedSection(expandedSection === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--glam-text)', padding: '1rem 0', cursor: 'pointer', fontFamily: 'var(--glam-accent-font)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {section.title} <span style={{ color: 'var(--glam-primary)' }}>{expandedSection === i ? '−' : '+'}</span>
              </button>
              {expandedSection === i && <p style={{ color: 'var(--glam-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, paddingBottom: '1rem' }}>{section.content}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}