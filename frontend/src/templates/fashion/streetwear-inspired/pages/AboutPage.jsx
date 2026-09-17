import React from 'react';

export default function AboutPage() {
  return (
    <div className="urban-page">
      <h1>About UrbanHype</h1>
      <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>UrbanHype was born from the streets. Founded in 2020, we set out to create a brand that represents the raw energy, creativity, and authenticity of urban culture. Every drop is carefully curated to bring you the freshest streetwear and lifestyle essentials.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', margin: '3rem 0' }}>
        {[{ title: 'Our Mission', text: 'To provide premium streetwear that empowers self-expression and defines urban culture worldwide.' }, { title: 'Our Values', text: 'Authenticity, creativity, quality, and community. We drop limited runs to keep things exclusive.' }, { title: 'Our Community', text: 'A global movement of trendsetters, sneakerheads, and street culture enthusiasts.' }].map((item, i) => (
          <div key={i} style={{ background: 'var(--sw-surface)', border: '1px solid var(--sw-border)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.title}</h2>
            <p style={{ color: 'var(--sw-text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
