const platformSettingsRepository = require('../repositories/platformSettingsRepository');

const DEFAULTS = {
  platformName: { value: 'SnapShop', type: 'string', description: 'Platform display name' },
  supportEmail: { value: 'support@snapshop.com', type: 'string', description: 'Support email address' },
  supportPhone: { value: '+91-1800-123-4567', type: 'string', description: 'Support phone number' },
  minPayoutAmount: { value: '500', type: 'number', description: 'Minimum payout threshold for sellers' },
  currency: { value: 'INR', type: 'string', description: 'Platform currency' },
  timezone: { value: 'Asia/Kolkata', type: 'string', description: 'Platform timezone' },
  maintenanceMode: { value: 'false', type: 'boolean', description: 'Enable maintenance mode' },
  allowNewRegistrations: { value: 'true', type: 'boolean', description: 'Allow new store registrations' },
  maxProductsPerStore: { value: '1000', type: 'number', description: 'Maximum products per store' },
  maxOrderValue: { value: '500000', type: 'number', description: 'Maximum order value' },
  autoApproveSellers: { value: 'false', type: 'boolean', description: 'Auto-approve new seller registrations' }
};

const platformSettingsService = {
  _normalize(r) {
    if (!r) return null;
    return {
      settingKey: r.SettingKey || r.settingKey,
      settingValue: r.SettingValue || r.settingValue,
      settingType: r.SettingType || r.settingType,
      description: r.Description || r.description
    };
  },

  async getAll() {
    const stored = (await platformSettingsRepository.getAll()).map(r => this._normalize(r));
    const result = {};
    for (const [key, def] of Object.entries(DEFAULTS)) {
      const existing = stored.find(s => s.settingKey === key);
      result[key] = {
        key,
        value: existing ? existing.settingValue : def.value,
        type: existing ? existing.settingType : def.type,
        description: def.description
      };
    }
    return result;
  },

  async get(key) {
    const def = DEFAULTS[key];
    if (!def) return null;
    const stored = this._normalize(await platformSettingsRepository.getByKey(key));
    return {
      key,
      value: stored ? stored.settingValue : def.value,
      type: stored ? stored.settingType : def.type,
      description: def.description
    };
  },

  async set(key, value) {
    const def = DEFAULTS[key];
    if (!def) throw new Error(`Unknown setting key: ${key}`);
    await platformSettingsRepository.set(key, value, def.type, def.description);
    return true;
  },

  async setMultiple(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
    return true;
  }
};

module.exports = platformSettingsService;
