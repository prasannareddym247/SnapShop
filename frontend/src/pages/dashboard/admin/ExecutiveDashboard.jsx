import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{value}</div>
  </div>
);

const ExecutiveDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats().then(res => { setStats(res); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading dashboard...</div>;
  if (!stats) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Failed to load dashboard stats.</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Executive Dashboard</h2>
      <p style={{ marginBottom: 24, color: '#64748b', fontSize: 14 }}>Welcome, {user?.email}. Here is your platform overview.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Revenue" value={`₹${parseFloat(stats.totalRevenue || 0).toLocaleString()}`} color="#10b981" />
        <StatCard label="Total Orders" value={stats.totalOrders || 0} color="#3b82f6" />
        <StatCard label="Avg Order Value" value={`₹${parseFloat(stats.averageOrderValue || 0).toFixed(2)}`} color="#8b5cf6" />
        <StatCard label="Vendors" value={`${stats.approvedVendors || 0} / ${stats.totalVendors || 0}`} color="#f59e0b" />
        <StatCard label="Customers" value={stats.totalCustomers || 0} color="#06b6d4" />
        <StatCard label="Open Tickets" value={stats.openTickets || 0} color={stats.criticalTickets > 0 ? '#ef4444' : '#f59e0b'} />
        <StatCard label="Critical Tickets" value={stats.criticalTickets || 0} color="#ef4444" />
        <StatCard label="Unread Notifications" value={stats.unreadNotifications || 0} color="#ec4899" />
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }} onClick={() => window.location.hash = '#admin/stores'}>Manage Stores</span>
          <span style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }} onClick={() => window.location.hash = '#admin/support'}>Support Tickets</span>
          <span style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }} onClick={() => window.location.hash = '#admin/reports'}>View Reports</span>
          <span style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }} onClick={() => window.location.hash = '#admin/settings'}>Platform Settings</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
