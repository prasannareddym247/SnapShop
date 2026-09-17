import React from 'react';

const InvoiceDetail = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
  const amount = invoice.total != null ? Number(invoice.total).toFixed(2) : '0.00';
  const subTotal = invoice.amount != null ? Number(invoice.amount).toFixed(2) : '0.00';
  const tax = invoice.tax != null ? Number(invoice.tax).toFixed(2) : '0.00';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '800px', width: '100%',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 2rem', borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc', borderRadius: '16px 16px 0 0'
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Invoice Details</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.5rem', color: '#94a3b8', padding: '0.25rem', lineHeight: 1
          }}>×</button>
        </div>

        {/* Invoice Document */}
        <div style={{ padding: '2rem' }}>
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '2rem', background: '#fff'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>INVOICE</h2>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '0.25rem 1rem',
                  borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
                  background: invoice.status === 'paid' ? '#dcfce7' :
                             invoice.status === 'pending' ? '#fef3c7' : '#fee2e2',
                  color: invoice.status === 'paid' ? '#15803d' :
                         invoice.status === 'pending' ? '#b45309' : '#b91c1c',
                  textTransform: 'capitalize'
                }}>
                  {invoice.status}
                </div>
                <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Issued: {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, #059669, #3b82f6)', marginBottom: '2rem' }} />

            {/* Billed To / Period */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                  Billed To
                </p>
                <p style={{ margin: '0.1rem 0', color: '#1e293b', fontWeight: 500 }}>Store ID: {invoice.storeId}</p>
                {invoice.tenantId && <p style={{ margin: '0.1rem 0', color: '#64748b', fontSize: '0.85rem' }}>Tenant ID: {invoice.tenantId}</p>}
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                  Billing Period
                </p>
                <p style={{ margin: '0.1rem 0', color: '#1e293b', fontSize: '0.9rem' }}>
                  {formatDate(invoice.periodStart)} — {formatDate(invoice.periodEnd)}
                </p>
              </div>
            </div>

            {/* Plan Details Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                    <strong>{invoice.planName || 'Subscription Plan'}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Trial period — no charge</p>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#1e293b' }}>
                    ₹{subTotal}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#475569' }}>
                  <span>Subtotal</span>
                  <span>₹{subTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#475569' }}>
                  <span>GST (18%)</span>
                  <span>₹{tax}</span>
                </div>
                <div style={{ height: '1px', background: '#e2e8f0', margin: '0.35rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  <span>Total</span>
                  <span>₹{amount}</span>
                </div>
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #059669, #3b82f6)', margin: '0.35rem 0' }} />
                {invoice.paidAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.8rem', color: '#15803d' }}>
                    <span>Paid on</span>
                    <span>{formatDate(invoice.paidAt)}</span>
                  </div>
                )}
                {invoice.paymentGateway && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    <span>Payment</span>
                    <span>{invoice.paymentGateway}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Thank you for choosing SnapShop. This is a computer-generated invoice.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button onClick={onClose} style={{
              padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: '0.85rem', color: '#475569'
            }}>
              Close
            </button>
            <button onClick={() => window.print()} style={{
              padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #059669, #3b82f6)', cursor: 'pointer',
              fontSize: '0.85rem', color: '#fff', fontWeight: 600
            }}>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
