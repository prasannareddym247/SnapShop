import React, { useState } from 'react';
export default function CheckoutPage({ state }) {
  const [placed, setPlaced] = useState(false);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setPlaced(true);
    setTimeout(() => {
      state.setCart([]);
      state.navigate('orderSuccess');
    }, 1000);
  };

  return (
    <div className="custom-page-container">
      <h2>Checkout Details</h2>
      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gap: '1rem', background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        <div>
          <label>Delivery Address</label>
          <input type="text" required placeholder="123 Main St, New Delhi" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        <div>
          <label>Payment Method</label>
          <select style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
            <option>Cash on Delivery (COD)</option>
            <option>Credit / Debit Card</option>
            <option>UPI / Netbanking</option>
          </select>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem' }}>
          Grand Total: ₹{state.cartTotal}
        </div>
        <button type="submit" className="custom-btn" disabled={placed}>
          {placed ? 'Placing Order...' : 'Confirm and Place Order'}
        </button>
      </form>
    </div>
  );
}