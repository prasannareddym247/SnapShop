import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const StoresManagement = ({ user }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStore, setSelectedStore] = useState(null);
  const loadStores = () => {
    setLoading(true);
    adminService.getStores().then(res => { setStores(Array.isArray(res) ? res : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadStores(); }, []);

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.storeName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Change store #${id} status to ${status}?`)) return;
    try { await adminService.updateStoreStatus(id, status); loadStores(); } catch (e) { alert('Failed'); }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Store Management</h2>
      <p style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>{stores.length} stores registered</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Search stores..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, flex: 1, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
          <option value="All">All Status</option><option value="Approved">Approved</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option><option value="Rejected">Rejected</option>
        </select>
      </div>
      {loading ? <div style={{ color: '#94a3b8', padding: 20 }}>Loading stores...</div> : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Store</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Owner</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Products</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.storeId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{s.storeName}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{s.ownerName}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{s.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: s.status === 'Approved' ? '#d1fae5' : s.status === 'Pending' ? '#fef3c7' : s.status === 'Suspended' ? '#fee2e2' : '#f1f5f9',
                      color: s.status === 'Approved' ? '#065f46' : s.status === 'Pending' ? '#92400e' : s.status === 'Suspended' ? '#991b1b' : '#475569'
                    }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{s.productCount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {s.status !== 'Approved' && <button onClick={() => handleStatusChange(s.storeId, 'Approved')} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Approve</button>}
                      {s.status !== 'Suspended' && s.status === 'Approved' && <button onClick={() => handleStatusChange(s.storeId, 'Suspended')} style={{ padding: '4px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Suspend</button>}
                      {s.status === 'Suspended' && <button onClick={() => handleStatusChange(s.storeId, 'Approved')} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Reactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StoresManagement;
