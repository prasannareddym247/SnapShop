import React from 'react';
export default function CartPage({ state }) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '1.5rem', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>SHOPPING BAG ({state.cartCount} ITEMS)</h2>
      {state.cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '4rem' }}>👜</span>
          <p style={{ color: '#888', margin: '1rem 0', fontSize: '14px' }}>Your shopping bag is empty.</p>
          <button className="custom-btn" style={{ padding: '10px 24px' }} onClick={() => state.navigate('category')}>SHOP COLLECTIONS</button>
        </div>
      ) : (
        <div>
          {state.cart.map(item => {
            const stock = item.stock != null ? parseInt(item.stock) : 999;
            const isItemOutOfStock = stock === 0;
            return (
              <div key={item.variantId || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eaeaea', background: '#fff', marginBottom: '0.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={item.image || item.imageUrl || 'https://placehold.co/80x80'} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{item.brand || 'Fashion Brand'}</p>
                    {isItemOutOfStock && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>OUT OF STOCK - Will be removed at checkout</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
                    <button onClick={() => state.updateCartQuantity(item.variantId || item.id, item.quantity - 1)} style={{ padding: '4px 10px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '14px' }}>-</button>
                    <span style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => state.updateCartQuantity(item.variantId || item.id, item.quantity + 1)} style={{ padding: '4px 10px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: '14px' }}>+</button>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', minWidth: '70px', textAlign: 'right' }}>₹{item.unitPrice ? item.unitPrice * item.quantity : item.price * item.quantity}</span>
                  <button onClick={() => state.removeFromCart(item.variantId || item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>✕</button>
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '2px solid #eaeaea', paddingTop: '1.5rem' }}>
            <div>
              <button onClick={state.clearCart} style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', borderRadius: '2px', marginRight: '1rem' }}>CLEAR BAG</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '18px', fontWeight: '900' }}>Total: ₹{state.cartTotal}</span>
              <button className="custom-btn" style={{ padding: '10px 28px', background: '#2c3e50', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', letterSpacing: '1px' }} onClick={() => state.navigate('checkout')}>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}