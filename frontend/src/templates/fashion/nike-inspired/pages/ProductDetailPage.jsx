import React, { useState } from 'react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#000' }, { name: 'White', hex: '#fff' },
  { name: 'Green', hex: '#00e676' }, { name: 'Navy', hex: '#1a2744' },
];

export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct;
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  if (!product) {
    return <main style={{ padding: '4rem', textAlign: 'center' }}><p>Product not found.</p></main>;
  }

  const images = product.images?.length ? product.images : [product.image, product.hoverImage].filter(Boolean);

  const handleAddToCart = () => {
    state.addToCart({ ...product, size: selectedSize, color: selectedColor }, null, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <main>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh' }}>
        <div style={{ background: '#f5f5f5', overflowY: 'auto' }}>
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`${product.name} ${idx}`} style={{ width: '100%', display: 'block' }} loading={idx === 0 ? 'eager' : 'lazy'} />
          ))}
        </div>
        <div style={{ padding: '3rem 2.5rem', maxWidth: '480px' }}>
          <div className="sp-product-brand" style={{ fontSize: '0.65rem', marginBottom: '0.35rem' }}>{product.brand || 'SPORTS PERFORMANCE'}</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.75rem', lineHeight: 1.1, textTransform: 'uppercase' }}>{product.name}</h1>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem' }}>
            ₹{product.price}
            {product.originalPrice && <span style={{ textDecoration: 'line-through', color: '#757575', fontSize: '1rem', marginLeft: '0.75rem', fontWeight: 400 }}>₹{product.originalPrice}</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className="zara-size-label">Size</span>
            <div className="zara-sizes">
              {SIZES.map(s => (
                <button key={s} className={`zara-size-btn ${selectedSize === s ? 'selected' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className="zara-size-label">Color — {selectedColor}</span>
            <div className="zara-colors">
              {COLORS.map(c => (
                <button key={c.name} className={`zara-color-swatch ${selectedColor === c.name ? 'selected' : ''}`}
                  style={{ background: c.hex, border: c.name === 'White' ? '2px solid #ddd' : '2px solid transparent' }}
                  onClick={() => setSelectedColor(c.name)} title={c.name} />
              ))}
            </div>
          </div>

          <div className="zara-qty" style={{ marginBottom: '2rem' }}>
            <span className="zara-size-label" style={{ marginBottom: 0 }}>Qty</span>
            <button className="zara-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span className="zara-qty-value">{quantity}</span>
            <button className="zara-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>

          <button className="sp-btn" style={{ width: '100%', marginBottom: '0.75rem', textAlign: 'center', display: 'block' }} onClick={handleAddToCart}>
            {addedToCart ? '✓ Added to Bag' : 'Add to Bag'}
          </button>
          <button className="sp-btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }} onClick={() => state.toggleWishlist(product)}>
            {state.wishlist?.some(w => w.id === product.id) ? '♥ Saved' : '♡ Add to Wishlist'}
          </button>

          {addedToCart && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#111', color: '#fff', padding: '1rem 1.5rem', zIndex: 999, fontSize: '0.8rem' }}>Added to bag! <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => state.navigate('cart')}>View</span></div>}

          <div className="zara-accordion" style={{ marginTop: '2rem' }}>
            {[
              { key: 'desc', title: 'Description', content: product.description || 'Premium performance gear engineered for maximum comfort, breathability, and durability during intense workouts.' },
              { key: 'delivery', title: 'Delivery & Returns', content: 'Free shipping on orders over ₹5,000. Standard delivery 3-5 days. Free returns within 30 days.' },
              { key: 'care', title: 'Care Instructions', content: 'Machine wash cold with like colors. Do not bleach. Tumble dry low. Do not iron.' },
            ].map(s => (
              <div key={s.key} className="zara-accordion-item">
                <button className="zara-accordion-btn" onClick={() => setExpandedSection(expandedSection === s.key ? null : s.key)}>
                  {s.title} <span>{expandedSection === s.key ? '−' : '+'}</span>
                </button>
                {expandedSection === s.key && <div className="zara-accordion-content">{s.content}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
