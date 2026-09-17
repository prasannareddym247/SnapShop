import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/products/banners')
      .then(data => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '280px',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '2rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <a href={banner.link || '#'} style={{ display: 'block', width: '100%', height: '100%' }}>
        <img
          src={banner.imageUrl}
          alt={banner.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.5rem',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{banner.title}</h3>
        </div>
      </a>

      {banners.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '1rem',
          display: 'flex',
          gap: '0.4rem'
        }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: 0
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
