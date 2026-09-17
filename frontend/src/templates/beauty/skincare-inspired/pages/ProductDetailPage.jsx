import React, { useState } from 'react';

const ALL_PRODUCTS = [
  { id: 'ps1', name: 'Gentle Foaming Cleanser', brand: 'PureGlow', price: 28, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Cleansers', rating: 4.6, reviews: 312, isNew: true, isOrganic: false, description: 'A gentle, sulfate-free foaming cleanser that removes impurities without stripping your skin\'s natural moisture barrier. Enriched with aloe vera and chamomile extract.' },
  { id: 'ps2', name: 'Vitamin C Bright Serum', brand: 'GlowLab', price: 48, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.8, reviews: 267, isNew: true, isOrganic: false, description: 'A potent vitamin C serum that brightens skin tone, reduces dark spots, and protects against environmental damage. Formulated with 15% pure L-Ascorbic Acid.' },
];

export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct || ALL_PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [activeSection, setActiveSection] = useState('desc');
  const [imgSrc, setImgSrc] = useState(product.image);
  const inWishlist = (state.wishlist || []).some(w => w.id === product.id);

  return (
    <div className="pure-page" style={{ maxWidth: '1100px' }}>
      <button onClick={() => state.navigate('category')} style={{ background: 'none', border: 'none', color: 'var(--pure-primary)', cursor: 'pointer', fontFamily: 'var(--pure-body)', fontSize: '0.85rem', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>← Back to Shop</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
            <img src={imgSrc} alt={product.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[product.image, product.hoverImage || product.image].map((url, i) => (
              <div key={i} onClick={() => setImgSrc(url)} style={{ background: 'var(--pure-bg-alt)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: imgSrc === url ? '2px solid var(--pure-primary)' : '2px solid transparent', width: '70px', height: '90px' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {product.isNew && <span className="pure-badge pure-badge-new">New</span>}
            {product.isOrganic && <span className="pure-badge pure-badge-organic">Organic</span>}
          </div>
          <h1 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.8rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.25rem' }}>{product.name}</h1>
          <div style={{ color: 'var(--pure-text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{product.brand}</div>
          <div className="pure-product-rating" style={{ marginBottom: '1rem' }}>{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}<span>({product.reviews} reviews)</span></div>
          <div style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>${product.price}</div>
          <p style={{ color: 'var(--pure-text-muted)', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="pure-cart-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="pure-btn-primary" onClick={() => { for (let i = 0; i < qty; i++) state.addToCart(product); }}>Add to Cart — ${(product.price * qty).toFixed(2)}</button>
            <button className="pure-btn-secondary" onClick={() => state.toggleWishlist(product)}>{inWishlist ? '♥ Saved' : '♡ Add to Wishlist'}</button>
          </div>
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--pure-border)', paddingTop: '1.5rem' }}>
            {['desc', 'ingredients', 'howtouse'].map(s => (
              <div key={s} style={{ marginBottom: '1rem' }}>
                <button onClick={() => setActiveSection(activeSection === s ? '' : s)} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 0', borderBottom: '1px solid var(--pure-border)', cursor: 'pointer', fontFamily: 'var(--pure-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--pure-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {s === 'desc' ? 'Description' : s === 'ingredients' ? 'Ingredients' : 'How to Use'}
                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: activeSection === s ? 'rotate(180deg)' : '' }}>▾</span>
                </button>
                {activeSection === s && (
                  <div style={{ padding: '1rem 0', fontSize: '0.88rem', color: 'var(--pure-text-muted)', lineHeight: 1.7 }}>
                    {s === 'desc' && product.description}
                    {s === 'ingredients' && 'Water, Aloe Barbadensis Leaf Juice, Glycerin, Ascorbic Acid (Vitamin C), Tocopherol (Vitamin E), Hyaluronic Acid, Chamomilla Recutita Flower Extract, Citric Acid, Potassium Sorbate.'}
                    {s === 'howtouse' && 'Apply 3-4 drops to clean, dry skin morning and evening. Gently pat into face and neck. Follow with moisturizer and SPF during the day.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
