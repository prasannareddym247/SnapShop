import React from 'react';
export default function AboutPage({ state }) {
  return (
    <main style={{ padding: '3rem 4%', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '2rem', marginBottom: '1rem' }}>About</h1>
      <div style={{ height: '350px', overflow: 'hidden', marginBottom: '2rem', background: '#f5f5f5' }}>
        <img src="https://images.unsplash.com/photo-1530549387789-4c1017266634?w=1200&auto=format&fit=crop&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <p style={{ lineHeight: 1.8, color: '#333' }}>Sports Performance is built for athletes who demand more. Our gear combines cutting-edge fabric technology with ergonomic design to help you train harder, recover faster, and perform better. Every piece is tested by athletes, for athletes.</p>
    </main>
  );
}
