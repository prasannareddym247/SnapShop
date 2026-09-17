import React from 'react';
export default function AboutPage({ state }) {
  return (
    <div className="bl-container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Our Story</h1>
      <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', background: '#f8f5f1' }}>
        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <p style={{ lineHeight: 1.8, color: '#333', fontSize: '1rem' }}>Beauty Luxe was born from a passion for premium, clean beauty. We believe everyone deserves access to the finest skincare, makeup, and fragrance — curated with care and delivered with love. Our team of beauty experts travels the globe to bring you the most innovative, effective, and luxurious products. From our cruelty-free serums to our sustainably sourced ingredients, every product in our collection meets the highest standards of quality and ethics.</p>
    </div>
  );
}
