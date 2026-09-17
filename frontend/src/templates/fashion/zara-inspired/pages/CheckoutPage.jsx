import React, { useState } from 'react';

const STEPS = ['Shipping', 'Payment', 'Review'];

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', desc: '3-5 business days', price: 0 },
  { id: 'express', label: 'Express Delivery', desc: '1-2 business days', price: 499 },
  { id: 'same-day', label: 'Same-Day Delivery', desc: 'Within 4 hours', price: 999 },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'cod', label: 'Cash on Delivery' },
];

export default function CheckoutPage({ state }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'India',
  });
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartArray = Array.isArray(state.cart) ? state.cart : [];
  const subtotal = state.cartTotal || cartArray.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const delPrice = DELIVERY_OPTIONS.find(d => d.id === deliveryOption)?.price || 0;
  const shippingCost = subtotal > 5000 && delPrice === 0 ? 0 : (delPrice || (subtotal > 5000 ? 0 : 199));
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  const handlePlaceOrder = () => {
    state.clearCart?.();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <main className="zara-template" style={{ padding: '4rem 4%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 300, margin: '0 0 0.5rem' }}>Order Placed Successfully</h1>
        <p style={{ color: '#757575', marginBottom: '1rem' }}>Your order has been confirmed. You'll receive a confirmation email shortly.</p>
        <p style={{ fontSize: '0.85rem', color: '#757575', marginBottom: '2rem' }}>Order #ZARA-{Date.now().toString(36).toUpperCase()}</p>
        <button className="zara-btn zara-btn-dark" onClick={() => { state.setLastOrderId?.(Date.now()); state.navigate('home'); }}>Continue Shopping</button>
      </main>
    );
  }

  return (
    <main className="zara-template" style={{ padding: '2rem 4%', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '2rem', textAlign: 'center' }}>Checkout</h1>

      <div className="zara-stepper">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step}>
            <div className={`zara-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
              <span className="zara-step-number">{idx < currentStep ? '✓' : idx + 1}</span>
              <span className="zara-step-label">{step}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="zara-step-line" />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>
        <div>
          {currentStep === 0 && (
            <form onSubmit={handleShippingSubmit}>
              <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Shipping Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="zara-form-group">
                  <label className="zara-form-label">First Name</label>
                  <input className="zara-form-input" required value={shipping.firstName} onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))} />
                </div>
                <div className="zara-form-group">
                  <label className="zara-form-label">Last Name</label>
                  <input className="zara-form-input" required value={shipping.lastName} onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Email</label>
                <input className="zara-form-input" type="email" required value={shipping.email} onChange={e => setShipping(s => ({ ...s, email: e.target.value }))} />
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Phone</label>
                <input className="zara-form-input" type="tel" required value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="zara-form-group">
                <label className="zara-form-label">Address</label>
                <input className="zara-form-input" required value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="zara-form-group">
                  <label className="zara-form-label">City</label>
                  <input className="zara-form-input" required value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} />
                </div>
                <div className="zara-form-group">
                  <label className="zara-form-label">State</label>
                  <input className="zara-form-input" required value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))} />
                </div>
                <div className="zara-form-group">
                  <label className="zara-form-label">ZIP Code</label>
                  <input className="zara-form-input" required value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} />
                </div>
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 500, margin: '2rem 0 1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Delivery Method</h2>
              {DELIVERY_OPTIONS.map(opt => (
                <label key={opt.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                  border: `1px solid ${deliveryOption === opt.id ? '#000' : '#e8e8e8'}`,
                  marginBottom: '0.5rem', cursor: 'pointer', transition: 'border-color 0.2s',
                }}>
                  <input type="radio" name="delivery" checked={deliveryOption === opt.id} onChange={() => setDeliveryOption(opt.id)} style={{ accentColor: '#000' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: '0.75rem', color: '#757575', margin: '0.15rem 0 0' }}>{opt.desc}</p>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{opt.price === 0 ? 'FREE' : `₹${opt.price}`}</span>
                </label>
              ))}

              <button type="submit" className="zara-btn zara-btn-dark" style={{ marginTop: '1.5rem', width: '100%' }}>Continue to Payment</button>
            </form>
          )}

          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Payment Method</h2>
              {PAYMENT_METHODS.map(method => (
                <label key={method.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                  border: `1px solid ${paymentMethod === method.id ? '#000' : '#e8e8e8'}`,
                  marginBottom: '0.5rem', cursor: 'pointer',
                }}>
                  <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} style={{ accentColor: '#000' }} />
                  <span style={{ fontSize: '0.85rem' }}>{method.label}</span>
                </label>
              ))}

              {paymentMethod === 'card' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="zara-form-group">
                    <label className="zara-form-label">Card Number</label>
                    <input className="zara-form-input" placeholder="XXXX XXXX XXXX XXXX" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="zara-form-group">
                      <label className="zara-form-label">Expiry</label>
                      <input className="zara-form-input" placeholder="MM/YY" />
                    </div>
                    <div className="zara-form-group">
                      <label className="zara-form-label">CVV</label>
                      <input className="zara-form-input" placeholder="XXX" type="password" />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="zara-btn" style={{ flex: 1, border: '1px solid #000', color: '#000' }} onClick={() => setCurrentStep(0)}>← Back</button>
                <button className="zara-btn zara-btn-dark" style={{ flex: 1 }} onClick={() => setCurrentStep(2)}>Review Order →</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Review Your Order</h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Shipping To</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.address}<br />
                  {shipping.city}, {shipping.state} {shipping.zip}<br />
                  {shipping.country}<br />
                  {shipping.email} | {shipping.phone}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Items ({cartArray.length})</h3>
                {cartArray.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                    <span>{item.name} × {item.quantity || 1}</span>
                    <span>₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="zara-btn" style={{ flex: 1, border: '1px solid #000', color: '#000' }} onClick={() => setCurrentStep(1)}>← Back</button>
                <button className="zara-btn zara-btn-dark" style={{ flex: 1 }} onClick={handlePlaceOrder}>Place Order</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#fafafa', padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 1rem' }}>Order Summary</h3>
          {cartArray.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #eee' }}>
              <span style={{ flex: 1 }}>{item.name} × {item.quantity || 1}</span>
              <span style={{ fontWeight: 500 }}>₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
            </div>
          ))}
          <div className="zara-cart-totals" style={{ marginTop: '1rem' }}>
            <div className="zara-cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="zara-cart-total-row"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span></div>
            <div className="zara-cart-total-row"><span>Tax (5%)</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="zara-cart-total-row grand"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
