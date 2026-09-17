import { useState, useCallback, createContext, useContext } from 'react';
import { demoProducts, demoCategories } from '../data/demoProducts';
import { useCart } from '../../../app/context/CartContext';
import { useAuth } from '../../../app/context/AuthContext';
import api from '../../../services/api';

export const StorefrontContext = createContext({ realProducts: null, realCategories: null });

export function useTemplateState() {
  const { realProducts, realCategories } = useContext(StorefrontContext);
  const { cart, addToCart: contextAddToCart, removeFromCart, updateCartQuantity, clearCart, getSubtotal } = useCart();
  const customerToken = localStorage.getItem('fk_customer_token');
  const customerUser = (() => {
    try {
      const u = localStorage.getItem('fk_customer_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const customerLogin = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('fk_customer_token', response.token);
      localStorage.setItem('fk_customer_user', JSON.stringify(response.user));
      return response;
    } catch (err) {
      if (err && err.code === 'EMAIL_NOT_VERIFIED') {
        try {
          await api.post('/auth/send-verification-otp', { email });
        } catch (sendErr) {
          console.error('Failed to auto-resend verification OTP:', sendErr);
        }
        const code = window.prompt('Your email is not verified. Please enter the 6-digit verification code sent to your email:');
        if (code) {
          try {
            const verifyRes = await api.post('/auth/verify-signup-otp', { email, otp: code });
            localStorage.setItem('fk_customer_token', verifyRes.token);
            localStorage.setItem('fk_customer_user', JSON.stringify(verifyRes.user));
            return verifyRes;
          } catch (verifyErr) {
            alert(verifyErr.error || 'Verification failed.');
            throw verifyErr;
          }
        }
      }
      throw err;
    }
  }, []);

  const customerRegister = useCallback(async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        role: 'Customer'
      });
      const code = window.prompt('Account created! Please enter the 6-digit verification code sent to your email to verify your account:');
      if (code) {
        try {
          const verifyRes = await api.post('/auth/verify-signup-otp', { email: userData.email, otp: code });
          localStorage.setItem('fk_customer_token', verifyRes.token);
          localStorage.setItem('fk_customer_user', JSON.stringify(verifyRes.user));
          return verifyRes;
        } catch (verifyErr) {
          alert(verifyErr.error || 'Verification failed.');
          throw verifyErr;
        }
      }
      return response;
    } catch (err) {
      throw err;
    }
  }, []);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastOrderId, setLastOrderId] = useState(null);

  const [genderFilter, setGenderFilter] = useState(null);

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

  const finalCategories = (realCategories !== null)
    ? realCategories.map(c => ({
        id: c.id,
        name: c.name,
        icon: getCategoryIcon(c.name),
        color: getCategoryColor(c.name),
        count: realProducts ? realProducts.filter(p => Number(p.categoryId) === Number(c.id)).length : 0
      }))
    : demoCategories;

  const finalProducts = (realProducts !== null ? realProducts : demoProducts).map(p => ({
    ...p,
    image: p.image || p.imageUrl || p.thumbnail || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    imageUrl: p.imageUrl || p.image || p.thumbnail,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || p.imageUrl || p.thumbnail || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'],
    category: p.category || 'Fashion',
  }));

  const filteredCategories = finalCategories.filter(cat => {
    const catNameLower = cat.name.toLowerCase();
    if (catNameLower.includes('sunglass') || catNameLower.includes('sun glass') || catNameLower.includes('glass')) {
      return true;
    }
    if (genderFilter === 'men') {
      return catNameLower.includes('men') && !catNameLower.includes('women');
    }
    if (genderFilter === 'women') {
      return catNameLower.includes('women');
    }
    return true;
  });

  const filteredProducts = finalProducts.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesGender = true;
    const catNameLower = p.category?.toLowerCase() || '';
    const isSunglasses = catNameLower.includes('sunglass') || catNameLower.includes('sun glass') || catNameLower.includes('glass');
    
    if (isSunglasses) {
      matchesGender = true;
    } else if (genderFilter === 'men') {
      matchesGender = catNameLower.includes('men') && !catNameLower.includes('women');
    } else if (genderFilter === 'women') {
      matchesGender = catNameLower.includes('women');
    }

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory || String(p.categoryId) === String(selectedCategory);
    return matchesSearch && matchesGender && matchesCategory;
  });

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const addToCart = useCallback((product, variant = null, qty = 1) => {
    if (!product) return;

    const p = product.variants ? product : {
      ...product,
      variants: product.variants || [{
        id: product.id + '-v1',
        price: product.price,
        stock: product.stock != null ? product.stock : 10,
        weightGrams: 0
      }]
    };

    const v = variant || (p.variants && p.variants[0]);
    if (!v) return;

    if (v.stock === 0 || v.stock === '0') {
      alert('This product is currently out of stock.');
      return;
    }

    contextAddToCart(p, v, qty);
  }, [contextAddToCart]);

  const cartTotal = getSubtotal();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useCallback((view, product = null) => {
    setCurrentView(view);
    if (product) setSelectedProduct(product);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('fk_customer_token');
    localStorage.removeItem('fk_customer_user');
    window.location.reload();
  }, []);

  return {
    cart, setCart: () => {}, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
    wishlist, toggleWishlist,
    searchQuery, setSearchQuery,
    currentView, navigate,
    selectedProduct, setSelectedProduct,
    selectedCategory, setSelectedCategory,
    categories: filteredCategories,
    genderFilter, setGenderFilter,
    filteredProducts,
    auth: { token: customerToken, user: customerUser, login: customerLogin, register: customerRegister, logout: handleLogout },
    lastOrderId, setLastOrderId
  };
}
