import React, { useState } from 'react';

const ALL_PRODUCTS = [
  { id: 'ps1', name: 'Gentle Foaming Cleanser', brand: 'PureGlow', price: 28, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Cleansers', rating: 4.6, reviews: 312, isNew: true, isOrganic: false },
  { id: 'ps2', name: 'Vitamin C Bright Serum', brand: 'GlowLab', price: 48, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.8, reviews: 267, isNew: true, isOrganic: false },
  { id: 'ps3', name: 'Dewy Moisture Cream', brand: 'DewDrops', price: 42, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Moisturizers', rating: 4.5, reviews: 198, isNew: false, isOrganic: true },
  { id: 'ps4', name: 'Mineral Sunscreen SPF 50', brand: 'SunGuard', price: 32, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Sun Care', rating: 4.4, reviews: 156, isNew: false, isOrganic: false },
  { id: 'ps5', name: 'Hydra Sheet Mask Set', brand: 'PureGlow', price: 22, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', category: 'Face Masks', rating: 4.3, reviews: 89, isNew: true, isOrganic: true },
  { id: 'ps6', name: 'Nourish Eye Cream', brand: 'GlowLab', price: 36, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Eye Care', rating: 4.6, reviews: 134, isNew: false, isOrganic: false },
  { id: 'ps7', name: 'Soothing Toner Mist', brand: 'DewDrops', price: 26, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Toners', rating: 4.4, reviews: 178, isNew: true, isOrganic: true },
  { id: 'ps8', name: 'Retinol Night Serum', brand: 'GlowLab', price: 58, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.7, reviews: 203, isNew: false, isOrganic: false },
  { id: 'ps9', name: 'Calm Chamomile Cleanser', brand: 'PureGlow', price: 30, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Cleansers', rating: 4.5, reviews: 145, isNew: false, isOrganic: true },
  { id: 'ps10', name: 'Hyaluronic Acid Serum', brand: 'GlowLab', price: 52, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.9, reviews: 321, isNew: true, isOrganic: false },
  { id: 'ps11', name: 'Green Tea Moisturizer', brand: 'DewDrops', price: 38, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Moisturizers', rating: 4.4, reviews: 112, isNew: false, isOrganic: true },
  { id: 'ps12', name: 'Lip Sleeping Mask', brand: 'PureGlow', price: 18, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Lip Care', rating: 4.3, reviews: 76, isNew: true, isOrganic: false },
  { id: 'ps13', name: 'Exfoliating Scrub', brand: 'SunGuard', price: 24, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', category: 'Cleansers', rating: 4.2, reviews: 98, isNew: false, isOrganic: false },
  { id: 'ps14', name: 'Night Repair Cream', brand: 'GlowLab', price: 64, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Moisturizers', rating: 4.7, reviews: 189, isNew: false, isOrganic: false },
  { id: 'ps15', name: 'Vitamin E Face Oil', brand: 'PureGlow', price: 34, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Serums', rating: 4.5, reviews: 134, isNew: false, isOrganic: true },
  { id: 'ps16', name: 'Soothing Face Mist', brand: 'DewDrops', price: 20, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Toners', rating: 4.1, reviews: 67, isNew: true, isOrganic: true },
];

const TABS = ['All', 'Cleansers', 'Serums', 'Moisturizers', 'Sun Care', 'Face Masks', 'Toners', 'Eye Care', 'Lip Care'];

function ProductCard({ product, state }) {
  const [imgSrc, setImgSrc] = React.useState(product.image);
  const inWishlist = (state.wishlist || []).some(w => w.id === product.id);
  return (
    <div className="pure-product-card">
      <div className="pure-product-image" onClick={() => { state.setSelectedProduct(product); state.navigate('product'); }}>
        <img src={imgSrc} alt={product.name} onMouseEnter={() => product.hoverImage && setImgSrc(product.hoverImage)} onMouseLeave={() => setImgSrc(product.image)} />
        <div className="pure-badges">
          {product.isNew && <span className="pure-badge pure-badge-new">New</span>}
          {product.isOrganic && <span className="pure-badge pure-badge-organic">Organic</span>}
        </div>
        <button className={`pure-wishlist ${inWishlist ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); state.toggleWishlist(product); }}>{inWishlist ? '♥' : '♡'}</button>
        <button className="pure-quickview" onClick={(e) => { e.stopPropagation(); state.setSelectedProduct(product); state.navigate('product'); }}>Quick View</button>
      </div>
      <div className="pure-product-info">
        <h3 className="pure-product-name">{product.name}</h3>
        <div className="pure-product-desc">{product.brand}</div>
        <div className="pure-product-rating">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}<span>({product.reviews})</span></div>
        <div className="pure-product-price">${product.price}</div>
        <button className="pure-product-atc" onClick={() => state.addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function CategoryPage({ state }) {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  let filtered = activeTab === 'All' ? [...ALL_PRODUCTS] : ALL_PRODUCTS.filter(p => p.category === activeTab);
  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'newest') filtered.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="pure-page" style={{ maxWidth: '1200px' }}>
      <h1>Shop All Categories</h1>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--pure-border)', paddingBottom: '0.75rem' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            style={{ background: activeTab === tab ? 'var(--pure-primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--pure-text-muted)', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontFamily: 'var(--pure-heading)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeTab === tab ? 500 : 400 }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--pure-text-muted)' }}>{filtered.length} products</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ background: 'var(--pure-surface)', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontFamily: 'var(--pure-body)', fontSize: '0.82rem', color: 'var(--pure-text)', outline: 'none' }}>
          <option value="default">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      <div className="pure-product-grid">
        {paged.map(p => <ProductCard key={p.id} product={p} state={state} />)}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              style={{ background: currentPage === p ? 'var(--pure-primary)' : 'var(--pure-surface)', color: currentPage === p ? '#fff' : 'var(--pure-text)', border: '1px solid var(--pure-border)', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--pure-body)', fontSize: '0.82rem', transition: 'all 0.2s' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
