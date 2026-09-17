import React, { useState } from 'react';

export default function CheckoutPage({ state }) {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartArray = Array.isArray(state.cart) ? state.cart : [];
  const subtotal = state.cartTotal || cartArray.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const shippingCost = subtotal > 5000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shippingCost + tax;

  if (orderPlaced) {
    return (
      <main style={{ padding: '5rem 4%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#00e676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1.5rem', fontWeight: 900 }}>✓</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Order Placed!</h1>
        <p style={{ color: '#757575', marginBottom: '0.5rem' }}>Your order has been confirmed. You're all set to perform.</p>
        <p style={{ fontSize: '0.85rem', color: '#111', marginBottom: '2rem' }}>Order #SP-{Date.now().toString(36).toUpperCase()}</p>
        <button className="sp-btn" onClick={() => { state.clearCart?.(); state.navigate('home'); }}>Continue Shopping</button>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 4%', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem', textAlign: 'center' }}>Checkout</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '3rem' }}>
        {['Shipping', 'Payment', 'Confirm'].map((s, idx) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: idx <= step ? '#111' : '#e0e0e0',
                color: idx <= step ? '#fff' : '#757575',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
              }}>{idx < step ? '✓' : idx + 1}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: idx <= step ? '#111' : '#757575' }}>{s}</span>
            </div>
            {idx < 2 && <div style={{ width: '40px', height: '1px', background: '#e0e0e0', margin: '0 0.75rem', alignSelf: 'center' }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="zara-form-group"><label className="zara-form-label">First Name</label><input className="zara-form-input" required value={shipping.firstName} onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))} /></div>
            <div className="zara-form-group"><label className="zara-form-label">Last Name</label><input className="zara-form-input" required value={shipping.lastName} onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))} /></div>
          </div>
          <div className="zara-form-group"><label className="zara-form-label">Email</label><input className="zara-form-input" type="email" required value={shipping.email} onChange={e => setShipping(s => ({ ...s, email: e.target.value }))} /></div>
          <div className="zara-form-group"><label className="zara-form-label">Phone</label><input className="zara-form-input" type="tel" required value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} /></div>
          <div className="zara-form-group"><label className="zara-form-label">Address</label><input className="zara-form-input" required value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="zara-form-group"><label className="zara-form-label">City</label><input className="zara-form-input" required value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} /></div>
            <div className="zara-form-group"><label className="zara-form-label">State</label><input className="zara-form-input" required value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))} /></div>
            <div className="zara-form-group"><label className="zara-form-label">ZIP</label><input className="zara-form-input" required value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} /></div>
          </div>
          <button className="sp-btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setStep(1)}>Continue →</button>
        </div>
      )}

      {step === 1 && (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '2rem', color: '#757575' }}>Demo Checkout — select a payment method</p>
          {['Credit Card', 'UPI', 'Cash on Delivery'].map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid #e0e0e0', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="payment" style={{ accentColor: '#111' }} />
              <span style={{ fontSize: '0.85rem' }}>{m}</span>
            </label>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="sp-btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)}>← Back</button>
            <button className="sp-btn" style={{ flex: 1 }} onClick={() => setStep(2)}>Review →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Order Summary</h3>
          {cartArray.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <span>{item.name} × {item.quantity || 1}</span>
              <span style={{ fontWeight: 600 }}>₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
            </div>
          ))}
          <div className="zara-cart-totals" style={{ marginTop: '1rem' }}>
            <div className="zara-cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="zara-cart-total-row"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span></div>
            <div className="zara-cart-total-row"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="zara-cart-total-row grand"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="sp-btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
            <button className="sp-btn" style={{ flex: 1 }} onClick={() => setOrderPlaced(true)}>Place Order</button>
          </div>
        </div>
      )}
    </main>
  );
}
