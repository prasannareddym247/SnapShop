const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = {
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const hash = window.location.hash;
    const isStorefront = /^#\/?store\//.test(hash);
    const tokenKey = isStorefront ? 'fk_customer_token' : 'fk_platform_token';
    const token = localStorage.getItem(tokenKey);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const activeTenant = sessionStorage.getItem('active_tenant_id');
    const activeStore = sessionStorage.getItem('active_store_id');
    if (activeTenant && activeTenant !== 'undefined' && activeTenant !== 'null') {
      headers['X-Tenant-ID'] = activeTenant;
    }
    if (activeStore && activeStore !== 'undefined' && activeStore !== 'null') {
      headers['X-Store-ID'] = activeStore;
    }
    
    // Impersonation headers if query params exist in hash route
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const query = hash.substring(qIdx + 1);
      query.split('&').forEach(pair => {
        const [key, val] = pair.split('=');
        if (key === 'impersonateTenantId' && val) {
          headers['X-Tenant-ID'] = decodeURIComponent(val);
        }
        if (key === 'impersonateStoreId' && val) {
          headers['X-Store-ID'] = decodeURIComponent(val);
        }
      });
    }
    
    return headers;
  },

  async request(method, path, body = null) {
    const options = {
      method,
      headers: this.getHeaders()
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${path}`, options);
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      const text = await res.text();
      throw { status: res.status, error: `Non-JSON response: ${text.slice(0, 200)}` };
    }
    if (!res.ok) {
      throw { status: res.status, error: data.error || 'API Request Failed', code: data.code, email: data.email };
    }
    return data;
  },

  get(path, params = {}) {
    let url = path;
    const query = Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    if (query) url += `?${query}`;
    return this.request('GET', url);
  },

  post(path, body) {
    return this.request('POST', path, body);
  },

  put(path, body) {
    return this.request('PUT', path, body);
  },

  delete(path) {
    return this.request('DELETE', path);
  },

  getApiBase() {
    return API_BASE;
  }
};

export default api;
export { API_BASE };
