import React from 'react';

export default function AboutPage() {
  return (
    <div className="pure-page" style={{ maxWidth: '800px' }}>
      <h1>About Pure SkinGlow</h1>
      <div style={{ display: 'grid', gap: '2rem' }}>
        <section>
          <h2>Our Story</h2>
          <p>Pure SkinGlow was born from a simple belief: that healthy, radiant skin comes from nature's finest ingredients. Founded by dermatologists and wellness experts, we set out to create a skincare line that delivers real results without compromising on purity.</p>
          <p>Every product in our collection is formulated with clinically-proven natural ingredients, free from harsh chemicals, parabens, and synthetic fragrances. We believe in transparency — you deserve to know exactly what goes on your skin.</p>
        </section>
        <section>
          <h2>Our Philosophy</h2>
          <p>We follow three guiding principles: <strong>Pure Ingredients</strong> — sourcing only the highest quality natural components; <strong>Proven Results</strong> — backing every formula with dermatological research; and <strong>Sustainable Beauty</strong> — committing to eco-friendly packaging and ethical practices.</p>
        </section>
        <section>
          <h2>Why Choose Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🌿', title: '100% Natural', desc: 'No harsh chemicals or synthetic additives' },
              { icon: '🔬', title: 'Dermatologist Approved', desc: 'Formulated by skincare experts' },
              { icon: '🌍', title: 'Eco-Friendly', desc: 'Sustainable packaging and practices' },
              { icon: '🐰', title: 'Cruelty-Free', desc: 'Never tested on animals' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h4 style={{ fontFamily: 'var(--pure-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.25rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--pure-text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2>Our Commitment</h2>
          <p>We are committed to clean beauty that cares for both your skin and the planet. From our recyclable packaging to our carbon-neutral shipping, every aspect of Pure SkinGlow is designed with sustainability in mind. We partner with local farmers and ethical suppliers to bring you the purest ingredients nature has to offer.</p>
        </section>
      </div>
    </div>
  );
}
