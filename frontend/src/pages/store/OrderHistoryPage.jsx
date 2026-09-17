import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import api from '../../services/api';

const OrderHistoryPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await api.get('/orders/my-orders');
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const downloadInvoice = async (orderId) => {
    try {
      const apiBase = api.getApiBase();
      const res = await fetch(`${apiBase}/orders/invoice/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Invoice download failed.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Invoice download error:', err);
      alert('Could not download invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="cart-container animated-view">
        <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Order History</h2>
        <div style={{ color: 'var(--text-muted)' }}>Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="cart-container animated-view">
      <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Order History</h2>
      {orders.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>You have not placed any orders yet.</div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <strong>Order ID:</strong> #{order.id}
                <br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className={`order-status-badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
              </div>
            </div>

            <div style={{ margin: '1rem 0' }}>
              {order.items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>
                    {item.productName} ({item.weightGrams >= 1000 ? `${item.weightGrams / 1000}kg` : `${item.weightGrams}g`}) x {item.quantity}
                  </span>
                  <span>₹{Math.round(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <strong>Total Amount: ₹{Math.round(order.totalAmount)}</strong>
              <button className="action-btn" style={{ fontSize: '0.85rem' }} onClick={() => downloadInvoice(order.id)}>
                📄 Download PDF Invoice
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistoryPage;
