import React from 'react';

const ALL_PRODUCTS = [
  { id: 'ps1', name: 'Gentle Foaming Cleanser', brand: 'PureGlow', price: 28, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Cleansers', rating: 4.6, reviews: 312, isNew: true },
  { id: 'ps2', name: 'Vitamin C Bright Serum', brand: 'GlowLab', price: 48, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.8, reviews: 267, isNew: true },
  { id: 'ps3', name: 'Dewy Moisture Cream', brand: 'DewDrops', price: 42, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Moisturizers', rating: 4.5, reviews: 198 },
  { id: 'ps4', name: 'Mineral Sunscreen SPF 50', brand: 'SunGuard', price: 32, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Sun Care', rating: 4.4, reviews: 156 },
  { id: 'ps5', name: 'Hydra Sheet Mask Set', brand: 'PureGlow', price: 22, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Face Masks', rating: 4.3, reviews: 89, isNew: true },
  { id: 'ps6', name: 'Nourish Eye Cream', brand: 'GlowLab', price: 36, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Eye Care', rating: 4.6, reviews: 134 },
  { id: 'ps7', name: 'Soothing Toner Mist', brand: 'DewDrops', price: 26, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Toners', rating: 4.4, reviews: 178, isNew: true },
  { id: 'ps8', name: 'Retinol Night Serum', brand: 'GlowLab', price: 58, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.7, reviews: 203 },
];

export default function SearchPage({ state }) {
  const query = (state.searchQuery || '').toLowerCase();
  const results = ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));

  return (
    <div className="pure-page" style={{ maxWidth: '900px' }}>
      <h1>Search</h1>
      <input type="text" placeholder="Search products, brands, categories..." value={state.searchQuery || ''} onChange={e => state.setSearchQuery(e.target.value)}
        style={{ width: '100%', background: 'var(--pure-surface)', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '1rem 1.25rem', fontFamily: 'var(--pure-body)', fontSize: '1rem', outline: 'none', marginBottom: '2rem', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = 'var(--pure-primary)'} onBlur={e => e.target.style.borderColor = 'var(--pure-border)'} />
      {!query ? (
        <p style={{ color: 'var(--pure-text-muted)', textAlign: 'center', padding: '3rem 0' }}>Type above to search our catalog</p>
      ) : results.length === 0 ? (
        <p style={{ color: 'var(--pure-text-muted)', textAlign: 'center', padding: '3rem 0' }}>No results found for "{query}"</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {results.map(p => (
            <div key={p.id} className="pure-product-card" style={{ cursor: 'pointer' }} onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
              <div className="pure-product-image">
                <img src={p.image} alt={p.name} />
                {p.isNew && <div className="pure-badges"><span className="pure-badge pure-badge-new">New</span></div>}
              </div>
              <div className="pure-product-info">
                <h3 className="pure-product-name">{p.name}</h3>
                <div className="pure-product-desc">{p.brand} · {p.category}</div>
                <div className="pure-product-rating">{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}<span>({p.reviews})</span></div>
                <div className="pure-product-price">${p.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
