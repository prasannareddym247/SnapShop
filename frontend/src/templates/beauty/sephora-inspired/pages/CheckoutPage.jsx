import React, { useState } from 'react';

export default function CheckoutPage({ state }) {
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({ firstName: '', lastName: '', address: '', city: '', pincode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placed, setPlaced] = useState(false);

  const items = state.cart || [];
  const total = items.reduce((s, i) => s + (i.price || i.variant?.price || 0) * i.quantity, 0);

  const handlePlaceOrder = () => {
    state.clearCart?.();
    state.setLastOrderId?.(Date.now());
    setPlaced(true);
    setTimeout(() => state.navigate?.('orderSuccess'), 500);
  };

  if (placed) return null;

  return (
    <div className="bl-container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Checkout</h1>

      <div className="bl-stepper">
        {[
          { num: 1, label: 'Shipping' },
          { num: 2, label: 'Payment' },
          { num: 3, label: 'Confirm' },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            {i > 0 && <div className="bl-step-line" />}
            <div className={`bl-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="bl-step-num">{step > s.num ? '✓' : s.num}</div>
              <span className="bl-step-label">{s.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Shipping Address</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="bl-form-group"><label className="bl-form-label">First Name</label><input className="bl-form-input" value={shipping.firstName} onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Last Name</label><input className="bl-form-input" value={shipping.lastName} onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))} /></div>
          </div>
          <div className="bl-form-group"><label className="bl-form-label">Address</label><input className="bl-form-input" value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="bl-form-group"><label className="bl-form-label">City</label><input className="bl-form-input" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Pincode</label><input className="bl-form-input" value={shipping.pincode} onChange={e => setShipping(s => ({ ...s, pincode: e.target.value }))} /></div>
            <div className="bl-form-group"><label className="bl-form-label">Phone</label><input className="bl-form-input" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} /></div>
          </div>
          <button className="bl-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => setStep(2)}>Continue to Payment</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Payment Method</h3>
          {['card', 'upi', 'cod'].map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `1px solid ${paymentMethod === m ? '#c9a96e' : 'var(--bl-border)'}`, borderRadius: '12px', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input type="radio" name="payment" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} style={{ accentColor: '#c9a96e' }} />
              <span style={{ fontWeight: paymentMethod === m ? 600 : 400 }}>
                {m === 'card' ? '💳 Credit/Debit Card' : m === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}
              </span>
            </label>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="bl-btn bl-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>Back</button>
            <button className="bl-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>Review Order</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--bl-font-heading)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Confirm Order</h3>
          <div style={{ background: '#f8f5f1', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Shipping to:</p>
            <p style={{ fontSize: '0.9rem', color: '#8a8a8a' }}>{shipping.firstName} {shipping.lastName}<br />{shipping.address}, {shipping.city} — {shipping.pincode}<br />📞 {shipping.phone}</p>
          </div>
          <div style={{ background: '#f8f5f1', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Payment:</p>
            <p style={{ fontSize: '0.9rem', color: '#8a8a8a' }}>{paymentMethod === 'card' ? '💳 Credit/Debit Card' : paymentMethod === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}</p>
          </div>
          <div style={{ background: '#f8f5f1', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Order Summary</p>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{((item.price || item.variant?.price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--bl-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="bl-btn bl-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>Back</button>
            <button className="bl-btn bl-btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
}
