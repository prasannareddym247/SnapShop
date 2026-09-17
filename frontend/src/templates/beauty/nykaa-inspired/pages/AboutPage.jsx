import React from 'react';

export default function AboutPage() {
  return (
    <div className="glam-page">
      <h1>About Glamour Nykaa</h1>
      <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>Glamour Nykaa is your premium beauty destination. We curate the finest skincare, makeup, haircare, and wellness products from the world's most trusted brands. Our mission is to make beauty accessible, enjoyable, and empowering for everyone.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', margin: '3rem 0' }}>
        {[{ title: 'Our Mission', text: 'To empower individuals to express their unique beauty through curated, high-quality products that inspire confidence.' }, { title: 'Our Values', text: 'Inclusivity, quality, transparency, and innovation. We believe beauty is for everyone.' }, { title: 'Our Community', text: 'A vibrant community of beauty enthusiasts sharing tips, reviews, and inspiration every day.' }].map((item, i) => (
          <div key={i} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '8px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{item.title}</h2>
            <p style={{ color: 'var(--glam-text-muted)', lineHeight: 1.7 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
