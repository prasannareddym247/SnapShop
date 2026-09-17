import React from 'react';

const PRODUCTS = [
  { id: 'sw1', name: 'Oversized Hoodie', price: 89, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1578768079052-aa76e54e22f1?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', colors: ['#111', '#fff', '#ff2d55', '#222'], rating: 4.5, reviews: 128, isNew: true, isLimited: false },
  { id: 'sw2', name: 'Graphic Tee', price: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&auto=format&fit=crop&q=80', category: 'T-Shirts', colors: ['#fff', '#111', '#ff2d55'], rating: 4.3, reviews: 94, isNew: true, isLimited: false },
  { id: 'sw3', name: 'Cargo Pants', price: 110, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80', category: 'Pants', colors: ['#222', '#3a3a3a', '#111'], rating: 4.6, reviews: 67, isNew: false, isLimited: true },
  { id: 'sw4', name: 'Bomber Jacket', price: 180, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#111', '#2a2a2a'], rating: 4.7, reviews: 42, isNew: false, isLimited: false },
  { id: 'sw5', name: 'Sneakers Pro', price: 145, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#ff2d55', '#222'], rating: 4.8, reviews: 203, isNew: true, isLimited: false },
  { id: 'sw6', name: 'Trucker Cap', price: 35, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1534215754734-18f55d13e65d?w=400&auto=format&fit=crop&q=80', category: 'Caps', colors: ['#111', '#ff2d55', '#fff', '#222'], rating: 4.2, reviews: 56, isNew: false, isLimited: false },
  { id: 'sw7', name: 'Crossbody Bag', price: 65, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&auto=format&fit=crop&q=80', category: 'Bags', colors: ['#111', '#fff', '#222'], rating: 4.4, reviews: 38, isNew: true, isLimited: false },
  { id: 'sw8', name: 'Chain Necklace', price: 55, image: 'https://images.unsplash.com/photo-1515562141589-80e5a2e3c2b4?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&auto=format&fit=crop&q=80', category: 'Accessories', colors: ['#c0c0c0', '#ffd700'], rating: 4.1, reviews: 29, isNew: false, isLimited: true },
  { id: 'sw9', name: 'Tech Fleece Hoodie', price: 120, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1578768079052-aa76e54e22f1?w=400&auto=format&fit=crop&q=80', category: 'Hoodies', colors: ['#222', '#555', '#111'], rating: 4.6, reviews: 89, isNew: true, isLimited: false },
  { id: 'sw10', name: 'Runner Sneakers', price: 130, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80', category: 'Sneakers', colors: ['#fff', '#111', '#ff6b35'], rating: 4.7, reviews: 156, isNew: false, isLimited: false },
  { id: 'sw11', name: 'Denim Jacket', price: 160, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1527016021513-09774b4c77c5?w=400&auto=format&fit=crop&q=80', category: 'Jackets', colors: ['#2a4a7f', '#111'], rating: 4.5, reviews: 73, isNew: false, isLimited: true },
  { id: 'sw12', name: 'Slim Joggers', price: 75, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80', category: 'Pants', colors: ['#111', '#333', '#555'], rating: 4.3, reviews: 112, isNew: false, isLimited: false },
];

const CATEGORIES = [
  { name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&auto=format&fit=crop&q=80', count: '24 Items' },
  { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&auto=format&fit=crop&q=80', count: '36 Items' },
  { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&auto=format&fit=crop&q=80', count: '18 Items' },
  { name: 'Sneakers', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop&q=80', count: '42 Items' },
  { name: 'Pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&auto=format&fit=crop&q=80', count: '28 Items' },
  { name: 'Caps', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80', count: '15 Items' },
  { name: 'Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80', count: '12 Items' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1515562141589-80e5a2e3c2b4?w=300&auto=format&fit=crop&q=80', count: '30 Items' },
];

function ProductCard({ product, onAddToCart, onWishlistToggle, inWishlist, onProductClick }) {
  const [imgSrc, setImgSrc] = React.useState(product.image);
  return (
    <div className="urban-product-card">
      <div className="urban-product-card-image" onClick={() => onProductClick && onProductClick(product)}>
        <img src={imgSrc} alt={product.name} onMouseEnter={() => product.hoverImage && setImgSrc(product.hoverImage)} onMouseLeave={() => setImgSrc(product.image)} />
        <div className="urban-product-badges">
          {product.isNew && <span className="urban-badge urban-badge-new">New Drop</span>}
          {product.isLimited && <span className="urban-badge urban-badge-limited">Limited Ed.</span>}
        </div>
        <button className={`urban-product-wishlist ${inWishlist ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}>
          {inWishlist ? '♥' : '♡'}
        </button>
        <button className="urban-product-quickview" onClick={(e) => { e.stopPropagation(); onProductClick && onProductClick(product); }}>Quick View</button>
      </div>
      <div className="urban-product-card-info">
        <h3 className="urban-product-card-name">{product.name}</h3>
        <div className="urban-product-card-price">${product.price}</div>
        <div className="urban-product-card-colors">
          {product.colors.map((color, i) => <span key={i} className="urban-color-dot" style={{ background: color }} />)}
        </div>
        <div className="urban-product-card-rating">
          {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
          <span>({product.reviews})</span>
        </div>
        <button className="urban-product-card-atc" onClick={() => onAddToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return <span style={{ color: '#ffc107' }}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>;
}

export default function HomePage({ state }) {
  const activeProducts = state.filteredProducts && state.filteredProducts.length > 0 ? state.filteredProducts : PRODUCTS;
  const featured = activeProducts.slice(0, 4);
  const newDrops = activeProducts.slice(0, 4);
  const bestSellers = activeProducts.slice(Math.min(4, activeProducts.length - 1), Math.min(8, activeProducts.length));
  const limitedEd = activeProducts.slice(Math.min(8, activeProducts.length - 1), Math.min(11, activeProducts.length));
  const sneakers = activeProducts.slice(0, 4);
  const trending = activeProducts.slice(Math.min(2, activeProducts.length - 1), Math.min(6, activeProducts.length));

  return (
    <div>
      {/* HERO SECTION */}
      <section className="urban-hero">
        <div className="urban-hero-bg" />
        <div className="urban-hero-grid" />
        <div className="urban-hero-content">
          <div className="urban-hero-badge">
            <span>✦</span> Limited Edition Collection
          </div>
          <h1>DROP SEASON<br /><span>EIGHT</span></h1>
          <p>Bold new silhouettes, premium fabrics, and exclusive colorways. The next chapter of streetwear is here. Available for 72 hours only.</p>
          <div className="urban-hero-actions">
            <button className="urban-btn-primary" onClick={() => state.navigate('category')}>Shop Now →</button>
            <button className="urban-btn-secondary" onClick={() => state.navigate('category')}>Explore Collection</button>
          </div>
        </div>
        <div className="urban-hero-visual">
          <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80" alt="Urban streetwear" />
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="urban-section">
        <div className="urban-section-header">
          <span className="urban-section-sub">Curated For You</span>
          <h2>Featured Collection</h2>
          <p>Handpicked essentials from our latest season</p>
        </div>
        <div className="urban-product-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* NEW DROPS */}
      <section className="urban-section-dark">
        <div className="urban-section-header">
          <span className="urban-section-sub">Fresh Arrivals</span>
          <h2>New Drops</h2>
          <p>The latest additions to the UrbanHype family</p>
        </div>
        <div className="urban-product-grid" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {newDrops.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="urban-section">
        <div className="urban-section-header">
          <span className="urban-section-sub">Browse</span>
          <h2>Shop by Category</h2>
        </div>
        <div className="urban-category-grid">
          {CATEGORIES.slice(0, 8).map(cat => (
            <div key={cat.name} className="urban-category-card" onClick={() => { state.setSelectedCategory(cat.name); state.navigate('category'); }}>
              <img src={cat.image} alt={cat.name} />
              <div className="urban-category-card-label">
                <h3>{cat.name}</h3>
                <span>{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROMO BANNER — NEW SEASON */}
      <section className="urban-section-full" style={{ background: 'var(--sw-bg-alt)' }}>
        <div className="urban-promo">
          <h2>New Season Collection</h2>
          <p>Elevate your wardrobe with our latest seasonal drops. Premium fabrics, bold designs, limited quantities.</p>
          <button className="urban-btn-primary" onClick={() => state.navigate('category')}>Shop New Season →</button>
        </div>
      </section>

      {/* TRENDING NOW */}
      <section className="urban-section">
        <div className="urban-section-header">
          <span className="urban-section-sub">Most Popular</span>
          <h2>Trending Now</h2>
        </div>
        <div className="urban-product-grid">
          {trending.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* LIMITED EDITION RELEASES */}
      {limitedEd.length > 0 && (
        <section className="urban-section-dark">
          <div className="urban-section-header">
            <span className="urban-section-sub">Exclusive</span>
            <h2>Limited Edition</h2>
            <p>Grab them before they're gone — these won't restock</p>
          </div>
          <div className="urban-product-grid" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {limitedEd.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      <section className="urban-section">
        <div className="urban-section-header">
          <span className="urban-section-sub">Community Favorites</span>
          <h2>Best Sellers</h2>
        </div>
        <div className="urban-product-grid">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* FEATURED SNEAKERS */}
      <section className="urban-section-full" style={{ background: 'var(--sw-bg-alt)' }}>
        <div className="urban-section-header">
          <span className="urban-section-sub">Kicks</span>
          <h2>Featured Sneakers</h2>
        </div>
        <div className="urban-sneaker-feature" style={{ maxWidth: '1280px', margin: '0 auto 2rem' }}>
          <div className="urban-sneaker-feature-image">
            <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80" alt="Featured sneaker" />
          </div>
          <div className="urban-sneaker-feature-content">
            <span className="tag">Exclusive Drop</span>
            <h3>Sneakers Pro Elite</h3>
            <p>Premium performance meets street style. Crafted with breathable mesh, responsive cushioning, and a sleek silhouette that transitions from the court to the concrete.</p>
            <div className="price">$145</div>
            <button className="urban-btn-primary" onClick={() => state.navigate('product', PRODUCTS[4])}>Shop Now →</button>
          </div>
        </div>
        <div className="urban-product-grid" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {sneakers.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* EXCLUSIVE COLLECTIONS */}
      <section className="urban-section">
        <div className="urban-section-header">
          <span className="urban-section-sub">Curated Sets</span>
          <h2>Exclusive Collections</h2>
        </div>
        <div className="urban-collection-grid">
          {[
            { name: 'Urban Luxe', tag: 'Premium Essentials', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500&auto=format&fit=crop&q=80' },
            { name: 'Tech Wear', tag: 'Functional Fashion', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&auto=format&fit=crop&q=80' },
            { name: 'Retro Revival', tag: 'Throwback Classics', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=80' },
          ].map(col => (
            <div key={col.name} className="urban-collection-card" onClick={() => state.navigate('category')}>
              <img src={col.img} alt={col.name} />
              <div className="urban-collection-card-info">
                <h3>{col.name}</h3>
                <span>{col.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STAFF PICKS */}
      <section className="urban-section-dark">
        <div className="urban-section-header">
          <span className="urban-section-sub">Team Favorites</span>
          <h2>Staff Picks</h2>
        </div>
        <div className="urban-staff-picks" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { name: 'Alex Chen', role: 'Lead Curator', product: 'Tech Fleece Hoodie', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
            { name: 'Maya Rivera', role: 'Style Director', product: 'Sneakers Pro Elite', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
            { name: 'James Park', role: 'Head of Design', product: 'Bomber Jacket', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
            { name: 'Zara Williams', role: 'Brand Manager', product: 'Crossbody Bag', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
            { name: 'Liam Torres', role: 'Creative Lead', product: 'Graphic Tee', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
          ].map((staff, i) => (
            <div key={i} className="urban-staff-pick" onClick={() => state.navigate('category')}>
              <div className="pick-img"><img src={staff.img} alt={staff.name} /></div>
              <h4>{staff.name}</h4>
              <div className="pick-role">{staff.role}</div>
              <div className="pick-product">Pick: {staff.product}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="urban-section-full" style={{ padding: '0' }}>
        <div className="urban-section-header" style={{ padding: '5rem 2rem 3rem' }}>
          <span className="urban-section-sub">Editorial</span>
          <h2>Lookbook</h2>
        </div>
        <div className="urban-lookbook">
          <div className="urban-lookbook-item">
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80" alt="Lookbook 1" />
            <div className="urban-lookbook-label">Street Luxe</div>
          </div>
          <div className="urban-lookbook-item">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&auto=format&fit=crop&q=80" alt="Lookbook 2" />
            <div className="urban-lookbook-label" style={{ fontSize: '1.2rem' }}>Night Run</div>
          </div>
          <div className="urban-lookbook-item">
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&auto=format&fit=crop&q=80" alt="Lookbook 3" />
            <div className="urban-lookbook-label" style={{ fontSize: '1.2rem' }}>Monochrome</div>
          </div>
          <div className="urban-lookbook-item">
            <img src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&auto=format&fit=crop&q=80" alt="Lookbook 4" />
            <div className="urban-lookbook-label" style={{ fontSize: '1.2rem' }}>Utility</div>
          </div>
          <div className="urban-lookbook-item">
            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80" alt="Lookbook 5" />
            <div className="urban-lookbook-label" style={{ fontSize: '1.2rem' }}>Bold Hues</div>
          </div>
        </div>
      </section>

      {/* PROMO STRIP */}
      <section className="urban-section-full" style={{ padding: '0' }}>
        <div className="urban-promo-strip">
          <div className="urban-promo-strip-item">
            <div className="icon">🚚</div>
            <h4>Free Shipping</h4>
            <p>On orders over $100</p>
          </div>
          <div className="urban-promo-strip-item">
            <div className="icon">↩️</div>
            <h4>Easy Returns</h4>
            <p>30-day return policy</p>
          </div>
          <div className="urban-promo-strip-item">
            <div className="icon">🔒</div>
            <h4>Secure Checkout</h4>
            <p>Encrypted payments</p>
          </div>
          <div className="urban-promo-strip-item">
            <div className="icon">⚡</div>
            <h4>Limited Drops</h4>
            <p>Weekly releases</p>
          </div>
        </div>
      </section>

      {/* COMMUNITY STYLE GALLERY */}
      <section className="urban-section" style={{ maxWidth: '100%', paddingBottom: '0' }}>
        <div className="urban-section-header">
          <span className="urban-section-sub">#UrbanHype</span>
          <h2>Community Style</h2>
          <p>Tag us for a chance to be featured</p>
        </div>
        <div className="urban-instagram-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="urban-instagram-item">
              <img src={`https://images.unsplash.com/photo-${[1552374196, 1485968579580, 1441986300917, 1469334031218, 1445205170230, 1490481651871, 1460353581641, 1556905055][i]}-ab68de25d43d?w=300&auto=format&fit=crop&q=80`} alt={`Community ${i + 1}`} />
              <div className="ig-icon">📷</div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="urban-section">
        <div className="urban-section-header">
          <span className="urban-section-sub">Testimonials</span>
          <h2>What They're Saying</h2>
        </div>
        <div className="urban-testimonials">
          {[
            { name: '@streetking_nyc', handle: 'streetking_nyc', text: 'The quality of the Tech Fleece Hoodie is insane. Cop it before it sells out.', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
            { name: '@chicagostyle', handle: 'chicagostyle', text: "Best sneaker drop of the year. The Elite Pros are my new daily beaters. 10/10.", rating: 5, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
            { name: '@londonhype', handle: 'londonhype', text: 'Limited edition drops are always fire. The crossbody bag is perfect for festivals.', rating: 4, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
          ].map((review, i) => (
            <div key={i} className="urban-testimonial-card">
              <div className="avatar"><img src={review.img} alt={review.name} /></div>
              <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              <p>"{review.text}"</p>
              <h4>{review.name}</h4>
              <div className="handle">@{review.handle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIMITED RELEASES BANNER */}
      <section className="urban-section-full" style={{ background: 'var(--sw-bg-alt)' }}>
        <div className="urban-promo" style={{ borderColor: 'var(--sw-primary)' }}>
          <h2>Weekly Drops Every Friday</h2>
          <p>Be the first to know. Sign up for early access to all limited releases.</p>
          <div className="urban-newsletter-form" style={{ maxWidth: '400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <input type="email" placeholder="your@email.com" />
            <button onClick={() => alert('You\'re on the list!')}>Get Early Access</button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="urban-section">
        <div className="urban-newsletter">
          <h2>Stay in the Loop</h2>
          <p>Subscribe for exclusive drops, early access, and 15% off your first order.</p>
          <div className="urban-newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button onClick={() => alert('Subscribed! Welcome to UrbanHype.')}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
