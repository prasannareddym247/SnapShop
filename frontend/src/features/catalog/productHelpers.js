import { API_BASE } from '../../services/api';

// ── Pricing Configuration ──────────────────────────────────────────
// Seller-entered prices are stored directly in INR in the database.
// The storefront must display exactly what the seller entered in the
// Product Catalog — no USD conversion is applied. The catalog is the
// single source of truth for pricing.
const USD_TO_INR_RATE = 83; // Retained only for backwards reference; NOT applied to stored prices.

// ── Currency Conversion & Pricing Helpers ──────────────────────────

/**
 * Convert USD price to INR (helper kept for any raw API/USD use cases)
 * @param {number} usdPrice - Price in USD
 * @returns {number} Price in INR (rounded to integer)
 */
export const convertUsdToInr = (usdPrice) => {
  const numPrice = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
  if (isNaN(numPrice) || numPrice < 0) return 0;
  return Math.round(numPrice * USD_TO_INR_RATE);
};

/**
 * Calculate discounted price from original price and discount percentage
 * Formula: discountedPrice = price - ((price * discountPercentage) / 100)
 * @param {number} originalPrice - Original price in INR
 * @param {number} discountPercentage - Discount percentage (0-100)
 * @returns {number} Discounted price in INR (rounded to integer)
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const numPrice = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const numDiscount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;
  
  if (isNaN(numPrice) || numPrice <= 0) return 0;
  if (isNaN(numDiscount) || numDiscount <= 0) return numPrice;
  
  const discountAmount = (numPrice * numDiscount) / 100;
  return Math.round(numPrice - discountAmount);
};

/**
 * Transform product pricing for display.
 * Stored prices are already INR (the seller enters INR in the catalog),
 * so we use them directly and only apply the discount calculation.
 * @param {Object} product - Product object with variant prices (INR) and discountPercentage
 * @returns {Object} Product with added pricing fields in INR
 */
export const transformProductPricing = (product) => {
  if (!product) return null;
  
  const basePrice = product.price || 0;
  const discountPercentage = product.discountPercentage || product.vendorDiscount || 0;
  
  // Stored price is already INR — use directly (catalog is source of truth)
  const originalPriceInr = basePrice;
  
  // Calculate discounted price
  const discountedPriceInr = calculateDiscountedPrice(originalPriceInr, discountPercentage);
  
  // Transform variants if they exist
  const transformedVariants = product.variants ? product.variants.map(v => {
    const variantPrice = v.price || 0;
    const variantDiscountedPrice = calculateDiscountedPrice(variantPrice, discountPercentage);
    
    return {
      ...v,
      price: variantPrice, // stored INR price
      originalPrice: variantPrice,
      discountedPrice: variantDiscountedPrice
    };
  }) : [];
  
  return {
    ...product,
    // INR prices (as stored)
    originalPrice: originalPriceInr,
    discountedPrice: discountedPriceInr,
    displayPrice: discountedPriceInr, // Final selling price
    // Keep discount percentage
    discountPercentage: discountPercentage,
    // Transform variants
    variants: transformedVariants
  };
};

/**
 * Format price in INR with currency symbol
 * @param {number} price - Price in INR
 * @returns {string} Formatted price string (e.g., "₹1,234")
 */
export const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return 'N/A';
  return `₹${Math.round(numPrice).toLocaleString('en-IN')}`;
};

/**
 * Get price display data for a product variant
 * @param {Object} variant - Product variant with price
 * @param {number} discountPercentage - Optional discount percentage
 * @returns {Object} Pricing data for the variant
 */
export const getVariantPricing = (variant, discountPercentage = 0) => {
  if (!variant) return { displayPrice: 0, originalPrice: 0, discountPercentage: 0 };
  
  const originalPrice = typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price;
  const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
  
  return {
    originalPrice: Math.round(originalPrice),
    displayPrice: Math.round(discountedPrice),
    discountPercentage: discountPercentage
  };
};

// ── Existing Helper Functions ──────────────────────────────────────

// Convert relative asset paths to absolute backend URLs
const toAbsoluteUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('data:') || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  if (relativePath.startsWith('/assets/')) {
    const base = API_BASE.replace(/\/api\/?$/, '');
    return `${base}${relativePath}`;
  }
  return relativePath;
};

export const getCategoryFallbackImage = (category, productId) => {
  const categoryLower = (category || '').toLowerCase();
  
  // Map categories to asset folders
  const categoryMap = {
    'mobiles': 'Mobiles',
    'air conditioners': 'Ac',
    'fashion': 'MenWear',
    'electronics': 'Computers',
    'appliances': 'fridge',
    'books': 'Books',
    'furniture': 'Furniture',
    'wearables': 'Watch',
    'kitchen': 'Kitchen',
    'men fashion': 'MenWear',
    'woman fashion': 'Woman',
    'watches': 'Watch',
    'computers': 'Computers',
    'speakers': 'speakers',
    'television': 'TV',
    'refrigerators': 'fridge',
    'home & furniture': 'Furniture'
  };
  
  const folder = categoryMap[categoryLower] || 'Mobiles';
  
  // Extract number from product ID for unique image
  let num = 1;
  if (productId) {
    const idStr = String(productId);
    const match = idStr.match(/(\d+)/);
    if (match) {
      num = parseInt(match[1]);
      num = Math.min(Math.max(num, 1), 20);
    }
  }
  
  const ext = 'jpg';
  const path = `/assets/${folder}/${num}.${ext}`;
  
  return toAbsoluteUrl(path);
};

export const getProductImageSrc = (product) => {
  if (!product) return getCategoryFallbackImage('Electronics', 'default');
  
  if (typeof product === 'string') {
    return toAbsoluteUrl(product);
  }
  
  if (typeof product.imageUrl === 'string' && product.imageUrl.startsWith('data:')) {
    return product.imageUrl;
  }
  
  if (Array.isArray(product.images) && product.images.length > 0) {
    return toAbsoluteUrl(product.images[0]);
  }
  
  let path = product.image || product.imageUrl;
  
  if (path) {
    return toAbsoluteUrl(path);
  }
  
  return getCategoryFallbackImage(product.category, product.id);
};

export const buildProductMockupDataUrl = (name, category) => {
  const palette = {
    Mobiles: ['#f8fafc', '#1e40af', '#dbeafe'],
    'Air Conditioners': ['#f0f9ff', '#0369a1', '#bae6fd'],
    'Men Fashion': ['#fdf2f8', '#9d174d', '#fbcfe8'],
    'Woman Fashion': ['#fce4ec', '#880e4f', '#f48fb1'],
    Fashion: ['#fdf2f8', '#9d174d', '#fbcfe8'],
    Electronics: ['#f0fdf4', '#166534', '#bbf7d0'],
    Computers: ['#f0fdf4', '#166534', '#bbf7d0'],
    Speakers: ['#f0fdf4', '#166534', '#bbf7d0'],
    Television: ['#f0fdf4', '#166534', '#bbf7d0'],
    Appliances: ['#fff7ed', '#9a3412', '#fed7aa'],
    Refrigerators: ['#fff7ed', '#9a3412', '#fed7aa'],
    Books: ['#f5f3ff', '#5b21b6', '#ddd6fe'],
    Furniture: ['#fef2f2', '#991b1b', '#fecaca'],
    Wearables: ['#ecfdf5', '#065f46', '#a7f3d0'],
    Watches: ['#ecfdf5', '#065f46', '#a7f3d0'],
    Kitchen: ['#fffbeb', '#92400e', '#fef3c7']
  }[category] || ['#f8fafc', '#475569', '#e2e8f0'];
  
  const safeName = (name || 'Product').replace(/[<>&"]/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <rect width="900" height="900" fill="${palette[0]}"/>
      <ellipse cx="450" cy="760" rx="260" ry="45" fill="#0f172a" opacity="0.12"/>
      <path d="M285 135h330l55 620c5 54-37 100-91 100H321c-54 0-96-46-91-100l55-620z" fill="#ffffff" stroke="#e2e8f0" stroke-width="8"/>
      <path d="M303 156h294l18 118H285l18-118z" fill="${palette[2]}"/>
      <rect x="310" y="274" width="280" height="55" rx="27" fill="#1b4332"/>
      <text x="450" y="311" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">SnapShop</text>
      <text x="450" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#0f172a">${safeName}</text>
      <text x="450" y="458" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="${palette[1]}">${category}</text>
      <circle cx="450" cy="590" r="118" fill="${palette[2]}" stroke="${palette[1]}" stroke-width="10"/>
      <g fill="${palette[1]}" opacity="0.82">
        <circle cx="398" cy="570" r="26"/><circle cx="455" cy="545" r="22"/><circle cx="504" cy="584" r="28"/>
        <circle cx="430" cy="625" r="24"/><circle cx="490" cy="645" r="20"/>
      </g>
      <text x="450" y="735" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1b4332">Premium Quality</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getCategorySpecificDescription = (product) => {
  if (!product) return '';
  const category = product.category || '';
  const specs = product.specifications || {};
  
  switch (category) {
    case 'Mobiles':
      return `${specs.ram || ''} | ${specs.storage || ''} | ${specs.battery || ''}${specs.processor ? ' | ' + specs.processor : ''}`;
    
    case 'Air Conditioners':
      return `${product.brand || ''} ${specs.tonnage || ''} ${specs.energyRating || ''} | ${specs.coolingCapacity || ''}${specs.inverter === 'Yes' ? ' | Inverter' : ''}`;
    
    case 'Fashion':
      return `${specs.size || ''} | ${specs.color || ''} | ${specs.material || ''}`;
    
    case 'Electronics':
    case 'Appliances':
      return `${specs.warranty || ''}${specs.processor ? ' | ' + specs.processor : ''}${specs.ram ? ' | ' + specs.ram : ''}`;
    
    case 'Books':
      return `${specs.author || ''} | ${specs.genre || ''} | ${specs.format || ''}`;
    
    case 'Furniture':
      return `${specs.material || ''} | ${specs.color || ''} | ${specs.dimensions || ''}`;
    
    case 'Wearables':
      return `${specs.display || ''} | ${specs.batteryLife || ''} | ${specs.waterResistant || ''}`;
    
    case 'Kitchen':
      return `${specs.power || ''} | ${specs.capacity || ''} | ${specs.material || ''}`;
    
    default:
      return product.description || product.product || '';
  }
};

export const getProductDisplayData = (product) => {
  if (!product) return null;
  
  // Transform pricing from USD to INR
  const transformedProduct = transformProductPricing(product);
  
  return {
    ...transformedProduct,
    displayDescription: getCategorySpecificDescription(product),
    imageSrc: getProductImageSrc(product)
  };
};