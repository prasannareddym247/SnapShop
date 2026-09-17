import React, { useState } from 'react';

const PRODUCTS = {
  sw1: { id: 'sw1', name: 'Oversized Hoodie', price: 89, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1578768079052-aa76e54e22f1?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'], category: 'Hoodies', colors: ['Black', 'White', 'Red', 'Charcoal'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.5, reviews: 128, desc: 'Premium oversized hoodie crafted from heavyweight cotton fleece. Features dropped shoulders, ribbed cuffs, and a kangaroo pocket. The essential layer for urban style.' },
  sw5: { id: 'sw5', name: 'Sneakers Pro', price: 145, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80', images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80'], category: 'Sneakers', colors: ['White/Black', 'Triple Black', 'Red/White'], sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'], rating: 4.8, reviews: 203, desc: 'Performance-driven sneakers with responsive cushioning, breathable mesh upper, and a rubber outsole for maximum traction. Designed for the streets.' },
};

const FALLBACK = { id: 'sw1', name: 'Oversized Hoodie', price: 89, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80'], category: 'Hoodies', colors: ['Black', 'White'], sizes: ['S', 'M', 'L', 'XL'], rating: 4.5, reviews: 128, desc: 'Premium streetwear essential.' };

export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct || FALLBACK;
  const details = { ...FALLBACK, ...(PRODUCTS[product.id] || product), images: (PRODUCTS[product.id] || product).images || [product.image || FALLBACK.image] };
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(details.sizes?.[1] || 'M');
  const [selectedColor, setSelectedColor] = useState(details.colors?.[0] || 'Black');
  const [qty, setQty] = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="urban-section" style={{ maxWidth: '1100px' }}>
      <button onClick={() => state.navigate('category')} style={{ background: 'none', border: 'none', color: 'var(--sw-text-muted)', cursor: 'pointer', marginBottom: '2rem', fontFamily: 'var(--sw-accent-font)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>← Back to Shop</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div>
          <div style={{ background: 'var(--sw-bg-alt)', border: '1px solid var(--sw-border)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <img src={details.images[selectedImg]} alt={details.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {details.images.map((img, i) => (
              <div key={i} onClick={() => setSelectedImg(i)} style={{ width: '80px', height: '80px', background: 'var(--sw-bg-alt)', border: selectedImg === i ? '2px solid var(--sw-primary)' : '1px solid var(--sw-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {details.isNew && <span className="urban-badge urban-badge-new">New Drop</span>}
            {details.isLimited && <span className="urban-badge urban-badge-limited">Limited Edition</span>}
          </div>
          <h1 style={{ fontFamily: 'var(--sw-heading)', fontSize: '3rem', letterSpacing: '2px', color: 'var(--sw-text)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{details.name}</h1>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sw-primary)', fontFamily: 'var(--sw-accent-font)', marginBottom: '1rem' }}>${details.price}</div>
          <div className="urban-product-card-rating" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>{'★'.repeat(Math.floor(details.rating))}{'☆'.repeat(5 - Math.floor(details.rating))} <span style={{ marginLeft: '0.25rem' }}>({details.reviews} reviews)</span></div>
          <p style={{ color: 'var(--sw-text-muted)', lineHeight: 1.7, marginBottom: '2rem', fontWeight: 300 }}>{details.desc}</p>
          {details.colors && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--sw-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'var(--sw-accent-font)', fontWeight: 600 }}>Color: {selectedColor}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {details.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} style={{
                    background: 'var(--sw-surface)', color: 'var(--sw-text)', border: selectedColor === c ? '2px solid var(--sw-primary)' : '1px solid var(--sw-border)',
                    padding: '0.4rem 1rem', fontFamily: 'var(--sw-accent-font)', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s'
                  }}>{c}</button>
                ))}
              </div>
            </div>
          )}
          {details.sizes && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--sw-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'var(--sw-accent-font)', fontWeight: 600 }}>Size: {selectedSize}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {details.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{
                    background: selectedSize === s ? 'var(--sw-primary)' : 'var(--sw-surface)', color: selectedSize === s ? '#fff' : 'var(--sw-text)',
                    border: '1px solid var(--sw-border)', padding: '0.5rem 1.2rem', fontFamily: 'var(--sw-accent-font)', fontSize: '0.75rem',
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="urban-cart-qty" style={{ border: '1px solid var(--sw-border)' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={{ minWidth: '30px', textAlign: 'center', fontFamily: 'var(--sw-accent-font)', fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="urban-btn-primary" onClick={() => { state.addToCart({ ...details, qty }); }} style={{ flex: 1 }}>Add to Cart — ${(details.price * qty).toFixed(2)}</button>
            <button className={`urban-product-wishlist ${(state.wishlist || []).some(w => w.id === details.id) ? 'active' : ''}`} style={{ position: 'relative', top: '0', right: '0', width: '48px', height: '48px', fontSize: '1.2rem' }} onClick={() => state.toggleWishlist(details)}>
              {(state.wishlist || []).some(w => w.id === details.id) ? '♥' : '♡'}
            </button>
          </div>
          {[{ title: 'Product Details', content: 'Heavyweight cotton fleece. Dropped shoulders. Ribbed cuffs and hem. Kangaroo pocket. Relaxed fit.' }, { title: 'Shipping & Returns', content: 'Free shipping on orders over $100. Standard delivery 3-5 business days. Easy 30-day returns.' }, { title: 'Size & Fit', content: 'Relaxed oversized fit. Model is 6\'0" wearing size L. For a closer fit, size down.' }].map((section, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--sw-border)' }}>
              <button onClick={() => setExpandedSection(expandedSection === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--sw-text)', padding: '1rem 0', cursor: 'pointer', fontFamily: 'var(--sw-accent-font)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {section.title} <span>{expandedSection === i ? '−' : '+'}</span>
              </button>
              {expandedSection === i && <p style={{ color: 'var(--sw-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, paddingBottom: '1rem', fontWeight: 300 }}>{section.content}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
