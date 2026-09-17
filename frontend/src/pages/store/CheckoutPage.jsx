import React, { useState } from 'react';
import { useCart } from '../../app/context/CartContext';
import { useAuth } from '../../app/context/AuthContext';
import api from '../../services/api';

const CheckoutPage = ({ onOrderPlaced }) => {
  const { token } = useAuth();
  const { cart, coupon, getGrandTotal, getTax, getShipping, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      setCheckoutMessage('Please fill in all shipping details.');
      return;
    }

    setCheckoutMessage('Placing your order...');
    setSubmitting(true);

    try {
      const payload = {
        items: cart.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxAmount: item.taxAmount
        })),
        totalAmount: Math.round(getGrandTotal()),
        taxAmount: Math.round(getTax()),
        shippingAmount: getShipping(),
        shippingAddress
      };

      const data = await api.post('/orders/checkout', payload);
      setCheckoutMessage('Order placed successfully!');
      clearCart();
      setTimeout(() => {
        if (onOrderPlaced) onOrderPlaced(data.orderId);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCheckoutMessage(`Checkout Error: ${err.error || 'Error placing order.'}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-container animated-view">
      <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Checkout & Billing</h2>

      {checkoutMessage && (
        <div style={{ 
          background: 'var(--primary-glow)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: '1.5rem', 
          fontWeight: 600, 
          color: 'var(--primary)' 
        }}>
          {checkoutMessage}
        </div>
      )}

      <form onSubmit={handleCheckout}>
        <h4 style={{ marginBottom: '1rem' }}>Delivery Information</h4>
        <div className="form-group">
          <label>Shipping Address Line 1</label>
          <input 
            className="form-input" 
            type="text" 
            required 
            placeholder="Flat, House No., Street Area" 
            value={shippingAddress.line1} 
            onChange={e => setShippingAddress({ ...shippingAddress, line1: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input 
            className="form-input" 
            type="text" 
            required 
            placeholder="Mumbai" 
            value={shippingAddress.city} 
            onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <input 
            className="form-input" 
            type="text" 
            required 
            placeholder="Maharashtra" 
            value={shippingAddress.state} 
            onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })} 
          />
        </div>
        <div className="form-group">
          <label>Postal Code (PIN)</label>
          <input 
            className="form-input" 
            type="text" 
            required 
            placeholder="400001" 
            value={shippingAddress.postalCode} 
            onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} 
          />
        </div>

        <div className="cart-summary" style={{ background: '#f8fafc', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Checkout Summary</h4>
          <div className="summary-row">
            <span>Grand Total:</span>
            <span style={{ fontWeight: 700 }}>₹{Math.round(getGrandTotal())}</span>
          </div>
        </div>

        <button type="submit" className="auth-btn" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
          {submitting ? 'Processing...' : `Place Order - ₹${Math.round(getGrandTotal())}`}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
