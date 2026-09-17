import React, { useState } from 'react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Beige', hex: '#f5f0e8' },
  { name: 'Navy', hex: '#1a2744' },
  { name: 'Grey', hex: '#8c8c8c' },
];

export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct;
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) {
    return (
      <main className="zara-template">
        <div className="zara-empty-state">
          <div className="zara-empty-icon">📦</div>
          <h3 className="zara-empty-title">Product not found</h3>
          <p className="zara-empty-desc">The product you're looking for is not available.</p>
          <button className="zara-btn zara-btn-dark" onClick={() => state.navigate('category')}>Continue Shopping</button>
        </div>
      </main>
    );
  }

  const images = product.images?.length ? product.images : [product.image, product.hoverImage, product.image, product.image].filter(Boolean);

  const handleAddToCart = () => {
    state.addToCart({ ...product, size: selectedSize, color: selectedColor }, null, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="zara-template">
      <div className="zara-product-detail">
        <div className="zara-gallery">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="zoom-container"
              onMouseMove={(e) => {
                const lens = e.currentTarget.querySelector('.zoom-lens');
                if (!lens) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const pctX = (x / rect.width) * 100;
                const pctY = (y / rect.height) * 100;
                lens.style.left = `calc(${pctX}% - 75px)`;
                lens.style.top = `calc(${pctY}% - 75px)`;
                lens.style.backgroundImage = `url(${img})`;
                lens.style.backgroundSize = '250%';
                lens.style.backgroundPosition = `${pctX}% ${pctY}%`;
              }}
            >
              <img
                src={img}
                alt={`${product.name} - Image ${idx + 1}`}
                className="zara-gallery-image"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              <div className="zoom-lens" style={{ display: idx === activeImageIndex ? 'block' : 'none' }} />
            </div>
          ))}
        </div>

        <div className="zara-detail-info">
          {product.brand && <div className="zara-detail-brand">{product.brand}</div>}
          <h1 className="zara-detail-title">{product.name}</h1>
          <div className="zara-detail-price">
            ₹{product.price}
            {product.originalPrice && (
              <span style={{ textDecoration: 'line-through', color: '#757575', fontSize: '0.95rem', marginLeft: '0.75rem', fontWeight: 400 }}>
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <span className="zara-size-label">Size</span>
            <div className="zara-sizes">
              {SIZES.map(s => (
                <button
                  key={s}
                  className={`zara-size-btn ${selectedSize === s ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <span className="zara-color-label">Color — {selectedColor}</span>
            <div className="zara-colors">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  className={`zara-color-swatch ${selectedColor === c.name ? 'selected' : ''}`}
                  style={{ background: c.hex, border: c.name === 'White' ? '2px solid #ddd' : '2px solid transparent' }}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="zara-qty">
            <span className="zara-size-label" style={{ marginBottom: 0 }}>Qty</span>
            <button className="zara-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span className="zara-qty-value">{quantity}</span>
            <button className="zara-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>

          <button className="zara-add-to-cart" onClick={handleAddToCart}>
            {addedToCart ? '✓ Added to Bag' : 'Add to Bag'}
          </button>
          <button className="zara-wishlist-add" onClick={() => state.toggleWishlist(product)}>
            {state.wishlist?.some(w => w.id === product.id) ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
          </button>

          <div className="zara-accordion">
            <div className="zara-accordion-item">
              <button className="zara-accordion-btn" onClick={() => toggleSection('desc')}>
                Description
                <span>{expandedSections.desc ? '−' : '+'}</span>
              </button>
              {expandedSections.desc && (
                <div className="zara-accordion-content">
                  <p>{product.description || 'Crafted from premium materials, this piece embodies minimalist sophistication. Designed for versatility and enduring style.'}</p>
                  {product.specifications && <p style={{ marginTop: '0.75rem' }}>{product.specifications}</p>}
                </div>
              )}
            </div>
            <div className="zara-accordion-item">
              <button className="zara-accordion-btn" onClick={() => toggleSection('delivery')}>
                Delivery & Returns
                <span>{expandedSections.delivery ? '−' : '+'}</span>
              </button>
              {expandedSections.delivery && (
                <div className="zara-accordion-content">
                  <p>Free standard shipping on orders over ₹5,000. Standard delivery: 3-5 business days. Express delivery: 1-2 business days (₹499).</p>
                  <p style={{ marginTop: '0.75rem' }}>Free returns within 30 days of delivery. Items must be unworn with tags attached.</p>
                </div>
              )}
            </div>
            <div className="zara-accordion-item">
              <button className="zara-accordion-btn" onClick={() => toggleSection('care')}>
                Care & Composition
                <span>{expandedSections.care ? '−' : '+'}</span>
              </button>
              {expandedSections.care && (
                <div className="zara-accordion-content">
                  <p>100% Premium Cotton. Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on medium heat.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {addedToCart && (
        <div className="zara-toast">
          Added to your bag! <span style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.5rem' }} onClick={() => state.navigate('cart')}>View Bag →</span>
        </div>
      )}
    </main>
  );
}
