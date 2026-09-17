import React from 'react';
import ProductGrid from '../../../_shared/components/ProductGrid';
import { demoProducts, demoCategories } from '../../../_shared/data/demoProducts';

export default function HomePage({ state }) {
  const featured = demoProducts.slice(0, 4);

  return (
    <div>
      <section className="custom-hero">
        <div className="custom-hero-text">
          <span className="custom-badge">ModFurniture Design Exclusive</span>
          <h1>Sleek Contemporary Sofas</h1>
          <p>Architect-designed fabric sofas, marble tables, sleek metal shelving, and custom leather chairs.</p>
          <button className="custom-btn" onClick={() => state.navigate('category')}>Shop Now ✨</button>
        </div>
        <div className="custom-hero-visual">
          <img src="https://placehold.co/500x400/e2e8f0/475569?text=Mod%20Sofa" alt="Hero Visual" className="custom-hero-img" />
        </div>
      </section>

      <section className="custom-section">
        <div className="custom-section-header">
          <h2>Featured Categories</h2>
          <p>Browse through our handpicked selections</p>
        </div>
        <div className="custom-category-grid">
          {demoCategories.slice(0, 4).map(cat => (
            <div key={cat.id} className="custom-category-card" onClick={() => { state.setSelectedCategory(cat.name); state.navigate('category'); }}>
              <div className="custom-category-icon" style={{ background: '#e2e8f0' }}>{cat.icon}</div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="custom-section">
        <div className="custom-section-header">
          <h2>Hot Deals & Offers</h2>
        </div>
        <div className="custom-deal-banner">
          <h2>🔥 Mega Sale — Save Big Today!</h2>
          <p>Get exclusive coupons and checkout discounts on all featured arrivals.</p>
        </div>
      </section>

      <section className="custom-section">
        <div className="custom-section-header">
          <h2>Trending Bestsellers</h2>
        </div>
        <ProductGrid
          products={featured}
          onAddToCart={state.addToCart}
          onWishlistToggle={state.toggleWishlist}
          wishlistIds={state.wishlist.map(p => p.id)}
          onProductClick={(p) => state.navigate('product', p)}
        />
      </section>

      <section className="custom-section">
        <div className="custom-newsletter">
          <h3>Subscribe to Newsletter</h3>
          <p>Stay up to date with new arrivals, product drops, and exclusive discounts.</p>
          <div className="custom-newsletter-form">
            <input type="email" placeholder="your.email@domain.com" />
            <button onClick={() => alert('Thanks for subscribing!')}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}