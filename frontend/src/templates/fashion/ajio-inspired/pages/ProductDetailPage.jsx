import React, { useState, useEffect, useCallback, useRef } from 'react';

function ProductImageSlider({ images, productName }) {
  const gallery = Array.isArray(images) && images.length > 0 
    ? images 
    : ['https://placehold.co/400x533?text=No+Image'];

  if (gallery.length === 1) {
    return (
      <div style={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <img 
          src={gallery[0]} 
          alt={productName} 
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % gallery.length);
  }, [gallery.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide();
    }
  };

  return (
    <div 
      style={{ position: 'relative', width: '100%', height: '500px', userSelect: 'none' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'hidden', 
          position: 'relative',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{
          display: 'flex',
          width: `${gallery.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(currentIndex * 100) / gallery.length}%)`,
          transition: 'transform 0.5s ease-in-out'
        }}>
          {gallery.map((img, idx) => (
            <div key={idx} style={{ width: `${100 / gallery.length}%`, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={img} 
                alt={`${productName} slide ${idx}`} 
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={prevSlide}
          style={{
            position: 'absolute',
            top: '50%',
            left: '15px',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10,
            fontSize: '18px',
            color: '#1e293b',
            transition: 'background 0.2s',
            outline: 'none'
          }}
        >
          &#10094;
        </button>

        <button 
          onClick={nextSlide}
          style={{
            position: 'absolute',
            top: '50%',
            right: '15px',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10,
            fontSize: '18px',
            color: '#1e293b',
            transition: 'background 0.2s',
            outline: 'none'
          }}
        >
          &#10095;
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '12px'
      }}>
        {gallery.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: 'none',
              background: currentIndex === idx ? '#0f172a' : '#cbd5e1',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage({ state }) {
  const p = state.selectedProduct;
  if (!p) return <div style={{ padding: '3rem', textAlign: 'center' }}>Details not loaded.</div>;

  const isOutOfStock = 
    p.status === 'Inactive' || 
    p.availabilityStatus === 'Out of Stock' || 
    p.stock === 0 || 
    p.stock === '0' ||
    (p.variants && p.variants.length > 0 && p.variants.every(v => v.stock === 0 || v.stock === '0'));

  const galleryImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || p.imageUrl || 'https://placehold.co/400x533?text=No+Image'];
  const reviews = Array.isArray(p.reviews) ? p.reviews : [];

  const renderRatingStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<span key={i} style={{ color: '#ffb300', marginRight: '2px', transition: 'transform 0.2s', display: 'inline-block' }} className="star-hover">★</span>);
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <span key={i} style={{ 
            background: 'linear-gradient(90deg, #ffb300 50%, #cbd5e1 50%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginRight: '2px',
            transition: 'transform 0.2s',
            display: 'inline-block'
          }} className="star-hover">★</span>
        );
      } else {
        stars.push(<span key={i} style={{ color: '#cbd5e1', marginRight: '2px', transition: 'transform 0.2s', display: 'inline-block' }} className="star-hover">★</span>);
      }
    }
    return stars;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <button onClick={() => state.navigate('category')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '13px', marginBottom: '1.5rem' }}>
        ← BACK TO CATALOG
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
        <div>
          <ProductImageSlider images={galleryImages} productName={p.name} />
        </div>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff7043', textTransform: 'uppercase' }}>{p.brand}</span>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 12px', color: '#2c3e50' }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#111' }}>₹{p.price}</span>
            {p.originalPrice && (
              <>
                <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#888' }}>₹{p.originalPrice}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff7043' }}>({p.badge || 'OFF'})</span>
              </>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '2rem' }}>
            {p.description || 'Premium design with comfortable fit, made from pure organic cotton. Ideal for daily smart-casual wear.'}
          </p>
          
          {/* Product Information Card */}
          <div style={{ 
            padding: '1.5rem', 
            background: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            fontSize: '14px', 
            color: '#334155', 
            marginBottom: '1.5rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <style>{`
              .star-container:hover .star-hover {
                transform: scale(1.2) rotate(3deg);
              }
            `}</style>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#0f172a', 
              margin: '0 0 1.25rem 0',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '0.75rem'
            }}>
              Product Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Availability</span>
                {isOutOfStock ? (
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● Out of Stock</span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>● In Stock</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '4px' }}>
                <div className="star-container" style={{ display: 'flex', alignItems: 'center' }}>
                  {renderRatingStars(p.rating || 4.41)}
                </div>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{p.rating || 4.41}/5</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Product ID</span>
                <span>{p.id} {p.dummyJsonId && `(API ID: ${p.dummyJsonId})`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Brand</span>
                <span style={{ fontWeight: 'bold' }}>{p.brand}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Category</span>
                <span>{p.category}</span>
              </div>
              {p.sku && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#64748b' }}>SKU</span>
                  <span>{p.sku}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px', marginTop: '4px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Min Order</span>
                <span>1 Unit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Warranty</span>
                <span>{p.warrantyInformation || 'No Warranty'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Shipping</span>
                <span>Ships in 1–2 business days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Return Policy</span>
                <span>7 days return policy</span>
              </div>
            </div>
          </div>

          <button 
            className="custom-btn" 
            disabled={isOutOfStock}
            onClick={() => { state.addToCart(p); alert('Added to Bag! 👜'); }}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: isOutOfStock ? '#cbd5e1' : '#2c3e50', 
              color: isOutOfStock ? '#64748b' : '#fff', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: isOutOfStock ? 'not-allowed' : 'pointer', 
              fontSize: '14px', 
              borderRadius: '2px', 
              letterSpacing: '1px' 
            }}
          >
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG 👜'}
          </button>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid #eaeaea', paddingTop: '2.5rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '1.5rem' }}>Customer Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p style={{ color: '#888', fontSize: '13px' }}>No reviews yet for this product.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {reviews.map((rev, idx) => (
              <div key={idx} style={{ background: '#fcfcfc', padding: '1.25rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#333' }}>{rev.reviewerName}</strong>
                  <span style={{ fontSize: '12px', color: '#ffb300' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>{rev.reviewerEmail} | {new Date(rev.date).toLocaleDateString()}</div>
                <p style={{ fontSize: '13px', color: '#555', margin: 0, fontStyle: 'italic' }}>"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
