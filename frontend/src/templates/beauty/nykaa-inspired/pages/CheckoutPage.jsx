import React, { useState } from 'react';

export default function CheckoutPage({ state }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', address: '', city: '', zip: '', country: 'US', card: '', exp: '', cvc: '', name: '' });
  const items = state.cart || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="glam-section" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--glam-heading)', fontSize: '2.5rem', marginBottom: '2rem' }}>Checkout</h1>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', justifyContent: 'center' }}>
        {['Shipping', 'Payment', 'Confirm'].map((label, i) => {
          const s = i + 1;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: s <= step ? 'var(--glam-primary)' : 'var(--glam-surface)', border: '2px solid', borderColor: s <= step ? 'var(--glam-primary)' : 'var(--glam-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s <= step ? '#fff' : 'var(--glam-text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>{s}</div>
              <span style={{ fontFamily: 'var(--glam-accent-font)', fontSize: '0.8rem', fontWeight: 600, color: s <= step ? 'var(--glam-text)' : 'var(--glam-text-muted)' }}>{label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div>
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Shipping Address</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <input placeholder="Email" value={form.email} onChange={update('email')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input placeholder="First Name" value={form.firstName} onChange={update('firstName')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                  <input placeholder="Last Name" value={form.lastName} onChange={update('lastName')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                </div>
                <input placeholder="Address" value={form.address} onChange={update('address')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input placeholder="City" value={form.city} onChange={update('city')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                  <input placeholder="ZIP Code" value={form.zip} onChange={update('zip')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                  <select value={form.country} onChange={update('country')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }}><option value="US">US</option><option value="CA">Canada</option><option value="UK">UK</option></select>
                </div>
              </div>
              <button className="glam-btn-primary" style={{ marginTop: '2rem' }} onClick={() => setStep(2)}>Continue to Payment →</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Payment</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['💳 Card', '🅿️ PayPal', '🍏 Apple Pay'].map(m => <button key={m} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-accent-font)', fontSize: '0.78rem', cursor: 'pointer' }}>{m}</button>)}
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <input placeholder="Card Number" value={form.card} onChange={update('card')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input placeholder="MM/YY" value={form.exp} onChange={update('exp')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                  <input placeholder="CVC" value={form.cvc} onChange={update('cvc')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
                </div>
                <input placeholder="Name on Card" value={form.name} onChange={update('name')} style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '0.85rem 1rem', color: 'var(--glam-text)', fontFamily: 'var(--glam-body)', outline: 'none', fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="glam-btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="glam-btn-primary" onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Confirm Order</h2>
              <div style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--glam-accent-font)', fontSize: '0.82rem', color: 'var(--glam-primary)', marginBottom: '0.5rem' }}>Shipping To</h3>
                <p style={{ color: 'var(--glam-text-muted)' }}>{form.firstName} {form.lastName}<br />{form.address}<br />{form.city}, {form.zip}</p>
              </div>
              <div style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '6px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--glam-accent-font)', fontSize: '0.82rem', color: 'var(--glam-primary)', marginBottom: '0.5rem' }}>Payment</h3>
                <p style={{ color: 'var(--glam-text-muted)' }}>Card ending in {form.card.slice(-4) || '1234'}</p>
              </div>
              {(items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glam-border)', fontSize: '0.88rem', color: 'var(--glam-text-muted)' }}>
                  <span>{item.name} × {item.qty || 1}</span>
                  <span>${((item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="glam-btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button className="glam-btn-primary" onClick={() => { state.navigate('orderSuccess'); }}>Place Order — ${total.toFixed(2)}</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ background: 'var(--glam-surface)', border: '1px solid var(--glam-border)', borderRadius: '8px', padding: '1.5rem', position: 'sticky', top: '100px', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--glam-heading)', fontSize: '1.1rem', marginBottom: '1rem' }}>Summary</h3>
          <div className="glam-cart-totals">
            <div className="glam-cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="glam-cart-total-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="glam-cart-total-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
