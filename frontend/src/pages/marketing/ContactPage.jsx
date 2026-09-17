import React, { useState } from 'react';
import '../../layouts/marketing.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <p className="section-tagline">GET IN TOUCH</p>
      <h1 className="section-main-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>We'd love to hear from you.</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', marginTop: '3rem' }}>
        {/* Contact details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '0.5rem' }}>📞 Call Us</h3>
            <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem' }}>+91 (800) 555-0199 (Mon-Fri 9am - 6pm IST)</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '0.5rem' }}>✉️ Email Support</h3>
            <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem' }}>support@snapshopplatform.com</p>
            <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem' }}>sales@snapshopplatform.com</p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--saas-primary)', marginBottom: '0.5rem' }}>🏢 Corporate Headquarters</h3>
            <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              SnapShop Technologies Private Limited,<br />
              Level 6, Brigade Tech Park, Whitefield,<br />
              Bangalore, Karnataka - 560066, India
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div style={{ background: 'white', padding: '2.5rem', border: '1px solid var(--saas-border)', borderRadius: '16px', boxShadow: 'var(--shadow-premium)' }}>
          {submitted && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#15803d', fontSize: '0.9rem' }}>
              ✓ Message sent successfully! Our merchant success team will get back to you shortly.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--saas-primary)', marginBottom: '0.4rem' }}>Your Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--saas-border)', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--saas-primary)', marginBottom: '0.4rem' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--saas-border)', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--saas-primary)', marginBottom: '0.4rem' }}>Subject</label>
              <input 
                type="text" 
                required 
                value={formData.subject} 
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--saas-border)', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--saas-primary)', marginBottom: '0.4rem' }}>Your Message</label>
              <textarea 
                rows="4" 
                required 
                value={formData.message} 
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--saas-border)', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }} 
              />
            </div>

            <button type="submit" className="m-btn m-btn-primary" style={{ width: '100%' }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
