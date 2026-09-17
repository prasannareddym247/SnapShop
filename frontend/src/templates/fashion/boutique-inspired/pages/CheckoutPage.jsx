import React, { useState } from 'react';

export default function CheckoutPage({ state }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', first: '', last: '', address: '', city: '', stateProv: '', zip: '', card: '', exp: '', cvc: '', nameOnCard: '' });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) { setStep(s => s + 1); }
    else { alert('Your order has been placed. Merci — a confirmation will arrive shortly.'); state.navigate('orderSuccess'); }
  };

  return (
    <div className="mb-page" style={{ maxWidth: '800px' }}>
      <h1>Checkout</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center' }}>
        {['Shipping', 'Payment', 'Review'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= i + 1 ? 'var(--mb-primary)' : 'var(--mb-border)', color: step >= i + 1 ? '#fff' : 'var(--mb-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--mb-font-heading)' }}>{i + 1}</div>
            <span style={{ fontSize: '0.82rem', color: step >= i + 1 ? 'var(--mb-text)' : 'var(--mb-text-muted)', fontFamily: 'var(--mb-font-body)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Shipping Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[{ k: 'first', label: 'First Name' }, { k: 'last', label: 'Last Name' }, { k: 'email', label: 'Email' }, { k: 'address', label: 'Address' }, { k: 'city', label: 'City' }, { k: 'stateProv', label: 'State/Province' }, { k: 'zip', label: 'Postal Code' }].map(f => (
                <div key={f.k} style={f.k === 'address' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mb-text-muted)', marginBottom: '0.3rem', fontFamily: 'var(--mb-font-body)' }}>{f.label}</label>
                  <input required value={form[f.k]} onChange={e => update(f.k, e.target.value)} style={{ width: '100%', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Payment Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[{ k: 'nameOnCard', label: 'Cardholder Name' }, { k: 'card', label: 'Card Number' }, { k: 'exp', label: 'Expiry (MM/YY)' }, { k: 'cvc', label: 'CVC' }].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--mb-text-muted)', marginBottom: '0.3rem' }}>{f.label}</label>
                  <input required value={form[f.k]} onChange={e => update(f.k, e.target.value)} style={{ width: '100%', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'var(--mb-font-body)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ background: 'var(--mb-bg-alt)', borderRadius: '14px', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '1.5rem' }}>Review Your Order</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.5rem' }}>Shipping To</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--mb-text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{form.first} {form.last}<br />{form.address}<br />{form.city}, {form.stateProv} {form.zip}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--mb-font-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--mb-text)', marginBottom: '0.5rem' }}>Items ({state.cart?.length || 0})</h3>
              {(state.cart || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--mb-text-muted)', padding: '0.3rem 0', fontWeight: 300 }}>
                  <span>{item.name || item.id} × {item.qty || 1}</span>
                  <span>${((item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--mb-border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, color: 'var(--mb-text)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--mb-secondary)' }}>${(state.cart || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {step > 1 ? <button type="button" className="mb-btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button> : <div />}
          <button type="submit" className="mb-btn-primary">
            {step === 3 ? 'Place Order ✓' : step === 2 ? 'Review Order →' : 'Continue to Payment →'}
          </button>
        </div>
      </form>
    </div>
  );
}
