import React, { useCallback } from 'react';
import AjioProductGrid from '../components/AjioProductGrid';
import { demoProducts } from '../../../_shared/data/demoProducts';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=440&h=440&fit=crop&crop=center&auto=format&q=80';

const fashionCategories = [
  { name: "Men's Shirts", image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Men's Shoes",  image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Men's Watches", image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Women's Dresses", image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Women's Bags", image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Women's Shoes", image: 'https://images.unsplash.com/photo-1543163521-2bf539246a53?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Women's Watches", image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Women's Jewellery", image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: "Women's Tops", image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
  { name: 'Sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=440&h=440&fit=crop&crop=center&auto=format&q=80' },
];

export default function HomePage({ state }) {
  const fashionProducts = demoProducts.slice(0, 8);

  const handleImgError = useCallback((e) => {
    e.target.src = DEFAULT_IMG;
  }, []);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Ajio Promo Banner (Spotlight Hero) */}
      <section 
        className="ajio-promo"
        onClick={() => state.navigate('category')}
        style={{ width: '100%', height: '420px', backgroundImage: 'url("https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.6) 30%, transparent 80%)' }} />
        <div style={{ position: 'relative', color: '#ffffff', padding: '0 4rem', maxWidth: '600px', zIndex: 2 }}>
          <span style={{ background: '#ff3f6c', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Spotlight deals</span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '12px 0 6px', fontFamily: 'serif', letterSpacing: '1px' }}>{state.store?.storeName ? state.store.storeName.toUpperCase() + ' MANIA' : 'FASHION MANIA'}</h1>
          <p style={{ fontSize: '1.2rem', color: '#e2e8f0', marginBottom: '24px' }}>The boldest streetwear collections and ethnic weaves. Flat 50% - 90% OFF on elite brands.</p>
          <button className="custom-btn" style={{ background: '#ffffff', color: '#111', border: 'none', padding: '10px 24px', fontWeight: '700', cursor: 'pointer', borderRadius: '2px' }}>SHOP THE SALE</button>
        </div>
      </section>

      {/* AJIO-style Category Row */}
      <section style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, color: '#111' }}>SHOP BY CATEGORY</h2>
          <div style={{ height: '3px', width: '40px', background: '#b8923a', margin: '8px auto 0' }} />
        </div>
        
        {/* Horizontal scrollable container for round tiny icons */}
        <div 
          style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            justifyContent: 'center', 
            gap: '1.5rem', 
            padding: '0.5rem 1rem',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none'  // IE/Edge
          }}
          className="ajio-category-row"
        >
          {/* Inject style to hide scrollbars for Webkit browsers */}
          <style>{`
            .ajio-category-row::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {fashionCategories.map(cat => {
            const isMen = cat.name.includes("Men's");
            const isWomen = cat.name.includes("Women's");
            return (
              <div
                key={cat.name}
                onClick={() => { 
                  state.setSelectedCategory(cat.name); 
                  state.setGenderFilter(isMen ? 'men' : isWomen ? 'women' : null); 
                  state.navigate('category'); 
                }}
                style={{ 
                  cursor: 'pointer', 
                  flex: '0 0 auto', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '90px', 
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #f1f5f9', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    onError={handleImgError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {cat.name}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Products list */}
      <section style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>TRENDING DESIGNS</h2>
          <div style={{ height: '3px', width: '60px', background: '#2c3e50', margin: '8px auto 0' }} />
        </div>
        <AjioProductGrid 
          products={fashionProducts}
          onWishlistToggle={state.toggleWishlist}
          wishlistIds={state.wishlist.map(p => p.id)}
          onProductClick={(p) => state.navigate('product', p)}
          onAddToCart={(p) => state.addToCart(p, null, 1)}
        />
      </section>
    </div>
  );
}
