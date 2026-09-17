import React from 'react';
export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct;
  if (!product) return <div className="custom-page-container"><p>Product details not loaded.</p></div>;

  return (
    <div className="custom-page-container">
      <span style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => state.navigate('category')}>← Back to Catalog</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
        <div>
          <img src={product.image || 'https://placehold.co/400x400'} alt={product.name} style={{ width: '100%', borderRadius: '1.25rem', border: '1px solid var(--border-color)' }} />
        </div>
        <div>
          <h2>{product.name}</h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{product.price}</p>
          {product.originalPrice && <p style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{product.originalPrice}</p>}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />
          <p><strong>Brand:</strong> {product.brand || 'Premium Brand'}</p>
          <p><strong>Description:</strong> Curated high-performance items. Safe packaging and prompt shipping.</p>
          <button className="custom-btn" style={{ marginTop: '2rem', width: '100%', padding: '0.75rem' }} onClick={() => state.addToCart(product)}>Add to Cart 🛍️</button>
        </div>
      </div>
    </div>
  );
}