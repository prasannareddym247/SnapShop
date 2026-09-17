import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const AnnouncementsPanel = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetType: 'all_stores', priority: 'normal', status: 'published' });

  const load = () => {
    setLoading(true);
    adminService.getAnnouncements().then(res => { setAnnouncements(Array.isArray(res) ? res : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return alert('Title and content required');
    try { await adminService.createAnnouncement(form); setShowForm(false); setForm({ title: '', content: '', targetType: 'all_stores', priority: 'normal', status: 'published' }); load(); } catch (e) { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await adminService.deleteAnnouncement(id); load(); } catch (e) { alert('Failed'); }
  };

  const toggleStatus = async (a) => {
    const newStatus = a.Status === 'published' ? 'draft' : 'published';
    try { await adminService.updateAnnouncement(a.AnnouncementId || a.announcementId, { status: newStatus }); load(); } catch (e) { alert('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', margin: 0 }}>Announcements</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>{showForm ? 'Cancel' : 'New Announcement'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
          <textarea placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows={4} style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <select value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value})} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
              <option value="all_stores">All Stores</option><option value="specific_plans">Specific Plans</option><option value="specific_stores">Specific Stores</option>
            </select>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
              <option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
              <option value="published">Published</option><option value="draft">Draft</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '8px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Create</button>
        </form>
      )}
      {loading ? <div style={{ color: '#94a3b8' }}>Loading...</div> : announcements.length === 0 ? <div style={{ color: '#94a3b8' }}>No announcements yet.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map(a => (
            <div key={a.AnnouncementId || a.announcementId} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>{a.Title || a.title}</h3>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    <span>Priority: {a.Priority || a.priority}</span>
                    <span>Target: {a.TargetType || a.targetType}</span>
                    <span>{new Date(a.CreatedAt || a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{a.Content || a.content}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleStatus(a)} style={{ padding: '4px 10px', background: (a.Status || a.status) === 'published' ? '#f59e0b' : '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>{(a.Status || a.status) === 'published' ? 'Draft' : 'Publish'}</button>
                  <button onClick={() => handleDelete(a.AnnouncementId || a.announcementId)} style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPanel;
