import React, { useState } from 'react';

const FEATURED_BRANDS = [
  { name: 'GlowUp Labs', count: '124 products' },
  { name: 'Botanical', count: '89 products' },
  { name: 'Luxe Color', count: '156 products' },
  { name: 'Parfum Luxe', count: '67 products' },
  { name: 'Pro Tools', count: '43 products' },
  { name: 'HairLuxe', count: '78 products' },
];

const CATEGORIES = [
  { name: 'Makeup', count: '256 products', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80' },
  { name: 'Skincare', count: '189 products', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop&q=80' },
  { name: 'Fragrance', count: '98 products', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80' },
  { name: 'Hair Care', count: '134 products', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80' },
  { name: 'Bath & Body', count: '76 products', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80' },
  { name: 'Tools & Accessories', count: '112 products', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Beauty Enthusiast', avatar: 'https://placehold.co/64x64/f8f5f1/8a8a8a?text=PS', text: 'Absolutely love the quality of their serums. My skin has never looked better! The Vitamin C serum is a game-changer.', rating: 5 },
  { name: 'Ananya Gupta', role: 'Makeup Artist', avatar: 'https://placehold.co/64x64/f8f5f1/8a8a8a?text=AG', text: 'The pigment payoff on their eyeshadow palettes is incredible. Perfect for professional use and everyday glam.', rating: 5 },
  { name: 'Riya Patel', role: 'Skincare Junkie', avatar: 'https://placehold.co/64x64/f8f5f1/8a8a8a?text=RP', text: 'Their hyaluronic acid serum transformed my dry skin. Fast shipping and beautiful packaging too!', rating: 5 },
];

const TIPS = [
  { title: 'Winter Skincare Routine', tag: 'Skincare', desc: 'Essential steps to keep your skin hydrated and glowing through the colder months.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80' },
  { title: 'Spring Makeup Trends', tag: 'Makeup', desc: 'Fresh, dewy looks with soft pastels and glowing skin — the top trends this season.', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&auto=format&fit=crop&q=80' },
];

function ProductCard({ p, onAddToCart, onWishlist, isWishlisted }) {
  const price = p.discountedPrice != null ? p.discountedPrice : (p.price || 0);
  const original = p.originalPrice || (p.discountedPrice != null && p.discountedPrice < (p.price || 0) ? p.price : null);
  return (
    <div className="bl-product-card" onClick={() => onAddToCart?.(p)}>
      <div className="bl-product-image-wrap">
        {p.badge && <span className="bl-product-badge">{p.badge}</span>}
        <img src={p.image || p.imageUrl} alt={p.name} className="bl-product-image" loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/400x480/f8f5f1/8a8a8a?text=Product'; }} />
        <button
          className="bl-product-wishlist"
          onClick={e => { e.stopPropagation(); onWishlist?.(p); }}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
        <button className="bl-product-quickview" onClick={e => { e.stopPropagation(); }}>Quick View</button>
      </div>
      <div className="bl-product-info">
        <div className="bl-product-brand">{p.brand || ''}</div>
        <div className="bl-product-name">{p.name}</div>
        <div className="bl-product-rating">
          {'★'.repeat(Math.floor(p.rating || 4))}{'☆'.repeat(5 - Math.floor(p.rating || 4))}
          <span>({(Array.isArray(p.reviews) ? p.reviews.length : p.reviews) || p.reviewCount || 0})</span>
        </div>
        <div>
          <span className="bl-product-price">₹{Number(price).toLocaleString('en-IN')}</span>
          {original && <span className="bl-product-price-original">₹{Number(original).toLocaleString('en-IN')}</span>}
        </div>
        <button className="bl-add-to-cart" onClick={e => { e.stopPropagation(); onAddToCart?.(p); }}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function HomePage({ state }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const PRODUCTS = state.filteredProducts || [];

  return (
    <div>
      {/* Hero */}
      <section className="bl-hero">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop&q=80"
          alt=""
          className="bl-hero-bg"
        />
        <div className="bl-hero-overlay" />
        <div className="bl-hero-content">
          <span className="bl-hero-tag">New Collection 2026</span>
          <h1 className="bl-hero-title">Radiance Redefined</h1>
          <p className="bl-hero-desc">
            Discover premium beauty essentials curated for the modern you — from skincare rituals to makeup statements.
          </p>
          <div className="bl-hero-actions">
            <button className="bl-btn bl-btn-gold" onClick={() => state.navigate('category')}>Shop Collection</button>
            <button className="bl-btn bl-btn-outline" style={{ borderColor: '#fff', color: '#fff' }} onClick={() => state.navigate('category')}>Explore Brands</button>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="bl-section bl-container">
        <div className="bl-section-header">
          <span className="bl-section-tag">Featured Brands</span>
          <h2 className="bl-section-title">Shop by Brand</h2>
        </div>
        <div className="bl-brands-showcase">
          {FEATURED_BRANDS.map((brand, i) => (
            <div key={i} className="bl-brand-card" onClick={() => state.navigate('category')}>
              <div className="bl-brand-logo">{brand.name}</div>
              <div className="bl-brand-count">{brand.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bl-section" style={{ background: 'var(--bl-bg-alt)' }}>
        <div className="bl-container">
          <div className="bl-section-header">
            <span className="bl-section-tag">Fresh Drops</span>
            <h2 className="bl-section-title">New Arrivals</h2>
            <p className="bl-section-subtitle">The latest additions to our beauty family — fresh formulas, new shades, and must-have tools.</p>
          </div>
          <div className="bl-grid bl-grid-4">
            {PRODUCTS.slice(0, 4).map(p => (
              <ProductCard key={p.id} p={p} onAddToCart={state.addToCart} onWishlist={state.toggleWishlist} isWishlisted={state.wishlist?.some(w => w.id === p.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="bl-section bl-container">
        <div className="bl-section-header">
          <span className="bl-section-tag">Categories</span>
          <h2 className="bl-section-title">Shop by Category</h2>
          <p className="bl-section-subtitle">Explore our curated collections across every beauty need.</p>
        </div>
        <div className="bl-category-grid">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="bl-category-card" onClick={() => state.navigate('category')}>
              <img src={cat.image} alt={cat.name} loading="lazy" />
              <div className="bl-category-overlay" />
              <div className="bl-category-label">
                <h3>{cat.name}</h3>
                <span>{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seasonal Campaign Banner */}
      <section className="bl-section bl-container">
        <div className="bl-promo-banner">
          <img
            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&auto=format&fit=crop&q=80"
            alt="Seasonal Campaign"
            loading="lazy"
          />
          <div className="bl-promo-content">
            <span className="bl-promo-tag">Limited Edition</span>
            <h2 className="bl-promo-title">Spring Glow Collection</h2>
            <p className="bl-promo-desc">Discover radiant essentials for the season of renewal. Up to 25% off.</p>
            <button className="bl-btn bl-btn-gold" onClick={() => state.navigate('category')}>Shop the Collection</button>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bl-section" style={{ background: 'var(--bl-bg-alt)' }}>
        <div className="bl-container">
          <div className="bl-section-header">
            <span className="bl-section-tag">Customer Favorites</span>
            <h2 className="bl-section-title">Best Sellers</h2>
            <p className="bl-section-subtitle">The products everyone is raving about — our top-rated beauty essentials.</p>
          </div>
          <div className="bl-grid bl-grid-4">
            {[...PRODUCTS].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4).map(p => (
              <ProductCard key={p.id} p={p} onAddToCart={state.addToCart} onWishlist={state.toggleWishlist} isWishlisted={state.wishlist?.some(w => w.id === p.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Skincare Essentials */}
      <section className="bl-section bl-container">
        <div className="bl-section-header">
          <span className="bl-section-tag">Skincare</span>
          <h2 className="bl-section-title">Skincare Essentials</h2>
          <p className="bl-section-subtitle">Nourish, protect, and glow — your daily skincare ritual starts here.</p>
        </div>
        <div className="bl-grid bl-grid-4">
          {PRODUCTS.filter(p => {
            const cat = (p.category || '').toLowerCase();
            return cat.includes('skin') || cat.includes('beauty');
          }).slice(0, 4).map(p => (
            <ProductCard key={p.id} p={p} onAddToCart={state.addToCart} onWishlist={state.toggleWishlist} isWishlisted={state.wishlist?.some(w => w.id === p.id)} />
          ))}
        </div>
      </section>

      {/* Beauty Tips */}
      <section className="bl-section" style={{ background: 'var(--bl-bg-alt)' }}>
        <div className="bl-container">
          <div className="bl-section-header">
            <span className="bl-section-tag">From Our Blog</span>
            <h2 className="bl-section-title">Beauty Tips & Trends</h2>
          </div>
          <div className="bl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {TIPS.map((tip, i) => (
              <div key={i} className="bl-blog-card" onClick={() => state.navigate('category')}>
                <img src={tip.image} alt={tip.title} loading="lazy" />
                <div className="bl-blog-card-content">
                  <span className="bl-blog-tag">{tip.tag}</span>
                  <h3>{tip.title}</h3>
                  <p>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bl-section bl-container">
        <div className="bl-section-header">
          <span className="bl-section-tag">Testimonials</span>
          <h2 className="bl-section-title">What Our Customers Say</h2>
        </div>
        <div className="bl-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bl-testimonial-card">
              <img src={t.avatar} alt={t.name} />
              <div className="bl-testimonial-stars">{'★'.repeat(t.rating)}</div>
              <p>"{t.text}"</p>
              <h4>{t.name}</h4>
              <span className="bl-testimonial-role">{t.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bl-section" style={{ background: 'var(--bl-bg-alt)' }}>
        <div className="bl-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 className="bl-section-title">Join the Beauty Circle</h2>
          <p style={{ color: '#8a8a8a', marginBottom: '1.5rem' }}>Get exclusive offers, beauty tips, and 15% off your first order.</p>
          {newsletterDone ? (
            <p style={{ color: '#10b981', fontWeight: 600 }}>✓ You're subscribed! Welcome to the club.</p>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Enter your email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--bl-border)', borderRadius: '8px', fontFamily: 'inherit' }} />
              <button className="bl-btn bl-btn-gold" onClick={() => { if (newsletterEmail) setNewsletterDone(true); }}>Subscribe</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}