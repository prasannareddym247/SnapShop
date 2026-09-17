import React, { useState, useEffect, useMemo } from 'react';
import adminService from '../../../services/adminService';

const AuditLogViewer = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = () => {
    setLoading(true);
    adminService.getAuditLogs({ limit: 200 }).then(res => { setLogs(Array.isArray(res) ? res : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (actionFilter) {
      result = result.filter(l => (l.Action || l.action) === actionFilter);
    }
    if (userFilter) {
      const q = userFilter.toLowerCase();
      result = result.filter(l => (l.UserEmail || l.userEmail || '').toLowerCase().includes(q));
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter(l => new Date(l.CreatedAt || l.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(l => new Date(l.CreatedAt || l.createdAt) <= to);
    }
    return result;
  }, [logs, actionFilter, userFilter, dateFrom, dateTo]);

  const actions = [...new Set(logs.map(l => l.Action || l.action))].sort();

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Audit Logs</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Track administrative actions across the platform. <span style={{ fontSize: 11, color: '#94a3b8' }}>Showing {filteredLogs.length} of {logs.length} entries</span></p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="text" placeholder="Filter by user email..." value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 180 }} />
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <button onClick={load} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Refresh</button>
      </div>
      {loading ? <div style={{ color: '#94a3b8' }}>Loading logs...</div> : filteredLogs.length === 0 ? <div style={{ color: '#94a3b8' }}>No audit logs match your filters.</div> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Timestamp</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>User</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Action</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Resource</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l, i) => (
                <tr key={l.LogId || l.logId || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(l.CreatedAt || l.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{l.UserEmail || l.userEmail || `#${l.UserId || l.userId}`}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{l.Action || l.action}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{(l.ResourceType || l.resourceType || '') + ((l.ResourceId || l.resourceId) ? ` #${l.ResourceId || l.resourceId}` : '')}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeof (l.Details || l.details) === 'string' ? (l.Details || l.details) : JSON.stringify(l.Details || l.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
