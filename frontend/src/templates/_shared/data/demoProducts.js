function decodeHtml(html) {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

const initialCategories = [
  { id: 'cat1', name: 'Electronics', icon: '📱', count: 120, color: '#eff6ff' },
  { id: 'cat2', name: 'Fashion', icon: '👗', count: 85, color: '#fdf2f8' },
  { id: 'cat3', name: 'Home & Kitchen', icon: '🏠', count: 64, color: '#f0fdf4' },
  { id: 'cat4', name: 'Beauty', icon: '💄', count: 42, color: '#fef3c7' },
  { id: 'cat5', name: 'Sports', icon: '⚽', count: 38, color: '#f5f3ff' },
  { id: 'cat6', name: 'Grocery', icon: '🛒', count: 95, color: '#ecfdf5' },
  { id: 'cat7', name: 'Books', icon: '📚', count: 56, color: '#fff7ed' },
  { id: 'cat8', name: 'Toys', icon: '🧸', count: 33, color: '#fdf4ff' },
];

const initialProducts = [
  { id: 'p1', name: 'Wireless Bluetooth Headphones', brand: 'SoundMax', price: 1299, originalPrice: 2499, image: 'https://placehold.co/400x400/1e293b/94a3b8?text=Headphones', category: 'Electronics', badge: 'Best Seller', rating: 4.5, reviewCount: 234 },
  { id: 'p2', name: 'Premium Cotton T-Shirt', brand: 'UrbanWear', price: 599, originalPrice: 999, image: 'https://placehold.co/400x400/fce7f3/be185d?text=T-Shirt', category: 'Fashion', badge: 'New', rating: 4.2, reviewCount: 89 },
  { id: 'p3', name: 'Smart Fitness Watch', brand: 'TechFit', price: 3499, originalPrice: 5999, image: 'https://placehold.co/400x400/0f172a/38bdf8?text=Watch', category: 'Electronics', badge: '-42%', rating: 4.7, reviewCount: 567 },
  { id: 'p4', name: 'Organic Green Tea Pack', brand: 'NatureBest', price: 349, originalPrice: 499, image: 'https://placehold.co/400x400/dcfce7/16a34a?text=Green+Tea', category: 'Grocery', rating: 4.3, reviewCount: 123 },
  { id: 'p5', name: 'Stainless Steel Water Bottle', brand: 'HydroLife', price: 449, originalPrice: 799, image: 'https://placehold.co/400x400/e0f2fe/0284c7?text=Bottle', category: 'Home', badge: 'Eco', rating: 4.6, reviewCount: 345 },
  { id: 'p6', name: 'Running Shoes Pro', brand: 'SpeedStep', price: 2999, originalPrice: 4999, image: 'https://placehold.co/400x400/fef3c7/d97706?text=Shoes', category: 'Sports', badge: '-40%', rating: 4.8, reviewCount: 789 },
  { id: 'p7', name: 'Vitamin C Face Serum', brand: 'GlowUp', price: 699, originalPrice: 1299, image: 'https://placehold.co/400x400/fef9c3/ca8a04?text=Serum', category: 'Beauty', badge: 'Trending', rating: 4.4, reviewCount: 456 },
  { id: 'p8', name: 'Laptop Backpack', brand: 'CarryAll', price: 899, originalPrice: 1599, image: 'https://placehold.co/400x400/e2e8f0/475569?text=Backpack', category: 'Fashion', rating: 4.1, reviewCount: 234 },
  { id: 'p9', name: 'Ceramic Non-Stick Pan', brand: 'KitchenPro', price: 1199, originalPrice: 2199, image: 'https://placehold.co/400x400/fef2f2/dc2626?text=Pan', category: 'Home', badge: '-45%', rating: 4.5, reviewCount: 178 },
  { id: 'p10', name: 'Yoga Mat Premium', brand: 'ZenFit', price: 799, originalPrice: 1499, image: 'https://placehold.co/400x400/f5f3ff/7c3aed?text=Yoga+Mat', category: 'Sports', rating: 4.3, reviewCount: 312 },
  { id: 'p11', name: 'Portable Bluetooth Speaker', brand: 'SoundMax', price: 1999, originalPrice: 3499, image: 'https://placehold.co/400x400/f0f9ff/0369a1?text=Speaker', category: 'Electronics', badge: 'Popular', rating: 4.6, reviewCount: 445 },
  { id: 'p12', name: 'Denim Jacket Classic', brand: 'UrbanWear', price: 1799, originalPrice: 2999, image: 'https://placehold.co/400x400/dbeafe/2563eb?text=Jacket', category: 'Fashion', rating: 4.4, reviewCount: 167 },
  { id: 'p13', name: 'Air Purifier HEPA', brand: 'CleanAir', price: 4999, originalPrice: 7999, image: 'https://placehold.co/400x400/f0fdf4/15803d?text=Purifier', category: 'Home', badge: 'Premium', rating: 4.7, reviewCount: 234 },
  { id: 'p14', name: 'Protein Powder Vanilla', brand: 'FitFuel', price: 1499, originalPrice: 2299, image: 'https://placehold.co/400x400/fff7ed/c2410c?text=Protein', category: 'Sports', rating: 4.5, reviewCount: 567 },
  { id: 'p15', name: 'Rose Moisturizer', brand: 'GlowUp', price: 449, originalPrice: 799, image: 'https://placehold.co/400x400/fce7f3/be185d?text=Moisturizer', category: 'Beauty', badge: 'Best Seller', rating: 4.8, reviewCount: 890 },
  { id: 'p16', name: 'USB-C Hub Adapter', brand: 'TechConnect', price: 1299, originalPrice: 1999, image: 'https://placehold.co/400x400/1e293b/94a3b8?text=USB+Hub', category: 'Electronics', rating: 4.3, reviewCount: 234 },
];

export const demoCategories = [...initialCategories];
export const demoProducts = [...initialProducts];

export function setLiveProducts(products) {
  demoProducts.length = 0;
  // Map fields standardizer
  const mapped = products.map((p, idx) => {
    const activePrice = parseFloat(p.price) || 0;
    const discountVal = parseFloat(p.discount) || 0;
    const hasDiscount = discountVal > 0;

    return {
      ...p,
      id: p.id?.toString() || `p-${idx}`,
      name: decodeHtml(p.name),
      brand: decodeHtml(p.brand || 'Premium Brand'),
      price: hasDiscount ? Math.round(activePrice * (1 - discountVal / 100)) : activePrice,
      originalPrice: hasDiscount ? activePrice : null,
      image: p.image || p.imageUrl || (Array.isArray(p.images) && p.images[0]) || `https://placehold.co/400x400/f1f5f9/94a3b8?text=${encodeURIComponent(p.name)}`,
      category: decodeHtml(p.categoryName || p.category || 'General'),
      rating: p.rating || 4.5,
      reviewCount: p.reviewCount || 120,
      badge: hasDiscount ? `-${Math.round(discountVal)}%` : (p.badge || '')
    };
  });
  demoProducts.push(...mapped);
}

const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('dress')) return '👗';
  if (n.includes('bag')) return '👜';
  if (n.includes('jewel')) return '💍';
  if (n.includes('top')) return '👚';
  if (n.includes('glass')) return '🕶️';
  if (n.includes('shirt')) return '👕';
  if (n.includes('shoe')) return n.includes('women') ? '👠' : '👟';
  if (n.includes('watch')) return '⌚';
  return '📦';
};

const getCategoryColor = (name) => {
  const colors = ['#fdf2f8', '#f0fdf4', '#eff6ff', '#fefce8', '#faf5ff', '#f0fdfa'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function setLiveCategories(categories) {
  demoCategories.length = 0;
  const mapped = categories.map((c, idx) => ({
    id: c.id?.toString() || `cat-${idx}`,
    name: decodeHtml(c.name),
    icon: getCategoryIcon(c.name),
    count: c.productCount || 10,
    color: getCategoryColor(c.name)
  }));
  demoCategories.push(...mapped);
}

export function resetDemoData() {
  demoProducts.length = 0;
  demoProducts.push(...initialProducts);
  demoCategories.length = 0;
  demoCategories.push(...initialCategories);
}
