import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const PlatformSettingsPanel = ({ user }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState({});

  const load = () => {
    setLoading(true);
    adminService.getSettings().then(res => { setSettings(res || {}); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await adminService.updateSettings(edited); setEdited({}); load(); } catch (e) { alert('Failed to save settings'); } finally { setSaving(false); }
  };

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading settings...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Platform Settings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(settings).map(([key, setting]) => (
          <div key={key} style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 4 }}>{setting.description} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({key})</span></label>
            {setting.type === 'boolean' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                <input type="checkbox" checked={edited[key] !== undefined ? edited[key] === 'true' : setting.value === 'true'} onChange={e => setEdited({...edited, [key]: e.target.checked ? 'true' : 'false'})} />
                {edited[key] !== undefined ? (edited[key] === 'true' ? 'Enabled' : 'Disabled') : (setting.value === 'true' ? 'Enabled' : 'Disabled')}
              </label>
            ) : (
              <input type={setting.type === 'number' ? 'number' : 'text'} value={edited[key] !== undefined ? edited[key] : setting.value} onChange={e => setEdited({...edited, [key]: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box', maxWidth: 400 }} />
            )}
            {edited[key] !== undefined && <span style={{ fontSize: 11, color: '#f59e0b', marginLeft: 8 }}>edited</span>}
          </div>
        ))}
      </div>
      {Object.keys(edited).length > 0 && (
        <button onClick={handleSave} disabled={saving} style={{ marginTop: 16, padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : `Save ${Object.keys(edited).length} Change${Object.keys(edited).length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

export default PlatformSettingsPanel;
