import React, { useState } from 'react';
import '../../layouts/marketing.css';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      q: "What is SnapShop Platform?",
      a: "SnapShop is a multi-seller store builder software platform. It allows merchants, store owners, and businesses to deploy self-hosted or cloud-hosted digital storefronts to sell gadgets, apparel, books, or utilities to customers worldwide."
    },
    {
      q: "Can I manage product variations?",
      a: "Yes! The product catalog supports variations of products (e.g. storage size for phones, models for electronics, sizes for clothing). Variants can be assigned unique prices and individual inventory track logs."
    },
    {
      q: "How does the checkout billing system work?",
      a: "When customer checkout orders are placed, the application validates stock constraints. Once complete, it outputs a printable tax invoice PDF detailing items, variants, merchant details, and total checkout figures."
    },
    {
      q: "Is there a B2B option?",
      a: "No, the B2B role has been removed. Account registrations support Customers and Sellers (Store Owners)."
    },
    {
      q: "How do I import products?",
      a: "Store Owners can add products manually via the Store Dashboard, use the AI content generator helper to seed names and tags, or bulk-seed catalogs through standard import configurations."
    },
    {
      q: "What database does it run on?",
      a: "SnapShop is built on a production SQL Server db configuration, but automatically falls back to an embedded JSON schema database file for lightweight operations and simple environments."
    }
  ];

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <p className="section-tagline">HAVE QUESTIONS?</p>
      <h1 className="section-main-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Frequently Asked Questions</h1>
      
      {/* Search box */}
      <div style={{ maxWidth: '500px', margin: '0 auto 3rem', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search support questions..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.8rem 1.2rem', border: '1px solid var(--saas-border)', borderRadius: '12px', outline: 'none', fontSize: '0.95rem', boxShadow: 'var(--shadow-premium)' }}
        />
      </div>

      <div className="faq-list" style={{ marginTop: '0' }}>
        {filteredFaqs.length === 0 ? (
          <div style={{ textSelf: 'center', color: 'var(--saas-text-muted)', textAlign: 'center', padding: '3rem' }}>
            No matching questions found. Try searching for "database", "variants", or "checkout".
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button 
                  className="faq-question-btn" 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{ background: isOpen ? '#f1f5f9' : '#f8fafc' }}
                >
                  <span>{faq.q}</span>
                  <span className="faq-icon">▼</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FAQPage;
