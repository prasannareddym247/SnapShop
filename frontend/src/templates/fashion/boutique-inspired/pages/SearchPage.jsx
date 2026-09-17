import React from 'react';

const ALL_PRODUCTS = [
  { id: 'mb1', name: 'Radiant Complexion Serum', brand: 'Lumière', price: 85, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.8, reviews: 234, isNew: true },
  { id: 'mb2', name: 'Velvet Matte Lip Colour', brand: 'Maison Rouge', price: 42, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.6, reviews: 186 },
  { id: 'mb3', name: 'Nourishing Crème Luxe', brand: 'Éclat', price: 120, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.9, reviews: 312, isNew: true },
  { id: 'mb4', name: 'Eau de Parfum Classique', brand: 'Parfumerie Noire', price: 165, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80', category: 'Fragrance', rating: 4.7, reviews: 147 },
  { id: 'mb5', name: 'Silk Repair Hair Elixir', brand: 'Tresse Luxe', price: 68, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80', category: 'Hair Care', rating: 4.4, reviews: 89, isNew: true },
  { id: 'mb6', name: 'Golden Glow Face Palette', brand: 'Lumière', price: 78, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.5, reviews: 65, isNew: true },
  { id: 'mb7', name: 'Crème Corporelle Essentielle', brand: 'Éclat', price: 95, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Body Care', rating: 4.5, reviews: 134 },
  { id: 'mb8', name: 'Volumizing Lash Mascara', brand: 'Maison Rouge', price: 36, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.3, reviews: 178, isNew: true },
  { id: 'mb9', name: 'Sérum à la Rose', brand: 'Fleur d\'Or', price: 110, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.7, reviews: 203 },
  { id: 'mb10', name: 'Candle Parfumée', brand: 'Maison de Beaute', price: 58, image: 'https://images.unsplash.com/photo-1602874801007-bd36a3e1e56e?w=400&auto=format&fit=crop&q=80', category: 'Home Fragrance', rating: 4.6, reviews: 98, isNew: true },
];

export default function SearchPage({ state }) {
  const query = (state.searchQuery || '').toLowerCase();
  const results = ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));

  return (
    <div className="mb-page" style={{ maxWidth: '900px' }}>
      <h1>Search</h1>
      <input type="text" placeholder="Search our luxury collection..." value={state.searchQuery || ''} onChange={e => state.setSearchQuery(e.target.value)}
        style={{ width: '100%', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '1rem 1.25rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.95rem', outline: 'none', marginBottom: '2rem', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = 'var(--mb-secondary)'} onBlur={e => e.target.style.borderColor = 'var(--mb-border)'} />
      {!query ? (
        <p style={{ color: 'var(--mb-text-muted)', textAlign: 'center', padding: '3rem 0', fontWeight: 300 }}>Type above to explore our beauty collection</p>
      ) : results.length === 0 ? (
        <p style={{ color: 'var(--mb-text-muted)', textAlign: 'center', padding: '3rem 0', fontWeight: 300 }}>No results found for "{query}"</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {results.map(p => (
            <div key={p.id} className="mb-product-card" onClick={() => { state.setSelectedProduct(p); state.navigate('product'); }}>
              <div className="mb-product-image">
                <img src={p.image} alt={p.name} />
                {p.isNew && <div className="mb-badges"><span className="mb-badge mb-badge-new">New</span></div>}
              </div>
              <div className="mb-product-info">
                <div className="mb-product-brand">{p.brand}</div>
                <h3 className="mb-product-name">{p.name}</h3>
                <div className="mb-product-rating">{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}<span>({p.reviews})</span></div>
                <div className="mb-product-price">${p.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
