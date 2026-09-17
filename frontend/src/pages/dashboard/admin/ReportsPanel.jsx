import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const ReportsPanel = ({ user }) => {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      let res;
      switch (reportType) {
        case 'sales': res = await adminService.getSalesReport(params); break;
        case 'sellers': res = await adminService.getSellerReport(); break;
        case 'products': res = await adminService.getProductReport(); break;
        case 'revenue': res = await adminService.getRevenueReport(params); break;
        default: res = {};
      }
      setData(res);
    } catch (e) { setData({ error: 'Failed to load report' }); } finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, [reportType]);

  const reports = [
    { key: 'sales', label: 'Sales Report', icon: '📊' },
    { key: 'revenue', label: 'Revenue Report', icon: '💰' },
    { key: 'sellers', label: 'Seller Report', icon: '🏪' },
    { key: 'products', label: 'Product Report', icon: '📦' },
  ];

  const renderData = () => {
    if (!data) return <div style={{ color: '#94a3b8' }}>No data</div>;
    if (data.error) return <div style={{ color: '#ef4444' }}>{data.error}</div>;
    switch (reportType) {
      case 'sales':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <ReportCard label="Total Revenue" value={`₹${parseFloat(data.totalRevenue || 0).toLocaleString()}`} color="#10b981" />
            <ReportCard label="Total Orders" value={data.totalOrders || 0} color="#3b82f6" />
            <ReportCard label="Avg Order Value" value={`₹${parseFloat(data.averageOrderValue || 0).toFixed(2)}`} color="#8b5cf6" />
          </div>
        );
      case 'revenue':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <ReportCard label="Gross Revenue" value={`₹${parseFloat(data.grossRevenue || 0).toLocaleString()}`} color="#10b981" />
            <ReportCard label="Net Payout" value={`₹${parseFloat(data.netPayout || 0).toLocaleString()}`} color="#3b82f6" />
          </div>
        );
      case 'sellers':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            <ReportCard label="Total Sellers" value={data.totalSellers || 0} color="#3b82f6" />
            <ReportCard label="Approved" value={data.approvedSellers || 0} color="#10b981" />
            <ReportCard label="Pending" value={data.pendingSellers || 0} color="#f59e0b" />
            <ReportCard label="Suspended" value={data.suspendedSellers || 0} color="#ef4444" />
          </div>
        );
      case 'products':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            <ReportCard label="Total Products" value={data.totalProducts || 0} color="#3b82f6" />
            <ReportCard label="Active" value={data.activeProducts || 0} color="#10b981" />
            <ReportCard label="Inactive" value={data.inactiveProducts || 0} color="#94a3b8" />
            <ReportCard label="Pending" value={data.pendingProducts || 0} color="#f59e0b" />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Reports</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {reports.map(r => (
          <button key={r.key} onClick={() => setReportType(r.key)}
            style={{ padding: '8px 16px', borderRadius: 8, border: reportType === r.key ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: reportType === r.key ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: reportType === r.key ? 600 : 400, color: reportType === r.key ? '#1d4ed8' : '#475569' }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>
      {(reportType === 'sales' || reportType === 'revenue') && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, color: '#475569' }}>From: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, marginLeft: 4 }} /></label>
          <label style={{ fontSize: 13, color: '#475569' }}>To: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, marginLeft: 4 }} /></label>
          <button onClick={loadReport} style={{ padding: '6px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Apply Date Range</button>
        </div>
      )}
      {loading ? <div style={{ color: '#94a3b8' }}>Loading report...</div> : renderData()}
      {data && data.period && (
        <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Period: {new Date(data.period.start).toLocaleDateString()} – {new Date(data.period.end).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{value}</div>
  </div>
);

export default ReportsPanel;
