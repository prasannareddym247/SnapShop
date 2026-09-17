import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const PriorityBadge = ({ priority }) => {
  const colors = { low: '#64748b', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };
  return <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: colors[priority] + '20', color: colors[priority] }}>{priority}</span>;
};

const StatusBadge = ({ status }) => {
  const colors = { open: '#3b82f6', in_progress: '#f59e0b', resolved: '#10b981', closed: '#64748b' };
  return <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: colors[status] + '20', color: colors[status] }}>{status?.replace('_', ' ')}</span>;
};

const fmtDate = (d) => d ? new Date(d).toLocaleString() : '-';
const fmtName = (t) => { const a = (t.FirstName || t.firstName || '').trim(); const b = (t.LastName || t.lastName || '').trim(); return (a || b) ? a + ' ' + b : ''; };

const SupportCenter = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [stats, setStats] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('replies');

  const loadTickets = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (categoryFilter) params.category = categoryFilter;
    adminService.getSupportTickets(params).then(res => { setTickets(Array.isArray(res) ? res : []); setLoading(false); }).catch(() => setLoading(false));
    adminService.getSupportTicketStats().then(setStats).catch(() => {});
  };

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => { loadTickets(); }, [statusFilter, priorityFilter, categoryFilter]);

  const openTicket = async (id) => {
    try { const t = await adminService.getSupportTicketDetail(id); setSelectedTicket(t); setDetailTab('replies'); } catch (e) { alert('Failed to load ticket'); }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try { await adminService.addSupportReply(selectedTicket.TicketId || selectedTicket.ticketId, replyText); setReplyText(''); openTicket(selectedTicket.TicketId || selectedTicket.ticketId); } catch (e) { alert('Failed to send reply'); }
  };

  const addInternalNote = async () => {
    if (!internalNoteText.trim()) return;
    try { await adminService.addSupportReply(selectedTicket.TicketId || selectedTicket.ticketId, internalNoteText, true); setInternalNoteText(''); openTicket(selectedTicket.TicketId || selectedTicket.ticketId); } catch (e) { alert('Failed to add note'); }
  };

  const updateTicket = async (ticket, data) => {
    const id = ticket.TicketId || ticket.ticketId;
    const cat = ticket.Category || ticket.category;
    const currentStatus = ticket.Status || ticket.status;
    try {
      if (cat === 'Seller Verification' && currentStatus === 'open' && data.status === 'resolved') {
        if (!confirm('Resolving this ticket will APPROVE the seller. Continue?')) return;
        await adminService.approveVendor(ticket.UserId || ticket.userId);
        await adminService.updateSupportTicket(id, { status: 'resolved' });
      } else if (cat === 'Seller Verification' && currentStatus === 'open' && (data.status === 'closed' || data.status === 'rejected')) {
        if (!confirm('Changing status to ' + data.status + ' will REJECT the seller. Continue?')) return;
        await adminService.rejectVendor(ticket.UserId || ticket.userId);
        await adminService.updateSupportTicket(id, { status: 'closed' });
      } else {
        await adminService.updateSupportTicket(id, data);
      }
      loadTickets();
      if (selectedTicket && (selectedTicket.TicketId === id || selectedTicket.ticketId === id)) openTicket(id);
    } catch (e) { alert('Failed: ' + (e.error || e.message || 'Server error')); }
  };

  const handleApproveSeller = async (ticket) => {
    if (!confirm('Approve this seller? Their store will be activated.')) return;
    setActionLoading(true);
    try {
      const userId = ticket.UserId || ticket.userId;
      await adminService.approveVendor(userId);
      alert('Seller approved successfully!');
      loadTickets();
      if (selectedTicket && (selectedTicket.TicketId === (ticket.TicketId || ticket.ticketId))) setSelectedTicket(null);
    } catch (e) { alert('Failed to approve seller.'); }
    setActionLoading(false);
  };

  const handleRejectSeller = async (ticket) => {
    if (!confirm('Reject this seller? Their application will be declined.')) return;
    setActionLoading(true);
    try {
      const userId = ticket.UserId || ticket.userId;
      await adminService.rejectVendor(userId);
      alert('Seller rejected.');
      loadTickets();
      if (selectedTicket && (selectedTicket.TicketId === (ticket.TicketId || ticket.ticketId))) setSelectedTicket(null);
    } catch (e) { alert('Failed to reject seller.'); }
    setActionLoading(false);
  };

  const filteredTickets = search
    ? tickets.filter(t => {
        const q = search.toLowerCase();
        const subject = (t.Subject || t.subject || '').toLowerCase();
        const store = (t.StoreName || t.storeName || '').toLowerCase();
        const email = (t.UserEmail || t.userEmail || '').toLowerCase();
        return subject.includes(q) || store.includes(q) || email.includes(q);
      })
    : tickets;

  const ticketId = (t) => t.TicketId || t.ticketId;
  const ticketSubject = (t) => t.Subject || t.subject;
  const ticketStore = (t) => t.StoreName || t.storeName;
  const ticketPriority = (t) => t.Priority || t.priority;
  const ticketStatus = (t) => t.Status || t.status;
  const ticketCategory = (t) => t.Category || t.category;
  const ticketBusinessType = (t) => t.BusinessType || t.businessType || '-';
  const ticketPlanKey = (t) => t.PlanKey || t.planKey || '-';

  return (
    <div>
      <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Support Center</h2>
      {stats && <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries({ total: stats.total, open: stats.open, 'in progress': stats.inProgress, resolved: stats.resolved, closed: stats.closed, critical: stats.critical }).map(([k, v]) => (
          <div key={k} style={{ background: '#fff', borderRadius: 8, padding: '8px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>{k}: </span><strong style={{ color: '#1e293b' }}>{v}</strong>
          </div>
        ))}
      </div>}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
          <option value="">All Status</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
          <option value="">All Priority</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
          <option value="">All Categories</option><option value="Seller Verification">Seller Verification</option><option value="general">General</option><option value="billing">Billing</option><option value="technical">Technical</option>
        </select>
        <button onClick={loadTickets} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#475569' }}>Refresh</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 20, color: '#94a3b8' }}>Loading...</div> : filteredTickets.length === 0 ? <div style={{ padding: 20, color: '#94a3b8' }}>No tickets found.</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Subject</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Store</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Business Type</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Plan</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Priority</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#475569' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => (
                    <tr key={ticketId(t)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => openTicket(ticketId(t))}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticketSubject(t)}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{ticketStore(t)}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{ticketBusinessType(t)}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}><span style={{ textTransform: 'capitalize' }}>{ticketPlanKey(t)}</span></td>
                      <td style={{ padding: '10px 14px' }}><PriorityBadge priority={ticketPriority(t)} /></td>
                      <td style={{ padding: '10px 14px' }}><StatusBadge status={ticketStatus(t)} /></td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <select value={ticketStatus(t)} onChange={e => updateTicket(t, { status: e.target.value })} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }}>
                            <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                          </select>
                          {ticketCategory(t) === 'Seller Verification' && ticketStatus(t) === 'open' && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => handleApproveSeller(t)} disabled={actionLoading} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
                              <button onClick={() => handleRejectSeller(t)} disabled={actionLoading} style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {selectedTicket && (
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>#{selectedTicket.TicketId || selectedTicket.ticketId} {ticketSubject(selectedTicket)}</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: 13, color: '#475569' }}>Ticket Info</div>
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 13 }}>
                <div><span style={{ color: '#94a3b8' }}>Subject</span><br/><span style={{ color: '#1e293b' }}>{ticketSubject(selectedTicket)}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Category</span><br/>{ticketCategory(selectedTicket)}</div>
                <div><span style={{ color: '#94a3b8' }}>Priority</span><br/><PriorityBadge priority={ticketPriority(selectedTicket)} /></div>
                <div><span style={{ color: '#94a3b8' }}>Status</span><br/><StatusBadge status={ticketStatus(selectedTicket)} /></div>
                <div><span style={{ color: '#94a3b8' }}>Business Type</span><br/><span style={{ color: '#1e293b' }}>{ticketBusinessType(selectedTicket)}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Plan</span><br/><span style={{ textTransform: 'capitalize', color: '#1e293b' }}>{ticketPlanKey(selectedTicket)}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Created</span><br/><span style={{ color: '#1e293b' }}>{fmtDate(selectedTicket.CreatedAt || selectedTicket.createdAt)}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Updated</span><br/><span style={{ color: '#1e293b' }}>{fmtDate(selectedTicket.UpdatedAt || selectedTicket.updatedAt)}</span></div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: 13, color: '#475569' }}>Seller Information</div>
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 13 }}>
                <div><span style={{ color: '#94a3b8' }}>Name</span><br/><span style={{ color: '#1e293b' }}>{fmtName(selectedTicket)}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Email</span><br/><span style={{ color: '#1e293b' }}>{selectedTicket.UserEmail || selectedTicket.userEmail}</span></div>
                <div><span style={{ color: '#94a3b8' }}>User ID</span><br/><span style={{ color: '#1e293b' }}>#{selectedTicket.UserId || selectedTicket.userId}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Registered</span><br/><span style={{ color: '#1e293b' }}>{fmtDate(selectedTicket.UserCreatedAt || selectedTicket.userCreatedAt)}</span></div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: 13, color: '#475569' }}>Store Information</div>
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 13 }}>
                <div><span style={{ color: '#94a3b8' }}>Store Name</span><br/><span style={{ color: '#1e293b' }}>{selectedTicket.StoreName || selectedTicket.storeName || selectedTicket.StoreName2 || selectedTicket.storeName2 || '-'}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Store ID</span><br/><span style={{ color: '#1e293b' }}>#{selectedTicket.StoreId || selectedTicket.storeId}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Active</span><br/><span style={{ color: '#1e293b' }}>{selectedTicket.StoreIsActive != null ? (selectedTicket.StoreIsActive || selectedTicket.storeIsActive ? 'Yes' : 'No') : '-'}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Created</span><br/><span style={{ color: '#1e293b' }}>{fmtDate(selectedTicket.StoreCreatedAt || selectedTicket.storeCreatedAt)}</span></div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: 13, color: '#475569' }}>Ticket Description</div>
              <div style={{ padding: 14, fontSize: 13, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedTicket.Description || selectedTicket.description}</div>
            </div>

            <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: 16 }}>
              <button onClick={() => setDetailTab('replies')} style={{ padding: '8px 16px', background: detailTab === 'replies' ? '#f1f5f9' : 'transparent', border: 'none', borderBottom: detailTab === 'replies' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: detailTab === 'replies' ? 600 : 400, color: '#475569' }}>Replies</button>
              <button onClick={() => setDetailTab('internal')} style={{ padding: '8px 16px', background: detailTab === 'internal' ? '#f1f5f9' : 'transparent', border: 'none', borderBottom: detailTab === 'internal' ? '2px solid #f59e0b' : '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: detailTab === 'internal' ? 600 : 400, color: '#475569' }}>Internal Notes</button>
            </div>
            {detailTab === 'replies' && (
              <div>
                <div style={{ marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>
                  {(selectedTicket.replies || []).filter(r => !r.IsInternal && !r.isInternal).length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>No replies yet.</div>
                  ) : (
                    (selectedTicket.replies || []).filter(r => !r.IsInternal && !r.isInternal).map((r, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: i % 2 === 0 ? '#f8fafc' : '#fff', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                        <div style={{ color: '#3b82f6', fontSize: 11, marginBottom: 4 }}>{fmtName(r) || r.UserRole || r.userRole} · {fmtDate(r.CreatedAt || r.createdAt)}</div>
                        <div style={{ color: '#475569' }}>{r.Message || r.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                <button onClick={sendReply} disabled={!replyText.trim()} style={{ marginTop: 8, padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, opacity: replyText.trim() ? 1 : 0.5 }}>Send Reply</button>
              </div>
            )}
            {detailTab === 'internal' && (
              <div>
                <div style={{ marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>
                  {(selectedTicket.replies || []).filter(r => r.IsInternal || r.isInternal).length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>No internal notes.</div>
                  ) : (
                    (selectedTicket.replies || []).filter(r => r.IsInternal || r.isInternal).map((r, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: 8, marginBottom: 6, fontSize: 13, borderLeft: '3px solid #f59e0b' }}>
                        <div style={{ color: '#92400e', fontSize: 11, marginBottom: 4 }}>{fmtName(r) || r.UserRole || r.userRole} · {fmtDate(r.CreatedAt || r.createdAt)}</div>
                        <div style={{ color: '#78350f' }}>{r.Message || r.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <textarea value={internalNoteText} onChange={e => setInternalNoteText(e.target.value)} placeholder="Add internal note (not visible to seller)..." rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #f59e0b', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                <button onClick={addInternalNote} disabled={!internalNoteText.trim()} style={{ marginTop: 8, padding: '8px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, opacity: internalNoteText.trim() ? 1 : 0.5 }}>Add Note</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCenter;