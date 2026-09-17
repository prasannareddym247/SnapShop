import React, { useState } from 'react';

const ALL_PRODUCTS = [
  { id: 'mb1', name: 'Radiant Complexion Serum', brand: 'Lumière', price: 85, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.8, reviews: 234, isNew: true, isLimited: false, description: 'A transformative daily serum that illuminates the complexion. Formulated with pure vitamin C and hyaluronic acid for radiant, hydrated skin.' },
  { id: 'mb2', name: 'Velvet Matte Lip Colour', brand: 'Maison Rouge', price: 42, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.6, reviews: 186, isNew: false, isLimited: true, description: 'An iconic lip colour with a velvety matte finish. Enriched with rose wax for a comfortable, long-lasting wear.' },
];

export default function ProductDetailPage({ state }) {
  const product = state.selectedProduct || ALL_PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [activeSection, setActiveSection] = useState('desc');
  const [imgSrc, setImgSrc] = useState(product.image);
  const inWishlist = (state.wishlist || []).some(w => w.id === product.id);

  return (
    <div className="mb-page" style={{ maxWidth: '1100px' }}>
      <button onClick={() => state.navigate('category')} style={{ background: 'none', border: 'none', color: 'var(--mb-secondary)', cursor: 'pointer', fontFamily: 'var(--mb-font-body)', fontSize: '0.8rem', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', letterSpacing: '0.5px' }}>← Back to Collection</button>
      <div className="mb-two-col" style={{ alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', overflow: 'hidden', marginBottom: '1rem' }}>
            <img src={imgSrc} alt={product.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[product.image, product.hoverImage || product.image].map((url, i) => (
              <div key={i} onClick={() => setImgSrc(url)} style={{ background: 'var(--mb-bg-alt)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: imgSrc === url ? '2px solid var(--mb-secondary)' : '2px solid transparent', width: '75px', height: '95px' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-product-brand" style={{ fontSize: '0.72rem', marginBottom: '0.5rem' }}>{product.brand}</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {product.isNew && <span className="mb-badge mb-badge-new">New</span>}
            {product.isLimited && <span className="mb-badge mb-badge-limited">Limited Edition</span>}
          </div>
          <h1 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.8rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.25rem' }}>{product.name}</h1>
          <div className="mb-product-rating" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}<span>({product.reviews} reviews)</span></div>
          <div style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>${product.price}</div>
          <p style={{ color: 'var(--mb-text-muted)', lineHeight: 1.8, fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 300 }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="mb-cart-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="mb-btn-primary" onClick={() => { for (let i = 0; i < qty; i++) state.addToCart(product); }}>Add to Bag — ${(product.price * qty).toFixed(2)}</button>
            <button className="mb-btn-secondary" onClick={() => state.toggleWishlist(product)}>{inWishlist ? '♥ Saved' : '♡ Add to Wishlist'}</button>
          </div>
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--mb-border)', paddingTop: '1.5rem' }}>
            {['desc', 'ingredients', 'howtouse'].map(s => (
              <div key={s} style={{ marginBottom: '1rem' }}>
                <button onClick={() => setActiveSection(activeSection === s ? '' : s)}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 0', borderBottom: '1px solid var(--mb-border)', cursor: 'pointer', fontFamily: 'var(--mb-font-heading)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--mb-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {s === 'desc' ? 'Description' : s === 'ingredients' ? 'Ingredients' : 'How to Use'}
                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: activeSection === s ? 'rotate(180deg)' : '' }}>▾</span>
                </button>
                {activeSection === s && (
                  <div style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--mb-text-muted)', lineHeight: 1.8, fontWeight: 300 }}>
                    {s === 'desc' && product.description}
                    {s === 'ingredients' && 'Water, Ascorbic Acid (Vitamin C), Sodium Hyaluronate, Glycerin, Tocopherol (Vitamin E), Rosa Damascena Flower Extract, Citric Acid, Potassium Sorbate.'}
                    {s === 'howtouse' && 'Apply 4-5 drops to clean, dry skin each morning and evening. Gently press into face, neck, and décolletage. Follow with your preferred moisturizer and sunscreen during the day.'}
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
