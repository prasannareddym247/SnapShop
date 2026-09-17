import React from 'react';

function ProductCard({ product, onAddToCart, onWishlistToggle, inWishlist, onProductClick }) {
  const [imgSrc, setImgSrc] = React.useState(product.image || product.imageUrl);
  const price = product.discountedPrice != null ? product.discountedPrice : (product.price || 0);
  const original = product.originalPrice || (product.discountedPrice != null && product.discountedPrice < (product.price || 0) ? product.price : null);
  return (
    <div className="glam-product-card">
      <div className="glam-product-image" onClick={() => onProductClick && onProductClick(product)}>
        <img src={imgSrc} alt={product.name} onError={() => setImgSrc('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80')} />
        <div className="glam-product-badges">
          {product.isNew && <span className="glam-badge glam-badge-new">New</span>}
          {original && <span className="glam-badge glam-badge-sale">Sale</span>}
        </div>
        <button className={`glam-product-wishlist ${inWishlist ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onWishlistToggle(product); }}>{inWishlist ? '♥' : '♡'}</button>
        <button className="glam-product-quickview" onClick={(e) => { e.stopPropagation(); onProductClick && onProductClick(product); }}>Quick View</button>
      </div>
      <div className="glam-product-info">
        <div className="glam-product-brand">{product.brand}</div>
        <h3 className="glam-product-name">{product.name}</h3>
        <div className="glam-product-rating">{'★'.repeat(Math.floor(product.rating || 4))}{'☆'.repeat(5 - Math.floor(product.rating || 4))}<span>({(Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || product.reviewCount || 0})</span></div>
        <div className="glam-product-price">₹{Number(price).toLocaleString('en-IN')}{original && <span className="original">₹{Number(original).toLocaleString('en-IN')}</span>}</div>
        <button className="glam-product-atc" onClick={() => onAddToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function HomePage({ state }) {
  const PRODUCTS = state.filteredProducts || [];
  const CATEGORIES = state.categories || [];
  const featured = PRODUCTS.slice(0, 4);
  const newArrivals = PRODUCTS.slice(0, 4);
  const bestSellers = [...PRODUCTS].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 4);
  const saleItems = PRODUCTS.filter(p => p.discountedPrice != null && p.discountedPrice < (p.price || 0)).slice(0, 4);
  const makeup = PRODUCTS.filter(p => (p.category || '').toLowerCase().includes('makeup')).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="glam-hero">
        <div className="glam-hero-content">
          <div className="glam-hero-badge">New Season Arrivals</div>
          <h1>Your Beauty,<br /><span>Your Glow</span></h1>
          <p>Discover premium skincare, makeup, and wellness essentials curated for every skin tone and beauty need. Glow naturally with Glamour Nykaa.</p>
          <div className="glam-hero-actions">
            <button className="glam-btn-primary" onClick={() => state.navigate('category')}>Shop Now →</button>
            <button className="glam-btn-secondary" onClick={() => state.navigate('category')}>Explore Collections</button>
          </div>
        </div>
        <div className="glam-hero-visual">
          <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=80" alt="Beauty" />
        </div>
      </section>

      {/* BRAND STRIP */}
      <div className="glam-brand-strip">
        {['LuminaGlow', 'Posh Lips', 'DewySkin', 'Floral Essence', 'TresseLuxe', 'PureGlow', 'LashDefine'].map(b => (
          <span key={b} className="glam-brand-item">{b}</span>
        ))}
      </div>

      {/* FEATURED BRANDS */}
      <section className="glam-section-alt">
        <div className="glam-section-header">
          <span className="glam-section-sub">Top Brands</span>
          <h2>Featured Brands</h2>
          <p>Shop from the most-loved beauty brands</p>
        </div>
        <div className="glam-brand-strip" style={{ background: 'transparent', border: 'none', gap: '2rem' }}>
          {['LuminaGlow', 'Posh Lips', 'DewySkin', 'TresseLuxe', 'PureGlow', 'LashDefine'].map(b => (
            <div key={b} onClick={() => state.navigate('category')} style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.1rem', color: 'var(--glam-primary)', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.7'}>{b}</div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="glam-section">
        <div className="glam-section-header">
          <span className="glam-section-sub">Just In</span>
          <h2>New Arrivals</h2>
          <p>Fresh from the labs — the latest in beauty innovation</p>
        </div>
        <div className="glam-product-grid">
          {newArrivals.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="glam-section-alt">
        <div className="glam-section-header">
          <span className="glam-section-sub">Browse</span>
          <h2>Shop by Category</h2>
        </div>
        <div className="glam-category-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="glam-category-card" onClick={() => { state.setSelectedCategory(cat.name); state.navigate('category'); }}>
              <div className="glam-category-image"><img src={cat.image} alt={cat.name} /></div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY CONCERN */}
      <section className="glam-section">
        <div className="glam-section-header">
          <span className="glam-section-sub">Concern</span>
          <h2>Shop by Concern</h2>
          <p>Find products tailored to your skin's needs</p>
        </div>
        <div className="glam-concern-grid">
          {[
            { icon: '💧', name: 'Hydration', desc: 'Intense moisture' },
            { icon: '✨', name: 'Brightening', desc: 'Even skin tone' },
            { icon: '🛡️', name: 'Anti-Aging', desc: 'Youthful glow' },
            { icon: '🌿', name: 'Acne Care', desc: 'Clear skin' },
            { icon: '☀️', name: 'Sun Protection', desc: 'SPF defense' },
            { icon: '🌙', name: 'Night Care', desc: 'Overnight repair' },
          ].map(c => (
            <div key={c.name} className="glam-concern-card" onClick={() => state.navigate('category')}>
              <div className="icon">{c.icon}</div>
              <h4>{c.name}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="glam-section-alt">
        <div className="glam-section-header">
          <span className="glam-section-sub">Most Loved</span>
          <h2>Best Sellers</h2>
        </div>
        <div className="glam-product-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {bestSellers.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* PREMIUM COLLECTIONS */}
      <section className="glam-section">
        <div className="glam-section-header">
          <span className="glam-section-sub">Curated</span>
          <h2>Premium Collections</h2>
        </div>
        <div className="glam-promo-grid">
          {[
            { icon: '🌹', title: 'Rose Rituals', desc: 'Luxury rose-infused skincare and fragrance sets for a romantic self-care routine.' },
            { icon: '✨', title: 'Glow Essentials', desc: 'Everything you need for that radiant, dewy glow — from serums to highlighters.' },
            { icon: '🧴', title: 'Clean Beauty', desc: 'Vegan, cruelty-free, and clean formulations for conscious beauty lovers.' },
          ].map((col, i) => (
            <div key={i} className="glam-promo-card" onClick={() => state.navigate('category')}>
              <div className="icon">{col.icon}</div>
              <h4>{col.title}</h4>
              <p>{col.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FLASH SALE */}
      <section className="glam-section-full" style={{ background: 'var(--glam-bg-alt)' }}>
        <div className="glam-flash-sale" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2>⚡ Flash Sale — Up to 40% Off</h2>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Limited-time offers on best-selling skincare and makeup. Grab them before they're gone!</p>
          <button className="glam-btn-primary" style={{ background: '#fff', color: 'var(--glam-text)' }} onClick={() => state.navigate('category')}>Shop Flash Sale →</button>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="glam-section">
        <div className="glam-section-header">
          <span className="glam-section-sub">Trending</span>
          <h2>Trending Now</h2>
        </div>
        <div className="glam-product-grid">
          {makeup.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => state.addToCart(prod)} onWishlistToggle={(prod) => state.toggleWishlist(prod)} inWishlist={(state.wishlist || []).some(w => w.id === p.id)} onProductClick={(prod) => state.navigate('product', prod)} />)}
        </div>
      </section>

      {/* SEASONAL OFFERS */}
      <section className="glam-section-alt">
        <div className="glam-section-header">
          <span className="glam-section-sub">Seasonal</span>
          <h2>Seasonal Offers</h2>
        </div>
        <div className="glam-promo-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: '🎁', title: 'Gift Sets', desc: 'Curated beauty gift sets perfect for every occasion.' },
            { icon: '💰', title: 'Buy More, Save More', desc: 'Buy 2 get 10% off — mix and match across all categories.' },
            { icon: '🏷️', title: 'Brand Spotlight', desc: 'Featured brand of the week with exclusive discounts.' },
          ].map((offer, i) => (
            <div key={i} className="glam-promo-card" onClick={() => state.navigate('category')}>
              <div className="icon">{offer.icon}</div>
              <h4>{offer.title}</h4>
              <p>{offer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEAUTY TIPS & ARTICLES */}
      <section className="glam-section">
        <div className="glam-section-header">
          <span className="glam-section-sub">Learn</span>
          <h2>Beauty Tips & Articles</h2>
        </div>
        <div className="glam-blog-grid">
          {[
            { tag: 'Skincare', title: '10-Step Korean Skincare Routine', desc: 'Achieve that glass skin glow with our step-by-step guide.', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80' },
            { tag: 'Makeup', title: 'Summer Makeup Trends 2026', desc: 'The hottest makeup trends taking over this season.', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80' },
            { tag: 'Wellness', title: 'Self-Care Sunday Rituals', desc: 'Wind down with these wellness practices for mind and body.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80' },
          ].map((article, i) => (
            <div key={i} className="glam-blog-card" onClick={() => state.navigate('category')}>
              <img src={article.img} alt={article.title} />
              <div className="glam-blog-card-content">
                <div className="tag">{article.tag}</div>
                <h4>{article.title}</h4>
                <p>{article.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="glam-section-alt">
        <div className="glam-section-header">
          <span className="glam-section-sub">Reviews</span>
          <h2>What Our Customers Say</h2>
        </div>
        <div className="glam-testimonials" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { name: 'Priya S.', handle: '@priyabeauty', text: 'Absolutely love the Radiance Serum! My skin has never looked this glowing. Fast delivery too!', rating: 5, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
            { name: 'Ananya K.', handle: '@ananyaglow', text: 'The Velvet Matte Lipstick is my new obsession. The shade range is incredible and it lasts all day.', rating: 5, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
            { name: 'Rohit M.', handle: '@rohitskincare', text: "Finally found a moisturizer that works for my sensitive skin. Hydra Glow is a game-changer.", rating: 4, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
          ].map((review, i) => (
            <div key={i} className="glam-testimonial-card">
              <div className="avatar"><img src={review.img} alt={review.name} /></div>
              <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              <p>"{review.text}"</p>
              <h4>{review.name}</h4>
              <div className="glam-handle">{review.handle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM / SOCIAL FEED */}
      <section className="glam-section" style={{ maxWidth: '100%', paddingBottom: '0' }}>
        <div className="glam-section-header">
          <span className="glam-section-sub">Follow Us</span>
          <h2>@glamournykaa</h2>
          <p>Tag us for a chance to be featured</p>
        </div>
        <div className="glam-instagram-grid">
          {['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&auto=format&fit=crop&q=80',
          ].map((url, i) => (
            <div key={i} className="glam-instagram-item">
              <img src={url} alt={`Instagram ${i + 1}`} />
              <div className="ig-overlay">📷</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="glam-section">
        <div className="glam-newsletter">
          <h2>Join the Glam Fam</h2>
          <p>Subscribe for exclusive offers, beauty tips, and 15% off your first order.</p>
          <div className="glam-newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button onClick={() => alert('Welcome to Glamour Nykaa! Check your inbox.')}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
