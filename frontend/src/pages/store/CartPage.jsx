import React, { useState } from 'react';
import { useCart } from '../../app/context/CartContext';
import { getCategoryFallbackImage } from '../../features/catalog/productHelpers';

const CartPage = ({ onProceed, onViewCatalog }) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    getSubtotal,
    getTax,
    getShipping,
    getGrandTotal,
    verifyCartStock,
    coupon,
    applyCoupon,
    removeCoupon,
    getDiscount
  } = useCart();

  const handleProceed = async () => {
    const verified = await verifyCartStock();
    if (verified && onProceed) {
      onProceed();
    }
  };

  return (
    <div className="cart-container animated-view">
      <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Your Basket</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Your cart is empty. Back to the{' '}
          <span 
            style={{ color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer' }} 
            onClick={onViewCatalog}
          >
            Catalog
          </span>{' '}
          to add items!
        </div>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.variantId} className="cart-item">
              <img 
                src={item.imageUrl || `images/products/${item.productId}.png`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCategoryFallbackImage(item.category);
                }}
                alt={item.name}
                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
              <div className="cart-item-info">
                <h4 className="cart-item-title">{item.name}</h4>
                <span className="cart-item-variant">
                  Weight: {item.weightGrams >= 1000 ? `${item.weightGrams / 1000}kg` : `${item.weightGrams}g`}
                </span>
              </div>

              <div className="qty-control" style={{ transform: 'scale(0.9)' }}>
                <button className="qty-btn" onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}>-</button>
                <span className="qty-val">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}>+</button>
              </div>

              <div style={{ minWidth: '80px', textAlign: 'right' }}>
                {item.basePrice && item.basePrice > item.unitPrice && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{Math.round(item.basePrice * item.quantity)}</div>
                )}
                <span className="cart-item-price">₹{Math.round(item.unitPrice * item.quantity)}</span>
                <br />
                <button className="cart-remove" onClick={() => removeFromCart(item.variantId)}>Remove</button>
              </div>
            </div>
          ))}

          <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!coupon}
                style={{ flex: 1, textTransform: 'uppercase' }}
              />
              {coupon ? (
                <button className="cart-remove" onClick={() => { removeCoupon(); setCouponCode(''); setCouponError(''); }} style={{ padding: '0.5rem 1rem' }}>
                  Remove
                </button>
              ) : (
                <button
                  className="action-btn"
                  onClick={async () => {
                    if (!couponCode.trim()) return;
                    setCouponLoading(true);
                    setCouponError('');
                    const result = await applyCoupon(couponCode.trim());
                    if (!result.success) {
                      setCouponError(result.error || 'Invalid coupon.');
                    }
                    setCouponLoading(false);
                  }}
                  disabled={couponLoading || !couponCode.trim()}
                  style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                >
                  {couponLoading ? 'Applying...' : 'Apply'}
                </button>
              )}
            </div>
            {couponError && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
                {couponError}
              </div>
            )}
            {coupon && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                Coupon "{coupon.code}" applied — {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% off` : `₹${Math.round(coupon.discountValue)} off`}
              </div>
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{Math.round(getSubtotal())}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (Incl. GST):</span>
              <span>₹{Math.round(getTax())}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge:</span>
              <span>{getShipping() === 0 ? 'FREE' : `₹${getShipping()}`}</span>
            </div>
            {coupon && getDiscount() > 0 && (
              <div className="summary-row" style={{ color: 'var(--success)' }}>
                <span>Coupon Discount:</span>
                <span>-₹{Math.round(getDiscount())}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Grand Total:</span>
              <span>₹{Math.round(getGrandTotal())}</span>
            </div>

            <button className="auth-btn" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleProceed}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
