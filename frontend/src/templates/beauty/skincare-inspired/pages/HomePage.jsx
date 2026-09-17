import React from 'react';

const CATEGORIES = [
  { name: 'Cleansers', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&auto=format&fit=crop&q=80', count: '45 Products' },
  { name: 'Serums', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=200&auto=format&fit=crop&q=80', count: '32 Products' },
  { name: 'Moisturizers', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&auto=format&fit=crop&q=80', count: '28 Products' },
  { name: 'Sun Care', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&auto=format&fit=crop&q=80', count: '18 Products' },
  { name: 'Face Masks', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&auto=format&fit=crop&q=80', count: '24 Products' },
  { name: 'Toners', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80', count: '15 Products' },
  { name: 'Eye Care', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&auto=format&fit=crop&q=80', count: '12 Products' },
  { name: 'Lip Care', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&auto=format&fit=crop&q=80', count: '10 Products' },
];

const CONCERNS = [
  { icon: '💧', title: 'Hydration', desc: 'Deep moisture boost for dry, dehydrated skin' },
  { icon: '✨', title: 'Brightening', desc: 'Even skin tone and natural radiance' },
  { icon: '🛡️', title: 'Anti-Aging', desc: 'Reduce fine lines and maintain youthfulness' },
  { icon: '🌿', title: 'Acne Care', desc: 'Gentle solutions for clear, healthy skin' },
  { icon: '☀️', title: 'Sun Protection', desc: 'Daily defense against UV damage' },
  { icon: '🌙', title: 'Night Care', desc: 'Overnight repair and rejuvenation' },
];

const INGREDIENTS = [
  { icon: '🧴', name: 'Hyaluronic Acid', desc: 'Holds 1000x its weight in water for deep hydration' },
  { icon: '🍊', name: 'Vitamin C', desc: 'Brightens skin and fights free radicals' },
  { icon: '🌿', name: 'Green Tea', desc: 'Soothes inflammation and protects skin' },
  { icon: '🌹', name: 'Rosehip Oil', desc: 'Rich in essential fatty acids for repair' },
  { icon: '🧈', name: 'Shea Butter', desc: 'Deeply nourishes and restores skin barrier' },
];

function ProductCard({ product, state }) {
  const [imgSrc, setImgSrc] = React.useState(product.image || product.imageUrl);
  const inWishlist = (state.wishlist || []).some(w => w.id === product.id);
  const price = product.discountedPrice != null ? product.discountedPrice : (product.price || 0);
  const original = product.originalPrice || (product.discountedPrice != null && product.discountedPrice < (product.price || 0) ? product.price : null);
  return (
    <div className="pure-product-card">
      <div className="pure-product-image" onClick={() => { state.setSelectedProduct(product); state.navigate('product'); }}>
        <img src={imgSrc} alt={product.name} onError={() => setImgSrc('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80')} />
        <div className="pure-badges">
          {original && <span className="pure-badge pure-badge-sale">Sale</span>}
        </div>
        <button className={`pure-wishlist ${inWishlist ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); state.toggleWishlist(product); }}>{inWishlist ? '♥' : '♡'}</button>
        <button className="pure-quickview" onClick={(e) => { e.stopPropagation(); state.setSelectedProduct(product); state.navigate('product'); }}>Quick View</button>
      </div>
      <div className="pure-product-info">
        <h3 className="pure-product-name">{product.name}</h3>
        <div className="pure-product-desc">{product.brand || ''}</div>
        <div className="pure-product-rating">{'★'.repeat(Math.floor(product.rating || 4))}{'☆'.repeat(5 - Math.floor(product.rating || 4))}<span>({product.reviews || product.reviewCount || 0})</span></div>
        <div className="pure-product-price">
          ₹{Number(price).toLocaleString('en-IN')}
          {original && <span className="original" style={{ textDecoration: 'line-through', marginLeft: '0.5rem', color: '#8a8a8a', fontSize: '0.78rem' }}>₹{Number(original).toLocaleString('en-IN')}</span>}
        </div>
        <button className="pure-product-atc" onClick={() => state.addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function HomePage({ state }) {
  const PRODUCTS = state.filteredProducts || [];
  const featured = PRODUCTS.slice(0, 4);
  const newArrivals = PRODUCTS.slice(0, 4);
  const bestSellers = [...PRODUCTS].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  const organic = PRODUCTS.filter(p => (p.category || '').toLowerCase().includes('skin') || (p.category || '').toLowerCase().includes('beauty')).slice(0, 4);
  const serums = PRODUCTS.filter(p => (p.name || '').toLowerCase().includes('serum')).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="pure-hero">
        <div className="pure-hero-content">
          <div className="pure-hero-badge">New Collection</div>
          <h1>Your Skin,<br /><span>Naturally Radiant</span></h1>
          <p>Discover clean, dermatologist-inspired skincare formulated with pure botanical ingredients for every skin type. Glow naturally with Pure SkinGlow.</p>
          <div className="pure-hero-actions">
            <button className="pure-btn-primary" onClick={() => state.navigate('category')}>Shop Now →</button>
            <button className="pure-btn-secondary" onClick={() => state.navigate('category')}>Explore Routine</button>
          </div>
        </div>
        <div className="pure-hero-visual">
          <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&auto=format&fit=crop&q=80" alt="Skincare" />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="pure-section">
        <div className="pure-section-header">
          <span className="pure-sub">Our Favorites</span>
          <h2>Featured Products</h2>
          <p>Handpicked essentials for your daily glow</p>
        </div>
        <div className="pure-product-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">Browse</span>
          <h2>Shop by Category</h2>
          <p>Find exactly what your skin needs</p>
        </div>
        <div className="pure-category-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="pure-category-card" onClick={() => { state.setSelectedCategory(cat.name); state.navigate('category'); }}>
              <div className="pure-category-image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <h3>{cat.name}</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--pure-text-muted)' }}>{cat.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="pure-section">
        <div className="pure-section-header">
          <span className="pure-sub">Just In</span>
          <h2>New Arrivals</h2>
          <p>Fresh from our lab to your skin</p>
        </div>
        <div className="pure-product-grid">
          {newArrivals.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* SHOP BY CONCERN */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">What Matters to You</span>
          <h2>Shop by Concern</h2>
          <p>Targeted solutions for every skincare need</p>
        </div>
        <div className="pure-concern-grid">
          {CONCERNS.map(c => (
            <div key={c.title} className="pure-concern-card" onClick={() => state.navigate('category')}>
              <div className="icon">{c.icon}</div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="pure-section">
        <div className="pure-promo">
          <h2>Glow From Within</h2>
          <p>Get 20% off your first order with code GLOW20. Free shipping on orders over ₹2,000.</p>
          <button className="pure-btn-primary" style={{ background: '#fff', color: 'var(--pure-text)' }} onClick={() => state.navigate('category')}>Shop the Sale →</button>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">Top Rated</span>
          <h2>Best Sellers</h2>
          <p>Loved by thousands of happy customers</p>
        </div>
        <div className="pure-product-grid">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* INGREDIENT SPOTLIGHT */}
      <section className="pure-section">
        <div className="pure-section-header">
          <span className="pure-sub">Learn About Ingredients</span>
          <h2>Ingredient Spotlight</h2>
          <p>We believe in transparency — know what goes on your skin</p>
        </div>
        <div className="pure-ingredient-grid">
          {INGREDIENTS.map(ing => (
            <div key={ing.name} className="pure-ingredient-card">
              <div className="ing-icon">{ing.icon}</div>
              <h4>{ing.name}</h4>
              <p>{ing.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY ROUTINE */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">Step by Step</span>
          <h2>Your Daily Skincare Routine</h2>
          <p>Simple steps for a radiant complexion</p>
        </div>
        <div className="pure-routine">
          {[
            { step: '01', title: 'Cleanse', desc: 'Remove impurities with our gentle cleansers' },
            { step: '02', title: 'Tone', desc: 'Balance pH with soothing toner mists' },
            { step: '03', title: 'Treat', desc: 'Target concerns with serums and treatments' },
            { step: '04', title: 'Moisturize', desc: 'Lock in hydration with nourishing creams' },
            { step: '05', title: 'Protect', desc: 'Defend your skin with daily SPF' },
          ].map(r => (
            <div key={r.step} className="pure-routine-step">
              <div className="step-num">{r.step}</div>
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ORGANIC COLLECTION */}
      <section className="pure-section">
        <div className="pure-section-header">
          <span className="pure-sub">Clean Beauty</span>
          <h2>Organic Collection</h2>
          <p>100% natural ingredients, zero compromises</p>
        </div>
        <div className="pure-product-grid">
          {organic.map(p => <ProductCard key={p.id} product={p} state={state} />)}
        </div>
      </section>

      {/* BEFORE & AFTER */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">Real Results</span>
          <h2>Before & After</h2>
          <p>See the transformation with our products</p>
        </div>
        <div className="pure-ba-grid">
          {[
            { before: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&auto=format&fit=crop&q=80', after: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&auto=format&fit=crop&q=80', name: 'Maria K.', duration: '4 weeks' },
            { before: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&auto=format&fit=crop&q=80', after: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=300&auto=format&fit=crop&q=80', name: 'Sarah L.', duration: '6 weeks' },
            { before: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&auto=format&fit=crop&q=80', after: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80', name: 'Emma R.', duration: '8 weeks' },
          ].map((ba, i) => (
            <div key={i} className="pure-ba-card">
              <div className="pure-ba-images">
                <img src={ba.before} alt="Before" />
                <img src={ba.after} alt="After" />
              </div>
              <div className="pure-ba-info">
                <h4>{ba.name}</h4>
                <span>Results after {ba.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL OFFERS */}
      <section className="pure-section">
        <div className="pure-section-header">
          <span className="pure-sub">Offers</span>
          <h2>Seasonal Promotions</h2>
          <p>Great deals on your favorite skincare</p>
        </div>
        <div className="pure-promo-grid">
          {[
            { icon: '🎁', title: 'Gift Sets', desc: 'Curated skincare sets for every budget' },
            { icon: '📦', title: 'Buy More, Save More', desc: 'Get 15% off on orders over ₹5,000' },
            { icon: '🌟', title: 'Loyalty Rewards', desc: 'Earn points with every purchase' },
          ].map((promo, i) => (
            <div key={i} className="pure-promo-card" onClick={() => state.navigate('category')}>
              <div className="icon">{promo.icon}</div>
              <h4>{promo.title}</h4>
              <p>{promo.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">Testimonials</span>
          <h2>What Our Customers Say</h2>
          <p>Real reviews from real skin</p>
        </div>
        <div className="pure-testimonials">
          {[
            { name: 'Anna M.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', stars: 5, text: 'My skin has never looked better! The products transformed my complexion.' },
            { name: 'Jessica P.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', stars: 5, text: 'Finally found a brand that truly cares about ingredients. Amazing quality!' },
            { name: 'David L.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', stars: 4, text: 'Premium products with visible results. Highly recommend.' },
          ].map((t, i) => (
            <div key={i} className="pure-testimonial">
              <div className="avatar"><img src={t.avatar} alt={t.name} /></div>
              <div className="stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
              <p>"{t.text}"</p>
              <h4>{t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section className="pure-section">
        <div className="pure-section-header">
          <span className="pure-sub">From Our Blog</span>
          <h2>Skincare Tips & Stories</h2>
          <p>Expert advice for your skincare journey</p>
        </div>
        <div className="pure-blog-grid">
          {[
            { tag: 'Routine', title: 'The Ultimate Morning Skincare Routine', desc: 'Start your day with these simple steps for glowing skin.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&auto=format&fit=crop&q=80' },
            { tag: 'Ingredients', title: 'Understanding Hyaluronic Acid', desc: 'Learn why this powerhouse ingredient is essential for hydration.', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&auto=format&fit=crop&q=80' },
            { tag: 'Seasonal', title: 'Summer Skincare: How to Protect Your Skin', desc: 'Tips for keeping your skin healthy during warmer months.', img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&auto=format&fit=crop&q=80' },
          ].map((blog, i) => (
            <div key={i} className="pure-blog-card" onClick={() => state.navigate('about')}>
              <img src={blog.img} alt={blog.title} />
              <div className="pure-blog-content">
                <div className="tag">{blog.tag}</div>
                <h4>{blog.title}</h4>
                <p>{blog.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="pure-section-full" style={{ background: 'var(--pure-bg-alt)', padding: '5rem 0' }}>
        <div className="pure-section-header" style={{ padding: '0 2rem' }}>
          <span className="pure-sub">Follow Us</span>
          <h2>@PureSkinGlow</h2>
          <p>Tag us in your skincare journey</p>
        </div>
        <div className="pure-instagram-grid">
          {[
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
          ].map((url, i) => (
            <div key={i} className="pure-instagram-item">
              <img src={url} alt={`Instagram ${i + 1}`} />
              <div className="ig-overlay">📸</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="pure-section">
        <div className="pure-newsletter">
          <h2>Stay Glowing</h2>
          <p>Subscribe for exclusive skincare tips, new arrivals, and special offers.</p>
          <div className="pure-newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button onClick={() => alert('Subscribed! Welcome to the Pure SkinGlow family.')}>Subscribe</button>
          </div>
        </div>
      </section>

      {/* FEATURED BRANDS */}
      <section className="pure-section-alt">
        <div className="pure-section-header">
          <span className="pure-sub">Our Brands</span>
          <h2>Featured Brands</h2>
          <p>Trusted names in clean skincare</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {['PureGlow', 'GlowLab', 'DewDrops', 'SunGuard', 'Herbaluxe', 'Botanicore'].map(b => (
            <div key={b} onClick={() => state.navigate('category')} style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.1rem', color: 'var(--pure-primary)', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.7'}>{b}</div>
          ))}
        </div>
      </section>
    </div>
  );
}