import React from 'react';
import { useTheme } from '../utils/ThemeEngine';

export default function TemplateFooter({
  logo,
  description,
  columns = [],
  socialLinks = [],
  onNavClick,
  variant = 'default'
}) {
  const { palette } = useTheme();

  const footerStyle = {
    background: palette.surface || '#ffffff',
    borderTop: `1px solid ${palette.border || '#e2e8f0'}`,
    padding: '3rem 2rem',
    color: palette.text || '#0f172a',
    marginTop: 'auto'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem'
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div>
          <h3 style={{ color: palette.primary || '#2563eb', margin: '0 0 1rem 0', fontWeight: 800 }}>{logo}</h3>
          <p style={{ color: palette.textMuted || '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{description}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {socialLinks.map((s, i) => (
              <span key={i} title={s.label} style={{ fontSize: '1.25rem', cursor: 'pointer' }}>
                {s.icon}
              </span>
            ))}
          </div>
        </div>

        {columns && columns.map((col, idx) => (
          <div key={idx}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{col.title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
              {col.links && col.links.map((link, lIdx) => (
                <li key={lIdx}>
                  <span 
                    style={{ color: palette.textMuted || '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
                    onClick={() => {
                      if (link.toLowerCase().includes('contact')) onNavClick?.('contact');
                      else if (link.toLowerCase().includes('faq')) onNavClick?.('faq');
                      else if (link.toLowerCase().includes('about')) onNavClick?.('about');
                      else if (link.toLowerCase().includes('privacy')) onNavClick?.('privacy');
                      else if (link.toLowerCase().includes('terms')) onNavClick?.('terms');
                      else onNavClick?.('category');
                    }}
                  >
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${palette.border || '#f1f5f9'}`, marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: palette.textMuted || '#64748b' }}>
        &copy; {new Date().getFullYear()} {logo}. Powered by SnapShop. All rights reserved.
      </div>
    </footer>
  );
}
