import React, { useState, useEffect } from 'react';
import ProductGrid from '../../features/catalog/components/ProductGrid';
import BannerCarousel from '../../features/catalog/components/BannerCarousel';

const CatalogPage = ({
  products,
  loading,
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  wishlistIds = [],
  onWishlistToggle,
  onProductClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = (category !== 'All' && !searchQuery) ? 9999 : 8;

  // Reset pagination when category, search or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery, sortOption]);

  // Group products by major categories for the "All" homepage preview
  const groupByCategory = () => {
    const groups = {};

    products.forEach(p => {
      const cat = p.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    return groups;
  };

  const productGroups = groupByCategory();

  // Pagination calculation for category listings
  const totalItems = products.length;
  const pageCount = Math.ceil(totalItems / pageSize);
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="animated-view" style={{ width: '100%' }}>
      <BannerCarousel />
      {/* Homepage Preview Showcase (when category === 'All' and no active search term) */}
      {category === 'All' && !searchQuery ? (
        <div className="catalog-showcase">
          
          {Object.entries(productGroups).map(([groupName, groupProds]) => {
            if (groupProds.length === 0) return null;
            
            // Limit to 6 products in showcase rows, with See All overlay on the 6th
            const showcaseProds = groupProds.slice(0, 6);

            return (
              <section key={groupName} className="catalog-section">
                <div className="section-header">
                  <h2 className="section-title">
                    {groupName}
                  </h2>
                </div>

                <ProductGrid 
                  products={showcaseProds} 
                  onProductClick={onProductClick} 
                  wishlistIds={wishlistIds}
                  onWishlistToggle={onWishlistToggle}
                  seeAllTarget={groupName}
                  onSeeAllClick={() => { setCategory(groupName); window.location.hash = 'category/' + groupName; }}
                  fixedColumns={6}
                />
              </section>
            );
          })}
        </div>
      ) : (
        // Category Listing Page (when a specific category is selected, or search term is typed)
        <div className="catalog-listing">
          
          {/* Controls Bar */}
          <div className="control-bar">
            <div className="control-bar-left">
              <h2 className="catalog-heading">
                {searchQuery ? `Search Results for "${searchQuery}"` : `${category} Catalogue`}
              </h2>
              <p className="catalog-count">Showing {totalItems} items matching request</p>
            </div>

            <div className="control-bar-right">
              {category !== 'All' && (
                <button 
                  className="pill pill-outline" 
                  onClick={() => setCategory('All')}
                >
                  &larr; Main Home
                </button>
              )}

              <select 
                className="sort-select" 
                value={sortOption} 
                onChange={e => setSortOption(e.target.value)}
              >
                <option value="name-asc">Sort Name: A to Z</option>
                <option value="name-desc">Sort Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className="loading-state">
              Loading fresh catalog items...
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No Active Products Found</h3>
              <p className="catalog-count">We couldn't find any approved products in this category at the moment.</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={paginatedProducts}
                onProductClick={onProductClick}
                wishlistIds={wishlistIds}
                onWishlistToggle={onWishlistToggle}
              />

              {/* Pagination controls */}
              {pageCount > 1 && (
                <div className="pagination">
                  <button 
                    className="pill" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    &larr; Prev
                  </button>
                  
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(pageNum => (
                    <button 
                      key={pageNum} 
                      className={`pill ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{ minWidth: '36px', textAlign: 'center' }}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button 
                    className="pill" 
                    disabled={currentPage === pageCount}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;