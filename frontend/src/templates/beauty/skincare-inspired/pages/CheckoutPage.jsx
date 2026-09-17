import React, { useState } from 'react';

export default function CheckoutPage({ state }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', first: '', last: '', address: '', city: '', state: '', zip: '', card: '', exp: '', cvc: '', name: '' });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) { setStep(s => s + 1); }
    else { alert('Order placed successfully! Your Pure SkinGlow order is confirmed.'); state.navigate('orderSuccess'); }
  };

  return (
    <div className="pure-page" style={{ maxWidth: '800px' }}>
      <h1>Checkout</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center' }}>
        {['Shipping', 'Payment', 'Review'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= i + 1 ? 'var(--pure-primary)' : 'var(--pure-border)', color: step >= i + 1 ? '#fff' : 'var(--pure-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{i + 1}</div>
            <span style={{ fontSize: '0.85rem', color: step >= i + 1 ? 'var(--pure-text)' : 'var(--pure-text-muted)', fontFamily: 'var(--pure-heading)' }}>{s}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Shipping Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[{ k: 'first', label: 'First Name' }, { k: 'last', label: 'Last Name' }, { k: 'email', label: 'Email' }, { k: 'address', label: 'Address' }, { k: 'city', label: 'City' }, { k: 'state', label: 'State' }, { k: 'zip', label: 'ZIP Code' }].map(f => (
                <div key={f.k} style={f.k === 'address' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--pure-text-muted)', marginBottom: '0.3rem', fontFamily: 'var(--pure-body)' }}>{f.label}</label>
                  <input required value={form[f.k]} onChange={e => update(f.k, e.target.value)} style={{ width: '100%', background: '#fff', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '0.7rem 1rem', fontFamily: 'var(--pure-body)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Payment Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[{ k: 'name', label: 'Cardholder Name' }, { k: 'card', label: 'Card Number' }, { k: 'exp', label: 'Expiry (MM/YY)' }, { k: 'cvc', label: 'CVC' }].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--pure-text-muted)', marginBottom: '0.3rem' }}>{f.label}</label>
                  <input required value={form[f.k]} onChange={e => update(f.k, e.target.value)} style={{ width: '100%', background: '#fff', border: '1px solid var(--pure-border)', borderRadius: '8px', padding: '0.7rem 1rem', fontFamily: 'var(--pure-body)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ background: 'var(--pure-bg-alt)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--pure-heading)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '1.5rem' }}>Review Your Order</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.5rem' }}>Shipping To</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--pure-text-muted)', lineHeight: 1.6 }}>{form.first} {form.last}<br />{form.address}<br />{form.city}, {form.state} {form.zip}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--pure-heading)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--pure-text)', marginBottom: '0.5rem' }}>Items ({state.cart?.length || 0})</h3>
              {(state.cart || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--pure-text-muted)', padding: '0.3rem 0' }}>
                  <span>{item.name || item.id} × {item.qty || 1}</span>
                  <span>${((item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--pure-border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 600, color: 'var(--pure-text)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--pure-primary)' }}>${(state.cart || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {step > 1 ? <button type="button" className="pure-btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button> : <div />}
          <button type="submit" className="pure-btn-primary">
            {step === 3 ? 'Place Order ✓' : step === 2 ? 'Review Order →' : 'Continue to Payment →'}
          </button>
        </div>
      </form>
    </div>
  );
}
