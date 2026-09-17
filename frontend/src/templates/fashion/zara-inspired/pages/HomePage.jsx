import React, { useState } from 'react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&auto=format&fit=crop&q=80';
const COLLECTION_IMAGES = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop&q=80',
];
const PROMO_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&auto=format&fit=crop&q=80';
const EDITORIAL_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80', label: 'THE EDIT', title: 'Effortless Elegance', desc: 'Soft tailoring and neutral tones define this season\'s minimalist approach.' },
  { src: 'https://images.unsplash.com/photo-1581044777550-4c0a0e1f7f3b?w=900&auto=format&fit=crop&q=80', label: 'TRENDING', title: 'Modern Silhouettes', desc: 'Bold cuts and architectural forms reimagine contemporary dressing.' },
];

export default function HomePage({ state }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const featured = state.filteredProducts?.slice(0, 4) || [];

  const handleProductClick = (product) => {
    state.setSelectedProduct(product);
    state.navigate('product');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <main className="zara-template">
      <HeroSection />
      <CollectionSection onNavClick={(gender) => { state.setGenderFilter(gender); state.navigate('category'); }} />
      <SectionTitle title="New Arrivals" subtitle="The latest additions to our collection" />
      <ProductGridSection products={state.filteredProducts?.slice(0, 8) || []} state={state} />
      <PromoBanner />
      <SectionTitle title="Trending Now" subtitle="Most sought-after pieces this season" />
      <ProductGridSection products={state.filteredProducts?.slice(4, 12) || []} state={state} />
      <EditorialSection />
      <NewsletterSection email={newsletterEmail} setEmail={setNewsletterEmail} subscribed={newsletterSubscribed} onSubmit={handleNewsletterSubmit} />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="zara-hero">
      <img src={HERO_IMAGE} alt="Spring Collection" className="zara-hero-image" loading="eager" />
      <div className="zara-hero-content">
        <p className="zara-hero-subtitle">Spring Summer 2026</p>
        <h1 className="zara-hero-title">The Art of Less</h1>
        <p className="zara-hero-desc">Discover a curated collection defined by clean lines, premium fabrics, and understated elegance.</p>
        <button className="zara-btn">Explore Collection</button>
      </div>
    </section>
  );
}

function CollectionSection({ onNavClick }) {
  return (
    <section className="zara-section">
      <SectionTitle title="Curated Collections" subtitle="Designed for every moment" />
      <div className="zara-grid-2">
        <div className="zara-collection-card">
          <img src={COLLECTION_IMAGES[0]} alt="Women's Collection" className="zara-collection-image" loading="lazy" />
          <div className="zara-collection-overlay">
            <h3 className="zara-collection-title">Women's Edit</h3>
            <button className="zara-collection-link" onClick={() => onNavClick('women')}>Shop Now →</button>
          </div>
        </div>
        <div className="zara-collection-card">
          <img src={COLLECTION_IMAGES[1]} alt="Men's Collection" className="zara-collection-image" loading="lazy" />
          <div className="zara-collection-overlay">
            <h3 className="zara-collection-title">Men's Edit</h3>
            <button className="zara-collection-link" onClick={() => onNavClick('men')}>Shop Now →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ padding: '0 4%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <h2 className="zara-section-title">{title}</h2>
      {subtitle && <p className="zara-section-subtitle">{subtitle}</p>}
    </div>
  );
}

function ProductGridSection({ products, state }) {
  if (!products.length) {
    return (
      <section className="zara-section" style={{ textAlign: 'center', paddingTop: '1rem' }}>
        <p style={{ color: '#757575', fontSize: '0.9rem' }}>Loading products...</p>
      </section>
    );
  }

  return (
    <section className="zara-section" style={{ paddingTop: '1rem' }}>
      <div className="zara-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            state={state}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, state }) {
  const isWishlisted = state.wishlist?.some(w => w.id === product.id);

  return (
    <div className="zara-product-card" onClick={() => {
      state.setSelectedProduct(product);
      state.navigate('product');
    }}>
      <div className="zara-product-image-wrap">
        <img
          src={product.image || `https://placehold.co/400x533/f5f5f5/aaa?text=${encodeURIComponent(product.name || 'Product')}`}
          alt={product.name}
          className="zara-product-image"
          loading="lazy"
        />
        {product.hoverImage && (
          <img src={product.hoverImage} alt="" className="zara-product-hover-image" loading="lazy" />
        )}
        {product.badge && <span className="zara-product-badge">{product.badge}</span>}
        <button
          className="zara-wishlist-btn"
          onClick={e => { e.stopPropagation(); state.toggleWishlist(product); }}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
        <button className="zara-quick-view" onClick={e => {
          e.stopPropagation();
          state.setSelectedProduct(product);
          state.navigate('product');
        }}>
          Quick View
        </button>
      </div>
      <div className="zara-product-info">
        {product.brand && <div className="zara-product-brand">{product.brand}</div>}
        <h3 className="zara-product-name">{product.name}</h3>
        <div>
          <span className="zara-product-price">₹{product.price}</span>
          {product.originalPrice && <span className="zara-product-original-price">₹{product.originalPrice}</span>}
        </div>
      </div>
    </div>
  );
}

function PromoBanner() {
  return (
    <div className="zara-promo-banner">
      <img src={PROMO_IMAGE} alt="Season Sale" className="zara-promo-image" loading="lazy" />
      <div className="zara-promo-content">
        <p className="zara-promo-tag">Limited Time</p>
        <h2 className="zara-promo-title">Mid-Season Edit</h2>
        <p className="zara-promo-desc">Select styles at reduced prices. While stocks last.</p>
        <button className="zara-btn">Shop Sale</button>
      </div>
    </div>
  );
}

function EditorialSection() {
  return (
    <section className="zara-editorial" style={{ marginBottom: '3rem' }}>
      {EDITORIAL_IMAGES.map((item, idx) => (
        <div key={idx} className="zara-editorial-card">
          <img src={item.src} alt={item.title} className="zara-editorial-image" loading="lazy" />
          <div className="zara-editorial-overlay">
            <p className="zara-editorial-label">{item.label}</p>
            <h3 className="zara-editorial-title">{item.title}</h3>
            <p className="zara-editorial-desc">{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function NewsletterSection({ email, setEmail, subscribed, onSubmit }) {
  return (
    <section className="zara-newsletter">
      <h2 className="zara-newsletter-title">Join Our World</h2>
      <p className="zara-newsletter-desc">Be the first to know about new arrivals, exclusive drops, and members-only offers.</p>
      {subscribed ? (
        <p style={{ fontSize: '0.9rem', color: '#111' }}>Thank you for subscribing! Check your inbox for a welcome offer.</p>
      ) : (
        <form className="zara-newsletter-form" onSubmit={onSubmit}>
          <input
            className="zara-newsletter-input"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="zara-newsletter-submit" type="submit">Subscribe</button>
        </form>
      )}
    </section>
  );
}
