import React, { useState } from 'react';
import api from '../../../../services/api';

export default function CheckoutPage({ state }) {
  const [address, setAddress] = useState({ line1: '', city: '', state: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.line1 || !address.city || !address.state || !address.postalCode) {
      setError('Please fill in all shipping details.');
      return;
    }
    if (!state.auth.token) {
      setError('Please sign in to place an order.');
      return;
    }

    setPlaced(true);
    setError('');

    try {
      const payload = {
        items: state.cart.map(item => ({
          variantId: item.variantId || item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price,
          taxAmount: item.taxAmount || 0
        })),
        totalAmount: Math.round(state.cartTotal),
        taxAmount: Math.round(state.cartTotal * 0.12),
        shippingAmount: 0,
        paymentMethod,
        shippingAddress: address
      };

      const res = await api.post('/orders/checkout', payload);
      state.setLastOrderId(res.orderId);
      state.clearCart();

      if (res.orderId) {
        setInvoiceUrl(`/api/orders/invoice/${res.orderId}`);
      }

      setTimeout(() => {
        state.navigate('orderSuccess');
      }, 1000);
    } catch (err) {
      setError(err.error || 'Failed to place order. Please try again.');
      setPlaced(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '1.5rem', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>SECURE CHECKOUT</h2>

      {!state.auth.token ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px' }}>
          <h3>Sign In Required</h3>
          <p style={{ color: '#888', fontSize: '13px', margin: '1rem 0' }}>Please sign in or create an account to complete your purchase.</p>
          <button className="custom-btn" onClick={() => state.navigate('account')} style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer' }}>SIGN IN / REGISTER</button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gap: '1.5rem', background: '#fff', padding: '2rem', borderRadius: '4px', border: '1px solid #eaeaea' }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', color: '#ef4444', fontSize: '13px', borderRadius: '4px' }}>{error}</div>}

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase' }}>Delivery Address</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input type="text" required placeholder="Street address, house number" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input type="text" required placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
                <input type="text" required placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
              </div>
              <input type="text" required placeholder="Postal Code" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '13px' }} />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase' }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${paymentMethod === 'COD' ? '#2c3e50' : '#e2e8f0'}`, padding: '10px 16px', borderRadius: '2px', cursor: 'pointer' }}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Cash on Delivery</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${paymentMethod === 'Razorpay' ? '#2c3e50' : '#e2e8f0'}`, padding: '10px 16px', borderRadius: '2px', cursor: 'pointer' }}>
                <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={() => setPaymentMethod('Razorpay')} />
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Card / UPI</span>
              </label>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #eaeaea', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#888' }}>Total Items: {state.cartCount}</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>₹{state.cartTotal}</h3>
            </div>
            <button type="submit" className="custom-btn" disabled={placed} style={{ background: placed ? '#cbd5e1' : '#2c3e50', color: placed ? '#64748b' : '#fff', border: 'none', padding: '12px 32px', fontWeight: 'bold', cursor: placed ? 'not-allowed' : 'pointer', fontSize: '13px', letterSpacing: '1px' }}>
              {placed ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}