import React from 'react';
export default function OrderSuccessPage({ state }) {
  return (
    <div className="custom-page-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>🎉</h1>
      <h2 style={{ color: 'green', marginTop: '1rem' }}>Order Placed Successfully!</h2>
      <p>Thank you for shopping with us. Your order hash tag reference is: <strong>#FK-926797</strong></p>
      <button className="custom-btn" style={{ marginTop: '2rem' }} onClick={() => state.navigate('home')}>Continue Shopping</button>
    </div>
  );
}