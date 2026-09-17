import React from 'react';
import api from '../../../../services/api';
export default function OrderSuccessPage({ state }) {
  const orderId = state.lastOrderId;

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`${api.getApiBase()}/orders/invoice/${orderId}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to download invoice.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download invoice.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '3rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '4rem' }}>✅</span>
        <h2 style={{ color: '#10b981', margin: '1rem 0 0.5rem', fontSize: '24px' }}>Order Placed Successfully!</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '0.5rem' }}>Thank you for shopping with us.</p>
        {orderId && (
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '4px', margin: '1.5rem 0', display: 'inline-block' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Order Reference: </span>
            <strong style={{ fontSize: '16px', color: '#2c3e50' }}>#FK-{orderId}</strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {orderId && (
            <button onClick={handleDownloadInvoice} style={{ background: '#2c3e50', color: '#fff', border: 'none', padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.5px', borderRadius: '2px' }}>
              📄 DOWNLOAD INVOICE
            </button>
          )}
          <button className="custom-btn" onClick={() => state.navigate('home')} style={{ background: '#fff', color: '#2c3e50', border: '1px solid #2c3e50', padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.5px', borderRadius: '2px' }}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
}