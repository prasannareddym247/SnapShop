import React, { useState } from 'react';

export default function ProductDetailPage({ state }) {
  const p = state.selectedProduct || { name: 'Product', brand: 'Luxe Beauty', price: 999, image: 'https://placehold.co/600x720/f8f5f1/8a8a8a?text=Product', rating: 4.5, reviews: 123 };
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(null);

  const images = (Array.isArray(p.images) && p.images.length > 0) 
    ? p.images 
    : [p.image || p.imageUrl || 'https://placehold.co/600x720/f8f5f1/8a8a8a?text=Product'];
  const sizes = ['30ml', '50ml', '100ml'];
  const colors = ['#1a1a1a', '#c9a96e', '#f3d7da', '#ffffff', '#d32f2f'];

  return (
    <div className="bl-product-detail">
      <div>
        <div className="bl-product-gallery">
          <img src={images[activeImg]} alt={p.name} style={{ width: '100%', aspectRatio: '5/6', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/600x720/f8f5f1/8a8a8a?text=Product'; }} />
        </div>
        <div className="bl-product-gallery-thumbs">
          {images.map((img, i) => (
            <img key={i} src={img} alt="" className={`bl-product-gallery-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
          ))}
        </div>
      </div>

      <div className="bl-product-detail-info">
        <span className="bl-brand">{p.brand || 'Luxe Beauty'}</span>
        <h1>{p.name}</h1>
        <div className="bl-product-rating" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          {'★'.repeat(Math.floor(p.rating || 4.5))}{'☆'.repeat(5 - Math.floor(p.rating || 4.5))}
          <span style={{ marginLeft: '0.5rem', color: '#8a8a8a' }}>({(Array.isArray(p.reviews) ? p.reviews.length : p.reviews) || 123} reviews)</span>
        </div>
        <div className="bl-product-detail-price">
          ₹{(p.price || 999).toLocaleString()}
          {p.originalPrice && <span style={{ fontSize: '1rem', color: '#8a8a8a', textDecoration: 'line-through', marginLeft: '0.75rem', fontWeight: 400 }}>₹{p.originalPrice.toLocaleString()}</span>}
        </div>
        <p className="bl-product-detail-desc">
          A luxurious formula crafted with premium ingredients for radiant, glowing skin. Enriched with natural extracts and vitamins for visible results.
        </p>

        <div className="bl-size-selector">
          <h4>Size</h4>
          <div className="bl-size-options">
            {sizes.map(s => (
              <button key={s} className={`bl-size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="bl-color-selector">
          <h4>Shade</h4>
          <div className="bl-color-options">
            {colors.map(c => (
              <button key={c} className={`bl-color-dot ${selectedColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="bl-qty-selector">
          <button onClick={() => qty > 1 && setQty(q => q - 1)}>−</button>
          <span>{qty}</span>
          <button onClick={() => setQty(q => q + 1)}>+</button>
        </div>

        <div className="bl-detail-actions">
          <button className="bl-btn" style={{ flex: 1 }} onClick={() => { state.addToCart?.({ ...p, quantity: qty }); }}>
            Add to Bag — ₹{((p.price || 999) * qty).toLocaleString()}
          </button>
          <button className="bl-btn bl-btn-outline" onClick={() => state.toggleWishlist?.(p)}>
            {state.wishlist?.some(w => w.id === p.id) ? '♥' : '♡'}
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          {[
            { key: 'desc', label: 'Description', content: 'Premium formula crafted with the finest ingredients. Dermatologist-tested and suitable for all skin types.' },
            { key: 'delivery', label: 'Delivery & Returns', content: 'Free shipping on orders above ₹999. Standard delivery 3-5 business days. Easy returns within 15 days.' },
            { key: 'care', label: 'How to Use', content: 'Apply a small amount to clean, dry skin. Gently massage in circular motions. Use morning and evening for best results.' },
          ].map(item => (
            <div key={item.key} className="bl-accordion-item">
              <button className="bl-accordion-btn" onClick={() => setOpenAccordion(openAccordion === item.key ? null : item.key)}>
                {item.label}
                <span style={{ transform: openAccordion === item.key ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openAccordion === item.key && <div className="bl-accordion-content">{item.content}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
