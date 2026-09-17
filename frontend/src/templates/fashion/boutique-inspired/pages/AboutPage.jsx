import React from 'react';

export default function AboutPage() {
  return (
    <div className="mb-page" style={{ maxWidth: '800px' }}>
      <h1>About Maison de Beaute</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2>Our Heritage</h2>
          <p>Founded in the heart of Paris, Maison de Beaute has been synonymous with luxury beauty since 1927. For nearly a century, we have curated the world's finest cosmetics, skincare, and fragrances, bringing the elegance of French beauty to discerning clientele across the globe.</p>
          <p>Our atelier, nestled in the prestigious Golden Triangle of Paris, has welcomed generations of beauty connoisseurs seeking the extraordinary. We maintain relationships with the most esteemed beauty maisons, many of whom have trusted us as their exclusive partner for decades.</p>
        </section>
        <section>
          <h2>The Maison Philosophy</h2>
          <p>At Maison de Beaute, we believe that beauty is an art form. Every product in our collection is selected for its exceptional quality, craftsmanship, and ability to inspire. We champion the belief that luxury is not merely about price — it is about experience, heritage, and the meticulous attention to detail that transforms the ordinary into the extraordinary.</p>
        </section>
        <section>
          <h2>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '🎨', title: 'Artistry', desc: 'Celebrating beauty as an art form with every product we curate.' },
              { icon: '🌿', title: 'Sustainability', desc: 'Commitment to responsible luxury and ethical sourcing.' },
              { icon: '🤝', title: 'Exclusivity', desc: 'Forging unique partnerships with the world\'s finest beauty houses.' },
              { icon: '✨', title: 'Excellence', desc: 'Uncompromising standards in every aspect of our service.' },
            ].map((v, i) => (
              <div key={i} style={{ background: 'var(--mb-bg-alt)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{v.icon}</div>
                <h4 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.25rem' }}>{v.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--mb-text-muted)', lineHeight: 1.6, fontWeight: 300 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2>Our Concierge</h2>
          <p>Every Maison de Beaute client is assigned a personal beauty concierge — a knowledgeable expert trained in the finest traditions of French luxury service. From personalized product recommendations to exclusive event invitations, our concierge ensures that every interaction with Maison de Beaute is nothing short of exceptional.</p>
        </section>
      </div>
    </div>
  );
}
