import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const SystemHealthPanel = ({ user }) => {
  const [health, setHealth] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      adminService.getSystemHealth(),
      adminService.getSystemEvents({ severity: eventFilter || undefined })
    ]).then(([h, e]) => { setHealth(h); setEvents(Array.isArray(e) ? e : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resolveEvent = async (id) => {
    try { await adminService.resolveSystemEvent(id); load(); } catch (e) { alert('Failed'); }
  };

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading system health...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>System Health</h2>
      {health && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Status</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: health.status === 'healthy' ? '#10b981' : '#ef4444' }}>{health.status?.toUpperCase()}</div>
          </div>
          {Object.entries(health.checks || {}).map(([key, check]) => (
            <div key={key} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6, textTransform: 'capitalize' }}>{key}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: check.status === 'ok' ? '#10b981' : check.status === 'warning' ? '#f59e0b' : '#ef4444' }}>{check.status?.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{check.message}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>System Events</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={eventFilter} onChange={e => { setEventFilter(e.target.value); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
            <option value="">All Severity</option><option value="info">Info</option><option value="warning">Warning</option><option value="error">Error</option><option value="critical">Critical</option>
          </select>
          <button onClick={load} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Refresh</button>
        </div>
      </div>
      {events.length === 0 ? <div style={{ color: '#94a3b8', fontSize: 13 }}>No system events.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(e => {
            const sev = e.Severity || e.severity;
            const colors = { info: '#3b82f6', warning: '#f59e0b', error: '#ef4444', critical: '#dc2626' };
            return (
              <div key={e.EventId || e.eventId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: (colors[sev] || '#64748b') + '20', color: colors[sev] || '#64748b' }}>{sev}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{e.EventType || e.eventType}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(e.CreatedAt || e.createdAt).toLocaleString()}</span>
                    {e.Resolved ? <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#d1fae5', color: '#065f46' }}>Resolved</span> : null}
                    {e.Source || e.source ? <span style={{ fontSize: 11, color: '#94a3b8' }}>Source: {e.Source || e.source}</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{e.Message || e.message}</div>
                </div>
                {!e.Resolved && !e.resolved && (
                  <button onClick={() => resolveEvent(e.EventId || e.eventId)} style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>Resolve</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SystemHealthPanel;
