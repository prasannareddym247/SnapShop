import React from 'react';

const PRODUCTS = [
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
];

const CATEGORIES = [
  { name: 'Makeup', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80', count: '186 Products' },
  { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=200&auto=format&fit=crop&q=80', count: '224 Products' },
  { name: 'Fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=80', count: '98 Products' },
  { name: 'Hair Care', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&auto=format&fit=crop&q=80', count: '76 Products' },
  { name: 'Body Care', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&auto=format&fit=crop&q=80', count: '54 Products' },
  { name: 'Beauty Tools', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80', count: '32 Products' },
  { name: 'Gift Sets', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=200&auto=format&fit=crop&q=80', count: '28 Products' },
  { name: 'Wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&auto=format&fit=crop&q=80', count: '45 Products' },
];

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

export default function HomePage({ state }) {
  const activeProducts = state.filteredProducts && state.filteredProducts.length > 0 ? state.filteredProducts : PRODUCTS;
  const newArrivals = activeProducts.slice(0, 4);
  const bestSellers = activeProducts.slice(Math.min(4, activeProducts.length - 1), Math.min(8, activeProducts.length));
  const skincare = activeProducts.slice(0, 4);
  const makeup = activeProducts.slice(Math.min(2, activeProducts.length - 1), Math.min(6, activeProducts.length));
  const fragrance = activeProducts.slice(Math.min(4, activeProducts.length - 1), Math.min(8, activeProducts.length));
  const limited = activeProducts.slice(0, 4);
  const bodyHair = activeProducts.slice(0, 4);
  const essentials = activeProducts.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="mb-hero">
        <div className="mb-hero-content">
          <div className="mb-hero-badge">New Season 2026</div>
          <h1>Timeless <br /><span>Beauty</span></h1>
          <p>Discover our curated collection of luxury beauty essentials. From haute skincare to exquisite fragrances — elegance reimagined for the modern connoisseur.</p>
          <div className="mb-hero-actions">
            <button className="mb-btn-primary" onClick={() => state.navigate('category')}>Shop Collection —</button>
            <button className="mb-btn-secondary" onClick={() => state.navigate('category')}>Discover Luxury</button>
          </div>
        </div>
        <div className="mb-hero-visual">
          <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=80" alt="Luxury Beauty" />
        </div>
      </section>

      {/* BRAND STRIP */}
      <div className="mb-brand-strip">
        {['Lumière', 'Maison Rouge', 'Éclat', 'Parfumerie Noire', 'Tresse Luxe', 'Fleur d\'Or'].map(b => (
          <span key={b} className="mb-brand-item">{b}</span>
        ))}
      </div>

      {/* FEATURED BRANDS */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">The Atelier</span>
          <h2>Featured Brands</h2>
          <p>Maison de Beaute proudly presents the world's most distinguished beauty maisons.</p>
        </div>
        <div className="mb-brand-strip" style={{ background: 'transparent', border: 'none', gap: '2.5rem' }}>
          {['Lumière', 'Maison Rouge', 'Éclat', 'Parfumerie Noire', 'Tresse Luxe', 'Fleur d\'Or'].map(b => (
            <div key={b} onClick={() => state.navigate('category')}
              style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', color: 'var(--mb-secondary)', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.3s' }}
              onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.7'}>{b}</div>
          ))}
        </div>
      </section>

      {/* LUXURY COLLECTIONS */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Curated Excellence</span>
          <h2>Luxury Collections</h2>
          <p>Discover our hand-selected collections, each telling a story of artistry and refinement.</p>
        </div>
        <div className="mb-promo-grid">
          {[
            { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80', title: 'Haute Makeup', desc: 'Pigments of unparalleled richness and texture — artistry in every stroke.' },
            { img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=600&auto=format&fit=crop&q=80', title: 'Skincare Alchemy', desc: 'Where science meets nature — transformative formulations for radiant skin.' },
            { img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80', title: 'Fragrance Collection', desc: 'Olfactory masterpieces crafted by the world\'s most esteemed perfumers.' },
          ].map((col, i) => (
            <div key={i} className="mb-promo-card" onClick={() => state.navigate('category')}>
              <img src={col.img} alt={col.title} />
              <div className="mb-promo-content">
                <h4>{col.title}</h4>
                <p>{col.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Nouvelle Collection</span>
          <h2>New Arrivals</h2>
          <p>The latest additions to our luxury beauty portfolio.</p>
        </div>
        <div className="mb-product-grid">
          {newArrivals.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Browse</span>
          <h2>Shop by Category</h2>
          <p>Explore our world of luxury beauty.</p>
        </div>
        <div className="mb-category-grid" style={{ maxWidth: '850px', margin: '0 auto' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="mb-category-card" onClick={() => { state.setSelectedCategory(cat.name); state.navigate('category'); }}>
              <div className="mb-category-image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <h3>{cat.name}</h3>
              <div style={{ fontSize: '0.7rem', color: 'var(--mb-text-muted)', fontFamily: 'var(--mb-font-body)' }}>{cat.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Les Plus Vendus</span>
          <h2>Best Sellers</h2>
          <p>The most coveted products — beloved by our discerning clientele.</p>
        </div>
        <div className="mb-product-grid">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* SIGNATURE COLLECTIONS */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Signature</span>
          <h2>Exclusive Collections</h2>
          <p>Limited edition collaborations and signature collections, crafted exclusively for Maison de Beaute.</p>
        </div>
        <div className="mb-promo-grid">
          {[
            { img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80', title: 'La Rose Éternelle', desc: 'A limited-edition rose-centric collection celebrating timeless femininity.' },
            { img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop&q=80', title: 'Or & Noir', desc: 'Gold and black — the epitome of elegance. An exclusive capsule collection.' },
            { img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80', title: 'Spa à la Maison', desc: 'Bring the spa experience home with our wellness-focused edit.' },
          ].map((col, i) => (
            <div key={i} className="mb-promo-card" onClick={() => state.navigate('category')}>
              <img src={col.img} alt={col.title} />
              <div className="mb-promo-content">
                <h4>{col.title}</h4>
                <p>{col.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREMIUM SKINCARE */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Soin de la Peau</span>
          <h2>Premium Skincare</h2>
          <p>Advanced formulations for the most sophisticated skincare rituals.</p>
        </div>
        <div className="mb-product-grid">
          {skincare.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* EXCLUSIVE LAUNCHES BANNER */}
      <section className="mb-hero-banner">
        <h2>Exclusive Launches</h2>
        <p>Be the first to experience our newest luxury collections before they reach the boutique floor. Pre-order now for complimentary gift wrapping and a personal consultation.</p>
        <button className="mb-btn-primary" style={{ background: '#fff', color: 'var(--mb-text)', position: 'relative', zIndex: 1 }} onClick={() => state.navigate('category')}>Explore New Launches</button>
      </section>

      {/* LUXURY MAKEUP */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Maquillage</span>
          <h2>Luxury Makeup</h2>
          <p>Where colour meets craftsmanship. Discover our range of haute couture cosmetics.</p>
        </div>
        <div className="mb-product-grid">
          {makeup.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* LIMITED EDITION */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Édition Limitée</span>
          <h2>Limited Edition</h2>
          <p>Exclusive creations available only for a limited time — coveted by collectors.</p>
        </div>
        <div className="mb-product-grid">
          {limited.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* EXCLUSIVE FRAGRANCE */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Parfumerie</span>
          <h2>Exclusive Fragrance Collection</h2>
          <p>Olfactory masterpieces crafted by the world's most celebrated perfumers.</p>
        </div>
        <div className="mb-product-grid">
          {fragrance.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* FEATURED BRAND SPOTLIGHT */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Brand Spotlight</span>
          <h2>Maison Rouge</h2>
          <p>Discover the artistry behind one of our most revered beauty houses.</p>
        </div>
        <div className="mb-two-col" style={{ maxWidth: '900px', margin: '0 auto', alignItems: 'center' }}>
          <img src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80" alt="Maison Rouge" style={{ width: '100%', borderRadius: '14px' }} />
          <div>
            <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1rem' }}>The Art of Colour</h3>
            <p style={{ color: 'var(--mb-text-muted)', lineHeight: 1.8, marginBottom: '1.5rem', fontWeight: 300 }}>Maison Rouge has been at the forefront of colour cosmetics since 1927. Their exquisite pigments and velvety textures have made them a favourite among beauty connoisseurs worldwide.</p>
            <button className="mb-btn-primary" onClick={() => state.navigate('category')}>Explore Maison Rouge</button>
          </div>
        </div>
      </section>

      {/* BEAUTY ESSENTIALS */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Indispensables</span>
          <h2>Beauty Essentials</h2>
          <p>The foundational pieces every beauty collection deserves.</p>
        </div>
        <div className="mb-product-grid">
          {essentials.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* GIFT SETS / SEASONAL */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Cadeaux</span>
          <h2>Luxury Gift Sets</h2>
          <p>Curated ensembles presented in signature Maison de Beaute packaging — the perfect indulgence.</p>
        </div>
        <div className="mb-feature-grid">
          {[
            { icon: '🎁', title: 'Discovery Collection', desc: 'A curated set of our most beloved products — the perfect introduction to luxury beauty.' },
            { icon: '✨', title: 'Spa Ritual Set', desc: 'Transform your daily routine into a spa-like experience with our wellness edit.' },
            { icon: '🌹', title: 'Rose Ensemble', desc: 'An exquisite collection of rose-infused treasures from fragrances to skincare.' },
          ].map((gift, i) => (
            <div key={i} className="mb-feature-card" onClick={() => state.navigate('category')}>
              <div className="icon">{gift.icon}</div>
              <h4>{gift.title}</h4>
              <p>{gift.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEASONAL OFFERS */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Promotions</span>
          <h2>Seasonal Offers</h2>
          <p>Exclusive seasonal promotions on our most coveted luxury beauty products.</p>
        </div>
        <div className="mb-promo-grid">
          {[
            { img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80', title: 'Complimentary Shipping', desc: 'Enjoy complimentary shipping on all orders over $100 — a signature Maison de Beaute experience.' },
            { img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80', title: 'Luxury Gift Guide', desc: 'Our curated gift guide for every occasion — from anniversary essentials to holiday indulgences.' },
            { img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=600&auto=format&fit=crop&q=80', title: 'Beauty Event Campaign', desc: 'Join our exclusive beauty events — virtual consultations, product launches, and member-only previews.' },
          ].map((offer, i) => (
            <div key={i} className="mb-promo-card" onClick={() => state.navigate('category')}>
              <img src={offer.img} alt={offer.title} />
              <div className="mb-promo-content">
                <h4>{offer.title}</h4>
                <p>{offer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER FAVORITES */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Favoris</span>
          <h2>Customer Favorites</h2>
          <p>Our most treasured products, as chosen by you.</p>
        </div>
        <div className="mb-product-grid">
          {PRODUCTS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* BEAUTY JOURNAL / BLOG */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Le Journal</span>
          <h2>Beauty Journal</h2>
          <p>Expert tips, beauty stories, and insider knowledge from the Maison de Beaute atelier.</p>
        </div>
        <div className="mb-blog-grid">
          {[
            { tag: 'Skincare', title: 'The Art of the Facial: A Step-by-Step Guide', desc: 'Master the quintessential French facial ritual with our at-home guide.', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80' },
            { tag: 'Fragrance', title: 'How to Choose Your Signature Scent', desc: 'A perfumer\'s guide to finding the fragrance that speaks to your soul.', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80' },
            { tag: 'Makeup', title: 'Spring 2026: The Season\'s Mostcoveted Trends', desc: 'From dewy skin to bold lips — the trends defining this season.', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80' },
          ].map((blog, i) => (
            <div key={i} className="mb-blog-card" onClick={() => state.navigate('about')}>
              <img src={blog.img} alt={blog.title} />
              <div className="mb-blog-content">
                <div className="mb-tag">{blog.tag}</div>
                <h4>{blog.title}</h4>
                <p>{blog.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONALIZED BEAUTY */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Sur Mesure</span>
          <h2>Personalized Beauty Consultation</h2>
          <p>Schedule a one-on-one consultation with our beauty experts for a tailored routine crafted exclusively for you.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="mb-btn-primary" onClick={() => state.navigate('contact')}>Book a Consultation</button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mb-section">
        <div className="mb-section-header">
          <span className="mb-sub">Témoignages</span>
          <h2>What Our Clientele Say</h2>
          <p>Words from those who have experienced the Maison de Beaute difference.</p>
        </div>
        <div className="mb-testimonials">
          {[
            { name: 'Isabelle D.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', stars: 5, text: 'The Crème Luxe has transformed my skincare routine. My skin has never looked more radiant. Truly exceptional quality.' },
            { name: 'Charlotte W.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', stars: 5, text: 'Shopping at Maison de Beaute is an experience in itself. The packaging, the service, the products — every detail speaks of luxury.' },
            { name: 'Marie-Claire S.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', stars: 5, text: 'I discovered my signature fragrance here and have been a loyal client ever since. An unparalleled selection of perfumes.' },
          ].map((t, i) => (
            <div key={i} className="mb-testimonial">
              <div className="avatar"><img src={t.avatar} alt={t.name} /></div>
              <div className="stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
              <p>"{t.text}"</p>
              <h4>{t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* PREMIUM MEMBERSHIP */}
      <section className="mb-section-alt">
        <div className="mb-section-header">
          <span className="mb-sub">Le Cercle</span>
          <h2>Premium Membership Benefits</h2>
          <p>Join Le Cercle — our exclusive membership programme — and unlock a world of privilege.</p>
        </div>
        <div className="mb-feature-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {[
            { icon: '🎯', title: 'Early Access', desc: 'Be the first to shop new collections and limited edition releases before they launch.' },
            { icon: '🎁', title: 'Complimentary Gifts', desc: 'Receive a curated gift with every purchase, plus a birthday surprise each year.' },
            { icon: '🚚', title: 'Priority Shipping', desc: 'Enjoy complimentary express shipping on all orders with no minimum spend.' },
          ].map((ben, i) => (
            <div key={i} className="mb-feature-card" onClick={() => state.navigate('account')}>
              <div className="icon">{ben.icon}</div>
              <h4>{ben.title}</h4>
              <p>{ben.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mb-section-full" style={{ padding: '5rem 0' }}>
        <div className="mb-section-header" style={{ padding: '0 3rem' }}>
          <span className="mb-sub">Follow Us</span>
          <h2>@MaisonDeBeaute</h2>
          <p>Tag us in your beauty rituals for a chance to be featured.</p>
        </div>
        <div className="mb-instagram-grid">
          {[
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
          ].map((url, i) => (
            <div key={i} className="mb-instagram-item">
              <img src={url} alt={`Instagram ${i + 1}`} />
              <div className="ig-overlay">📸</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mb-section">
        <div className="mb-newsletter">
          <h2>L'Expression</h2>
          <p>Subscribe to receive exclusive previews of new collections, beauty insights, and invitations to private events.</p>
          <div className="mb-newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button onClick={() => alert('Thank you for subscribing to Maison de Beaute. A world of luxury awaits.')}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
