import React from 'react';

export default function AboutPage({ state }) {
  return (
    <main className="zara-template" style={{ padding: '3rem 4%', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>About Us</h1>
      <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>Our story, our values, our vision</p>

      <div style={{ height: '400px', overflow: 'hidden', marginBottom: '2.5rem', background: '#f5f5f5' }}>
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80"
          alt="About ZARA MODE"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>

      <div style={{ lineHeight: '1.8', fontSize: '0.9rem', color: '#333' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          ZARA MODE was born from a simple belief: fashion should be both beautiful and effortless. 
          We curate pieces that transcend seasons — timeless designs crafted from premium materials, 
          made to be worn and loved for years.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Our collections draw inspiration from the clean lines of modern architecture, the precision 
          of fine tailoring, and the ease of contemporary living. Every piece is designed with 
          intention, from the drape of a fabric to the placement of a seam.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          We believe in the power of less — fewer, better things. Our edit is carefully curated to 
          help you build a wardrobe of essentials that work together, season after season.
        </p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 400, margin: '2rem 0 1rem' }}>Our Values</h2>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Quality First</strong> — We source the finest materials and work with skilled artisans.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Timeless Design</strong> — We create pieces that transcend trends and seasons.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Sustainable Practices</strong> — We are committed to reducing our environmental footprint.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Inclusive Sizing</strong> — Fashion is for everyone. Our collections span XS-3XL.</li>
        </ul>
      </div>
    </main>
  );
}
