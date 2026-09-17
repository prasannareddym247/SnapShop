import React from 'react';
export default function ContactPage({ state }) {
  return (
    <div className="custom-page-container">
      <h2>Contact Us</h2>
      <p>Have questions? Reach out to us directly!</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <form onSubmit={e => { e.preventDefault(); alert('Message sent!'); }} style={{ display: 'grid', gap: '1rem' }}>
          <input type="text" required placeholder="Your Name" style={{ padding: '0.5rem' }} />
          <input type="email" required placeholder="Your Email" style={{ padding: '0.5rem' }} />
          <textarea required placeholder="Your Message" rows="5" style={{ padding: '0.5rem' }}></textarea>
          <button type="submit" className="custom-btn">Send Message</button>
        </form>
        <div>
          <h3>Merchant Info</h3>
          <p>📞 Phone: +91 98765 43210</p>
          <p>📧 Email: support@luxury-auto-inspired.com</p>
          <p>🏢 Address: India Tech Park, Building A, New Delhi</p>
        </div>
      </div>
    </div>
  );
}