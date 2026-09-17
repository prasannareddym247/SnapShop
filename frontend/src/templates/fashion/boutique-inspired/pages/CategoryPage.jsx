import React, { useState } from 'react';

const ALL_PRODUCTS = [
  { id: 'mb1', name: 'Radiant Complexion Serum', brand: 'Lumière', price: 85, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.8, reviews: 234, isNew: true, isLimited: false },
  { id: 'mb2', name: 'Velvet Matte Lip Colour', brand: 'Maison Rouge', price: 42, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.6, reviews: 186, isNew: false, isLimited: true },
  { id: 'mb3', name: 'Nourishing Crème Luxe', brand: 'Éclat', price: 120, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.9, reviews: 312, isNew: true, isLimited: false },
  { id: 'mb4', name: 'Eau de Parfum Classique', brand: 'Parfumerie Noire', price: 165, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=400&auto=format&fit=crop&q=80', category: 'Fragrance', rating: 4.7, reviews: 147, isNew: false, isLimited: true },
  { id: 'mb5', name: 'Silk Repair Hair Elixir', brand: 'Tresse Luxe', price: 68, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80', category: 'Hair Care', rating: 4.4, reviews: 89, isNew: true, isLimited: false },
  { id: 'mb6', name: 'Golden Glow Face Palette', brand: 'Lumière', price: 78, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.5, reviews: 65, isNew: true, isLimited: true },
  { id: 'mb7', name: 'Crème Corporelle Essentielle', brand: 'Éclat', price: 95, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Body Care', rating: 4.5, reviews: 134, isNew: false, isLimited: false },
  { id: 'mb8', name: 'Volumizing Lash Mascara', brand: 'Maison Rouge', price: 36, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1583241800690-5f38f44d3a95?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.3, reviews: 178, isNew: true, isLimited: false },
  { id: 'mb9', name: 'Sérum à la Rose', brand: 'Fleur d\'Or', price: 110, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.7, reviews: 203, isNew: false, isLimited: true },
  { id: 'mb10', name: 'Candle Parfumée', brand: 'Maison de Beaute', price: 58, image: 'https://images.unsplash.com/photo-1602874801007-bd36a3e1e56e?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Home Fragrance', rating: 4.6, reviews: 98, isNew: true, isLimited: false },
  { id: 'mb11', name: 'Yeux Contour Cream', brand: 'Éclat', price: 76, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', category: 'Skincare', rating: 4.5, reviews: 112, isNew: false, isLimited: false },
  { id: 'mb12', name: 'Parfum de Nuit', brand: 'Parfumerie Noire', price: 195, image: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80', category: 'Fragrance', rating: 4.9, reviews: 87, isNew: true, isLimited: true },
  { id: 'mb13', name: 'Baume à Lèvres Luxe', brand: 'Maison Rouge', price: 28, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', category: 'Makeup', rating: 4.2, reviews: 56, isNew: true, isLimited: false },
  { id: 'mb14', name: 'Huile Corporelle d\'Or', brand: 'Fleur d\'Or', price: 88, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Body Care', rating: 4.6, reviews: 78, isNew: false, isLimited: false },
  { id: 'mb15', name: 'Shampoing Nourrissant', brand: 'Tresse Luxe', price: 44, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80', category: 'Hair Care', rating: 4.3, reviews: 92, isNew: true, isLimited: false },
  { id: 'mb16', name: 'Soin des Mains Crème', brand: 'Éclat', price: 48, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80', category: 'Body Care', rating: 4.4, reviews: 63, isNew: false, isLimited: false },
];

const TABS = ['All', 'Makeup', 'Skincare', 'Fragrance', 'Hair Care', 'Body Care', 'Home Fragrance'];

function ProductCard({ product, state }) {
  const [imgSrc, setImgSrc] = React.useState(product.image);
  const inWishlist = (state.wishlist || []).some(w => w.id === product.id);
  return (
    <div className="mb-product-card" onClick={() => { state.setSelectedProduct(product); state.navigate('product'); }}>
      <div className="mb-product-image">
        <img src={imgSrc} alt={product.name} onMouseEnter={() => product.hoverImage && setImgSrc(product.hoverImage)} onMouseLeave={() => setImgSrc(product.image)} />
        <div className="mb-badges">
          {product.isNew && <span className="mb-badge mb-badge-new">New</span>}
          {product.isLimited && <span className="mb-badge mb-badge-limited">Limited</span>}
        </div>
        <button className={`mb-wishlist ${inWishlist ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); state.toggleWishlist(product); }}>{inWishlist ? '♥' : '♡'}</button>
        <button className="mb-quickview" onClick={(e) => { e.stopPropagation(); state.setSelectedProduct(product); state.navigate('product'); }}>Quick View</button>
      </div>
      <div className="mb-product-info">
        <div className="mb-product-brand">{product.brand}</div>
        <h3 className="mb-product-name">{product.name}</h3>
        <div className="mb-product-rating">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}<span>({product.reviews})</span></div>
        <div className="mb-product-price">${product.price}</div>
        <button className="mb-product-atc" onClick={(e) => { e.stopPropagation(); state.addToCart(product); }}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function CategoryPage({ state }) {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const activeProducts = state.filteredProducts && state.filteredProducts.length > 0 ? state.filteredProducts : ALL_PRODUCTS;
  let filtered = activeProducts;
  if (activeTab !== 'All') {
    filtered = activeProducts.filter(p => {
      const c = p.category?.toLowerCase() || '';
      const tab = activeTab.toLowerCase();
      if (tab === 'makeup') return c.includes('shirt') || c.includes('top');
      if (tab === 'skincare') return c.includes('dress') || c.includes('gown') || c.includes('frock');
      if (tab === 'fragrance') return c.includes('shoe') || c.includes('slipper') || c.includes('heel');
      if (tab === 'hair care') return c.includes('watch') || c.includes('jewel') || c.includes('glass');
      if (tab === 'body care') return c.includes('bag') || c.includes('tote');
      return c.includes(tab);
    });
  }
  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'newest') filtered.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="mb-page" style={{ maxWidth: '1200px' }}>
      <h1>Our Collections</h1>
      <div className="mb-tabs">
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`mb-tab ${activeTab === tab ? 'active' : ''}`}>{tab}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--mb-text-muted)', fontFamily: 'var(--mb-font-body)' }}>{filtered.length} products</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '0.4rem 0.8rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.8rem', color: 'var(--mb-text)', outline: 'none' }}>
          <option value="default">Sort by Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      <div className="mb-product-grid">
        {paged.map(p => <ProductCard key={p.id} product={p} state={state} />)}
      </div>
      {totalPages > 1 && (
        <div className="mb-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`mb-page-btn ${currentPage === p ? 'active' : ''}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
