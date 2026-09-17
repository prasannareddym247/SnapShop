import React, { useState } from 'react';

const HERO_IMG = 'https://images.unsplash.com/photo-1530549387789-4c1017266634?w=1920&auto=format&fit=crop&q=80';
const SPORT_IMAGES = [
  { name: 'Running', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80', count: '124 products' },
  { name: 'Training', img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&auto=format&fit=crop&q=80', count: '89 products' },
  { name: 'Basketball', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80', count: '67 products' },
  { name: 'Yoga', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80', count: '53 products' },
  { name: 'Football', img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80', count: '78 products' },
];
const PROMO_IMG = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&auto=format&fit=crop&q=80';
const LIFESTYLE_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop&q=80', tag: 'TRAIN HARD', title: 'FIND YOUR PACE', desc: 'Every stride counts. Discover running gear built for distance, speed, and endurance.' },
  { src: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&auto=format&fit=crop&q=80', tag: 'FUEL YOUR FIRE', title: 'TRAIN WITH PURPOSE', desc: 'From the gym to the track, our training collection delivers maximum performance.' },
];
const TESTIMONIALS = [
  { name: 'Arjun Mehta', title: 'Marathon Runner', text: 'The most comfortable training gear I have ever worn. The quality and fit are unmatched — truly game-changing for my daily runs.', rating: 5, avatar: 'AM' },
  { name: 'Priya Sharma', title: 'Fitness Coach', text: 'My clients love the durability and performance of this collection. Breathable fabrics that move with you.', rating: 5, avatar: 'PS' },
  { name: 'Rohit Verma', title: 'Basketball Player', text: 'Finally found gear that keeps up with my game. The flexibility and moisture-wicking tech is incredible.', rating: 4, avatar: 'RV' },
];

const SAMPLE_PRODUCTS = [
  { id: 'sp1', name: 'Pro Dri-FIT Running Tee', brand: 'SPORTS PERFORMANCE', price: 2499, originalPrice: 3499, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#fff', '#00e676'], badge: 'SALE' },
  { id: 'sp2', name: 'Air Zoom Performance Sneakers', brand: 'SPORTS PERFORMANCE', price: 7999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#fff', '#e74c3c'], badge: 'NEW' },
  { id: 'sp3', name: 'Flex Training Shorts', brand: 'SPORTS PERFORMANCE', price: 1899, originalPrice: 2499, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#2c3e50'], badge: 'SALE' },
  { id: 'sp4', name: 'Thermal Pro Jacket', brand: 'SPORTS PERFORMANCE', price: 5499, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#2c3e50', '#555'], badge: '' },
  { id: 'sp5', name: 'Compression Leggings', brand: 'SPORTS PERFORMANCE', price: 2999, image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#fff', '#555'], badge: 'NEW' },
  { id: 'sp6', name: 'Sports Bra — High Support', brand: 'SPORTS PERFORMANCE', price: 2199, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#fff', '#00e676'], badge: 'NEW' },
  { id: 'sp7', name: 'Ultra-Light Running Vest', brand: 'SPORTS PERFORMANCE', price: 3999, originalPrice: 4999, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&auto=format&fit=crop&q=80', colors: ['#00e676', '#000', '#fff'], badge: 'SALE' },
  { id: 'sp8', name: 'Performance Cap', brand: 'SPORTS PERFORMANCE', price: 999, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80', hoverImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80', colors: ['#000', '#fff', '#00e676', '#e74c3c'], badge: '' },
];

export default function HomePage({ state }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleProductClick = (product) => {
    state.setSelectedProduct({ ...product, images: [product.image, product.hoverImage].filter(Boolean) });
    state.navigate('product');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) { setSubscribed(true); setNewsletterEmail(''); }
  };

  const activeProducts = state.filteredProducts && state.filteredProducts.length > 0 ? state.filteredProducts : SAMPLE_PRODUCTS;

  return (
    <main>
      <HeroSection />
      <CollectionSection onNavClick={(v) => { if (v === 'men') { state.setGenderFilter('men'); state.navigate('category'); } else if (v === 'women') { state.setGenderFilter('women'); state.navigate('category'); } else { state.setGenderFilter(null); state.navigate(v); } }} />
      <NewArrivalsSection products={activeProducts.slice(0, 4)} onProductClick={handleProductClick} state={state} />
      <BestSellersSection products={activeProducts.slice(4, 8)} onProductClick={handleProductClick} state={state} />
      <ShopBySportSection />
      <PromoBanner />
      <FeaturedCategoriesSection onNavClick={(v) => state.navigate(v)} />
      <LifestyleSection />
      <TestimonialsSection />
      <NewsletterSection email={newsletterEmail} setEmail={setNewsletterEmail} subscribed={subscribed} onSubmit={handleNewsletterSubmit} />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="sp-hero">
      <img src={HERO_IMG} alt="Performance Collection" className="sp-hero-image" loading="eager" />
      <div className="sp-hero-content">
        <span className="sp-hero-tag">2026 Collection</span>
        <h1 className="sp-hero-title">UNLEASH YOUR POTENTIAL</h1>
        <p className="sp-hero-subtitle">Engineered for champions. Premium sportswear designed to push your limits and elevate your performance.</p>
        <button className="sp-btn">Shop Collection</button>
      </div>
    </section>
  );
}

function CollectionSection({ onNavClick }) {
  return (
    <section className="sp-section" style={{ paddingBottom: '1rem' }}>
      <div className="sp-section-header">
        <div>
          <h2 className="sp-section-title">Featured Collection</h2>
          <p className="sp-section-subtitle">Curated performance gear for every athlete</p>
        </div>
        <button className="sp-view-all" onClick={() => onNavClick('category')}>View All →</button>
      </div>
      <div className="sp-grid-2">
        <div className="sp-product-card sp-customizable" onClick={() => onNavClick('men')} style={{ cursor: 'pointer' }}>
          <span className="sp-customize-badge">Customizable</span>
          <div className="sp-product-image-wrap">
            <img src="https://images.unsplash.com/photo-1530549387789-4c1017266634?w=800&auto=format&fit=crop&q=80" alt="Men's Performance" className="sp-product-image" loading="lazy" />
          </div>
          <div className="sp-product-info">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>Men's Performance</h3>
            <p style={{ fontSize: '0.8rem', color: '#757575', margin: '0.25rem 0 0' }}>Training, running, and lifestyle gear</p>
          </div>
        </div>
        <div className="sp-product-card sp-customizable" onClick={() => onNavClick('women')} style={{ cursor: 'pointer' }}>
          <span className="sp-customize-badge">Customizable</span>
          <div className="sp-product-image-wrap">
            <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80" alt="Women's Training" className="sp-product-image" loading="lazy" />
          </div>
          <div className="sp-product-info">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>Women's Training</h3>
            <p style={{ fontSize: '0.8rem', color: '#757575', margin: '0.25rem 0 0' }}>Support, style, and performance</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, onViewAll }) {
  return (
    <div className="sp-section-header">
      <div>
        <h2 className="sp-section-title">{title}</h2>
        {subtitle && <p className="sp-section-subtitle">{subtitle}</p>}
      </div>
      {onViewAll && <button className="sp-view-all" onClick={onViewAll}>View All →</button>}
    </div>
  );
}

function ProductCard({ product, onProductClick, state, showColors = true }) {
  const isWishlisted = state.wishlist?.some(w => w.id === product.id);
  return (
    <div className="sp-product-card sp-customizable" onClick={() => onProductClick(product)}>
      <span className="sp-customize-badge">Customizable</span>
      <div className="sp-product-image-wrap">
        <img src={product.image} alt={product.name} className="sp-product-image" loading="lazy" />
        {product.hoverImage && product.hoverImage !== product.image && (
          <img src={product.hoverImage} alt="" className="sp-product-image-hover" loading="lazy" />
        )}
        {product.badge && (
          <span className={`sp-product-badge ${product.badge === 'NEW' ? 'sp-product-badge-new' : ''}`}>{product.badge}</span>
        )}
        <button className="sp-product-wishlist" onClick={e => { e.stopPropagation(); state.toggleWishlist(product); }}>
          {isWishlisted ? '♥' : '♡'}
        </button>
      </div>
      <div className="sp-product-info">
        <div className="sp-product-brand">{product.brand}</div>
        <h3 className="sp-product-name">{product.name}</h3>
        <div>
          <span className="sp-product-price">₹{product.price}</span>
          {product.originalPrice && <span className="sp-product-og-price">₹{product.originalPrice}</span>}
        </div>
        {showColors && product.colors && (
          <div className="sp-color-dots">
            {product.colors.map((c, i) => (
              <span key={i} className="sp-color-dot" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewArrivalsSection({ products, onProductClick, state }) {
  return (
    <section className="sp-section">
      <SectionHeader title="New Arrivals" subtitle="Fresh drops to elevate your game" onViewAll={() => state.navigate('category')} />
      <div className="sp-grid">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onProductClick={onProductClick} state={state} />
        ))}
      </div>
    </section>
  );
}

function BestSellersSection({ products, onProductClick, state }) {
  return (
    <section className="sp-section-dark">
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <SectionHeader title="Best Sellers" subtitle="Most wanted by athletes like you" onViewAll={() => state.navigate('category')} />
        <div className="sp-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onProductClick={onProductClick} state={state} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopBySportSection() {
  return (
    <section className="sp-section">
      <SectionHeader title="Shop by Sport" subtitle="Find gear tailored to your discipline" />
      <div className="sp-sport-grid">
        {SPORT_IMAGES.map((sport, i) => (
          <div key={i} className="sp-sport-card sp-customizable">
            <span className="sp-customize-badge">Customizable</span>
            <img src={sport.img} alt={sport.name} className="sp-sport-image" loading="lazy" />
            <div className="sp-sport-overlay">
              <h3 className="sp-sport-name">{sport.name}</h3>
              <p className="sp-sport-count">{sport.count}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <div className="sp-promo">
      <img src={PROMO_IMG} alt="Season Sale" className="sp-promo-image" loading="lazy" />
      <div className="sp-promo-content">
        <p className="sp-promo-tag">Limited Edition</p>
        <h2 className="sp-promo-title">FUTURE DROP</h2>
        <p className="sp-promo-desc">Be first to wear tomorrow's tech. Pre-order the latest performance innovation.</p>
        <button className="sp-btn">Pre-Order Now</button>
      </div>
    </div>
  );
}

function FeaturedCategoriesSection({ onNavClick }) {
  const cats = [
    { name: 'Footwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
    { name: 'Apparel', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80' },
    { name: 'Accessories', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80' },
    { name: 'Equipment', img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&auto=format&fit=crop&q=80' },
  ];
  return (
    <section className="sp-section sp-section-light">
      <SectionHeader title="Featured Categories" subtitle="Explore our curated collections" />
      <div className="sp-cat-grid">
        {cats.map((cat, i) => (
          <div key={i} className="sp-cat-card sp-customizable" onClick={() => onNavClick('category')}>
            <span className="sp-customize-badge">Customizable</span>
            <img src={cat.img} alt={cat.name} className="sp-cat-image" loading="lazy" />
            <div className="sp-cat-overlay">
              <h3 className="sp-cat-name">{cat.name}</h3>
              <button className="sp-cat-link">Shop Now →</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LifestyleSection() {
  return (
    <section className="sp-lifestyle" style={{ marginBottom: '3rem' }}>
      {LIFESTYLE_IMAGES.map((item, idx) => (
        <div key={idx} className="sp-lifestyle-card">
          <img src={item.src} alt={item.title} className="sp-lifestyle-image" loading="lazy" />
          <div className="sp-lifestyle-overlay">
            <p className="sp-lifestyle-tag">{item.tag}</p>
            <h3 className="sp-lifestyle-title">{item.title}</h3>
            <p className="sp-lifestyle-desc">{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="sp-section sp-section-light">
      <SectionHeader title="What Athletes Say" subtitle="Real reviews from real performers" />
      <div className="sp-testimonials">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="sp-testimonial">
            <div className="sp-testimonial-stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
            <p className="sp-testimonial-text">"{t.text}"</p>
            <div className="sp-testimonial-author">
              <div className="sp-testimonial-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#555' }}>{t.avatar}</div>
              <div>
                <p className="sp-testimonial-name">{t.name}</p>
                <p className="sp-testimonial-title">{t.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection({ email, setEmail, subscribed, onSubmit }) {
  return (
    <section className="sp-newsletter">
      <h2 className="sp-newsletter-title">Stay in the Game</h2>
      <p className="sp-newsletter-desc">Get exclusive access to new drops, athlete stories, and members-only pricing.</p>
      {subscribed ? (
        <p style={{ color: '#00e676', fontWeight: 600 }}>✓ You're in! Welcome to the team.</p>
      ) : (
        <form className="sp-newsletter-form" onSubmit={onSubmit}>
          <input className="sp-newsletter-input" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button className="sp-newsletter-btn" type="submit">Subscribe</button>
        </form>
      )}
    </section>
  );
}
