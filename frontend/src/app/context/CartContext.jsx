import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services/api';
import { transformProductPricing } from '../../features/catalog/productHelpers';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);

  const addToCart = (product, variant, qty) => {
    if (product.status === 'Inactive') {
      alert('This product is currently unavailable.');
      return;
    }
    const isOutOfStock = 
      product.availabilityStatus === 'Out of Stock' || 
      product.stock === 0 || 
      product.stock === '0' ||
      variant.stock === 0 || 
      variant.stock === '0';
    if (isOutOfStock) {
      alert('This product is currently out of stock.');
      return;
    }
    
    // Stored variant price is already INR (seller enters INR in the catalog).
    // The catalog is the single source of truth — use it directly.
    const transformedPricing = transformProductPricing(product);
    const discountPct = transformedPricing?.discountPercentage || product.vendorDiscount || 0;
    
    const variantPriceInr = typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price;
    
    const effectivePrice = discountPct > 0 ? Math.round(variantPriceInr * (1 - discountPct / 100)) : variantPriceInr;
    const existingIndex = cart.findIndex(item => item.variantId === variant.id);
    if (existingIndex !== -1) {
      const newCart = [...cart];
      const totalQty = newCart[existingIndex].quantity + qty;
      if (totalQty > variant.stock) {
        alert(`Only ${variant.stock} units are available in stock.`);
        return;
      }
      newCart[existingIndex].quantity = totalQty;
      newCart[existingIndex].taxAmount = Math.round(newCart[existingIndex].unitPrice * 0.12 * totalQty);
      setCart(newCart);
    } else {
      if (qty > variant.stock) {
        alert(`Only ${variant.stock} units are available in stock.`);
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name || product.product,
        category: product.category,
        imageUrl: product.image || product.imageUrl,
        variantId: variant.id,
        weightGrams: variant.weightGrams,
        unitPrice: effectivePrice,
        basePrice: variantPriceInr,
        quantity: qty,
        vendorId: product.vendorId,
        taxAmount: Math.round(effectivePrice * 0.12 * qty)
      }]);
    }
  };

  const updateCartQuantity = async (variantId, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.variantId !== variantId));
      return;
    }

    try {
      const latestProducts = await api.get('/products');
      let availableStock = 999;
      let isInactive = false;
      
      for (let p of latestProducts) {
        const v = p.variants && p.variants.find(pv => pv.id === variantId);
        if (v) {
          availableStock = v.stock;
          isInactive = p.status === 'Inactive';
          break;
        }
      }

      if (isInactive) {
        alert('This product is currently unavailable.');
        setCart(cart.filter(item => item.variantId !== variantId));
        return;
      }

      if (newQty > availableStock) {
        alert(`Only ${availableStock} units available in stock.`);
        newQty = availableStock;
      }
    } catch (err) {
      console.error('Error checking stock on quantity change:', err);
    }

    setCart(cart.map(item => item.variantId === variantId ? { 
      ...item, 
      quantity: newQty,
      taxAmount: Math.round(item.unitPrice * 0.12 * newQty)
    } : item));
  };

  const removeFromCart = (variantId) => {
    setCart(cart.filter(item => item.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSubtotal = (vendorId) => cart.reduce((acc, item) => {
    if (vendorId && item.vendorId !== vendorId) return acc;
    return acc + (item.unitPrice * item.quantity);
  }, 0);
  const getTax = (vendorId) => cart.reduce((acc, item) => {
    if (vendorId && item.vendorId !== vendorId) return acc;
    return acc + (item.taxAmount);
  }, 0);
  const getShipping = (vendorId) => {
    const sub = vendorId ? getSubtotal(vendorId) : getSubtotal();
    return (sub > 1000 || sub === 0) ? 0 : 50;
  };
  const getDiscount = () => {
    if (!coupon) return 0;
    const sub = coupon.vendorId ? getSubtotal(coupon.vendorId) : getSubtotal();
    if (coupon.discountType === 'Percentage') {
      return Math.round(sub * (parseFloat(coupon.discountValue) / 100));
    } else {
      return Math.min(sub, Math.round(parseFloat(coupon.discountValue)));
    }
  };
  const getGrandTotal = () => Math.max(0, getSubtotal() + getShipping() - getDiscount());

  const applyCoupon = async (code) => {
    try {
      const data = await api.get(`/customer/coupons/validate?code=${code}`);
      if (data.vendorId) {
        const hasVendorItem = cart.some(item => item.vendorId === data.vendorId);
        if (!hasVendorItem) {
          return { success: false, error: 'This coupon is not valid for items in your cart.' };
        }
      }
      setCoupon(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.error || 'Invalid or expired coupon.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const verifyCartStock = async () => {
    try {
      const latestProducts = await api.get('/products');
      
      for (let item of cart) {
        const p = latestProducts.find(prod => prod.id === item.productId);
        if (p) {
          if (p.status === 'Inactive') {
            setCart(prevCart => prevCart.filter(c => c.variantId !== item.variantId));
            return false;
          }
          const v = p.variants && p.variants.find(pv => pv.id === item.variantId);
          if (v) {
            if (v.stock === 0) {
              setCart(prevCart => prevCart.filter(c => c.variantId !== item.variantId));
              return false;
            }
            if (item.quantity > v.stock) {
              setCart(prevCart => prevCart.map(c => c.variantId === item.variantId ? { ...c, quantity: v.stock, taxAmount: c.unitPrice * 0.12 * v.stock } : c));
              return false;
            }
          }
        }
      }
      return true;
    } catch (err) {
      console.error('Error verifying cart stock:', err);
      return true; // Fallback to proceed
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      coupon,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      getSubtotal,
      getTax,
      getShipping,
      getDiscount,
      getGrandTotal,
      applyCoupon,
      removeCoupon,
      verifyCartStock
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};