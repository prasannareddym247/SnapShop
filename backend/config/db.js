const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

const JSON_DB_PATH = path.join(__dirname, '../data/database_state.json');

let pool = null;
let useSqlServer = false;
let localDb = {
  tenants: [
    { id: 1, name: 'SnapShop Platform Tenant', createdAt: '2026-06-30T10:44:22Z' }
  ],
  stores: [
    { id: 1, tenantId: 1, ownerId: 1, name: 'SnapShop Platform', slug: 'platform', isActive: true, createdAt: '2026-06-30T10:44:22Z' }
  ],
  storeSettings: [],
  domains: [
    { id: 1, storeId: 1, tenantId: 1, domainName: 'localhost', isPrimary: true, createdAt: '2026-06-30T10:44:22Z' }
  ],
  categories: [
    { id: 1, name: 'Grains', slug: 'grains', description: 'Premium quality grains and flour' },
    { id: 2, name: 'Dry Fruits', slug: 'dry-fruits', description: 'Crunchy and nutritious dry fruits' },
    { id: 3, name: 'Spices', slug: 'spices', description: 'Aromatic and pure Indian spices' }
  ],
  products: [],
  productAttributes: [],
  productVariants: [],
  users: [
    {
      id: 1,
      email: 'admin@snapshop.com',
      passwordHash: '$2a$10$5r0xM231Aw.pafmx1zoCFe3PRKcrP/G.OBIdnwldB1uMA3EL2GZEW', // password: admin123
      firstName: 'SnapShop',
      lastName: 'Admin',
      phone: '9876543210',
      role: 'Admin',
      tenantId: 1,
      storeId: 1
    }
  ],
  sellerProfiles: [],
  customerProfiles: [],
  adminProfiles: [],
  storeCustomers: [],
  addresses: [],
  orders: [],
  orderItems: [],
  payments: [],
  inventoryLogs: [],
  wishlists: [],
  reviews: [],
  coupons: [],
  returns: [],
  queries: [],
  notifications: [],
  discussions: [],
  storePaymentMethods: [],
  storeGatewayCredentials: [],
  storeShippingProviders: [],
  shipmentTracking: [],
  webhookLogs: [],
  // Phase 8: Subscription & Billing
  subscriptionPlans: [],
  storeSubscriptions: [],
  billingInvoices: [],
  subscriptionPayments: [],
  usageMetrics: [],
  trialHistory: [],
  // Phase 9: Platform Administration
  auditLogs: [],
  announcements: [],
  platformSettings: [],
  adminNotifications: [],
  systemEvents: [],
  supportTickets: [],
  supportTicketReplies: []
};

function ensureDirectories() {
  const dir = path.dirname(JSON_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadSeedData() {
  try {
    const seedPath = path.join(__dirname, '../snapshop_catalog_seed.json');
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, 'utf8');
      const seedItems = JSON.parse(raw);

      const products = [];
      const attributes = [];
      const variants = [];

      let pId = 1;
      let aId = 1;
      let vId = 1;

      seedItems.forEach(item => {
        let catId = 1;
        if (item.category === 'Dry Fruits') catId = 2;
        if (item.category === 'Spices') catId = 3;

        products.push({
          id: pId,
          categoryId: catId,
          vendorId: 1,
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: item.description,
          storageInstructions: item.storage_instructions,
          bullets: item.bullets,
          imagePrompt: item.image_prompt,
          imageUrl: `/assets/groceesary/${pId}.png`,
          status: 'Active'
        });

        attributes.push({
          id: aId++,
          productId: pId,
          key: 'ShelfLife',
          value: `${item.shelf_life_months} Months`
        });

        item.pack_sizes.forEach(sz => {
          let weightGrams = parseInt(sz) * (sz.includes('kg') ? 1000 : 1);
          let priceMult = sz.includes('kg') ? 3.5 : (sz.includes('500g') ? 1.8 : 1);
          let basePrice = item.price_inr_estimate;

          variants.push({
            id: vId++,
            productId: pId,
            weightGrams: weightGrams,
            price: Math.round(basePrice * priceMult),
            stock: 100,
            sku: `FK-${catId}-${pId}-${weightGrams}`,
            expiryDate: '2027-06-30'
          });
        });

        pId++;
      });

      localDb.products = products;
      localDb.productAttributes = attributes;
      localDb.productVariants = variants;
      saveLocalDb();
      console.log('Successfully seeded local JSON database with 50 products.');
    }
  } catch (err) {
    console.error('Failed to load seed catalog into local DB:', err.message);
  }
}

function saveLocalDb() {
  ensureDirectories();
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(localDb, null, 2), 'utf8');
}

function loadLocalDb() {
  ensureDirectories();
  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
      localDb = JSON.parse(raw);
      if (!localDb.tenants) localDb.tenants = [];
      if (!localDb.stores) localDb.stores = [];
      if (!localDb.storeSettings) localDb.storeSettings = [];
      if (!localDb.domains) localDb.domains = [];
      if (!localDb.wishlists) localDb.wishlists = [];
      if (!localDb.reviews) localDb.reviews = [];
      if (!localDb.coupons) localDb.coupons = [];
      if (!localDb.returns) localDb.returns = [];
      if (!localDb.queries) localDb.queries = [];
      if (!localDb.notifications) localDb.notifications = [];
      if (!localDb.discussions) localDb.discussions = [];
      if (!localDb.sellerProfiles) localDb.sellerProfiles = [];
      if (!localDb.customerProfiles) localDb.customerProfiles = [];
      if (!localDb.adminProfiles) localDb.adminProfiles = [];
      if (!localDb.storeCustomers) localDb.storeCustomers = [];
      if (!localDb.inventoryLogs) localDb.inventoryLogs = [];
      if (!localDb.storePaymentMethods) localDb.storePaymentMethods = [];
      if (!localDb.storeGatewayCredentials) localDb.storeGatewayCredentials = [];
      if (!localDb.storeShippingProviders) localDb.storeShippingProviders = [];
      if (!localDb.shipmentTracking) localDb.shipmentTracking = [];
      if (!localDb.webhookLogs) localDb.webhookLogs = [];

      // Phase 7 Fallbacks
      if (!localDb.themes) localDb.themes = [];
      if (!localDb.storeThemes) localDb.storeThemes = [];
      if (!localDb.storePages) localDb.storePages = [];
      if (!localDb.navigationMenus) localDb.navigationMenus = [];
      if (!localDb.mediaLibrary) localDb.mediaLibrary = [];
      if (!localDb.blogPosts) localDb.blogPosts = [];

      // Phase 8 Fallbacks
      if (!localDb.subscriptionPlans) localDb.subscriptionPlans = [];
      if (!localDb.storeSubscriptions) localDb.storeSubscriptions = [];
      if (!localDb.billingInvoices) localDb.billingInvoices = [];
      if (!localDb.subscriptionPayments) localDb.subscriptionPayments = [];
      if (!localDb.usageMetrics) localDb.usageMetrics = [];
      if (!localDb.trialHistory) localDb.trialHistory = [];
      // Phase 9 initialisation
      if (!localDb.auditLogs) localDb.auditLogs = [];
      if (!localDb.announcements) localDb.announcements = [];
      if (!localDb.platformSettings) localDb.platformSettings = [];
      if (!localDb.adminNotifications) localDb.adminNotifications = [];
      if (!localDb.systemEvents) localDb.systemEvents = [];
      if (!localDb.supportTickets) localDb.supportTickets = [];
      if (!localDb.supportTicketReplies) localDb.supportTicketReplies = [];

      // Seed default subscription plans if empty
      if (localDb.subscriptionPlans.length === 0) {
        localDb.subscriptionPlans = [
          { id: 1, key: 'starter', name: 'Starter', description: 'For growing businesses ready to scale', price: 499, currency: 'INR', billingCycle: 'monthly', trialDays: 14, isActive: true, isRecommended: true, sortOrder: 1, features: { maxProducts: 500, maxOrdersPerMonth: -1, storageMB: 500, staffAccounts: 2, themes: 5, customDomain: true, apiAccess: false, prioritySupport: false, marketingTools: true, advancedAnalytics: false, reports: true }, createdAt: new Date().toISOString() },
          { id: 2, key: 'professional', name: 'Professional', description: 'Advanced tools for serious merchants', price: 999, currency: 'INR', billingCycle: 'monthly', trialDays: 14, isActive: true, isRecommended: false, sortOrder: 2, features: { maxProducts: -1, maxOrdersPerMonth: -1, storageMB: 2000, staffAccounts: 5, themes: 10, customDomain: true, apiAccess: true, prioritySupport: true, marketingTools: true, advancedAnalytics: true, reports: true }, createdAt: new Date().toISOString() },
          { id: 3, key: 'business', name: 'Business', description: 'Complete solution for high-volume sellers', price: 1999, currency: 'INR', billingCycle: 'monthly', trialDays: 14, isActive: true, isRecommended: false, sortOrder: 3, features: { maxProducts: -1, maxOrdersPerMonth: -1, storageMB: 5000, staffAccounts: 15, themes: -1, customDomain: true, apiAccess: true, prioritySupport: true, marketingTools: true, advancedAnalytics: true, reports: true }, createdAt: new Date().toISOString() },
          { id: 4, key: 'enterprise', name: 'Enterprise', description: 'Custom solutions for large operations', price: 4999, currency: 'INR', billingCycle: 'monthly', trialDays: 14, isActive: true, isRecommended: false, sortOrder: 4, features: { maxProducts: -1, maxOrdersPerMonth: -1, storageMB: -1, staffAccounts: -1, themes: -1, customDomain: true, apiAccess: true, prioritySupport: true, marketingTools: true, advancedAnalytics: true, reports: true }, createdAt: new Date().toISOString() }
        ];
        // Create a trial subscription for Store 2 (StyleBazaar Fashion)
        if (!localDb.storeSubscriptions.find(s => s.storeId === 2)) {
          const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          localDb.storeSubscriptions.push({
            id: 1, storeId: 2, tenantId: 1, planKey: 'starter', status: 'trial',
            trialStart: new Date().toISOString(), trialEnd,
            currentPeriodStart: new Date().toISOString(), currentPeriodEnd: trialEnd,
            cancelledAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          });
        }
        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, '../data/database_state.json'), JSON.stringify(localDb, null, 2), 'utf8');
      }

      if (localDb.themes.length === 0 || localDb.themes.some(t => !t.configData || t.configData === '{}' || !t.themeKey)) {
        localDb.themes = [
          { id: 1, themeKey: 'ajio-inspired', name: 'Ajio Inspired', slug: 'ajio-inspired', configData: JSON.stringify({ primaryColor: '#e91e63', secondaryColor: '#212121', accentColor: '#ffc107', typography: 'Inter', borderRadius: '12px', announcementText: 'Fashion that speaks your style!' }), storeId: null },
          { id: 2, themeKey: 'zara-inspired', name: 'Zara Inspired', slug: 'zara-inspired', configData: JSON.stringify({ primaryColor: '#111111', secondaryColor: '#333333', accentColor: '#ffffff', typography: 'Inter', borderRadius: '0px', announcementText: 'Timeless elegance, modern edge.' }), storeId: null },
          { id: 3, themeKey: 'nike-inspired', name: 'Nike Inspired', slug: 'nike-inspired', configData: JSON.stringify({ primaryColor: '#f5f5f5', secondaryColor: '#1a1a1a', accentColor: '#ea1d2c', typography: 'Inter', borderRadius: '4px', announcementText: 'Just Do It. Find your edge.' }), storeId: null },
          { id: 4, themeKey: 'boutique-inspired', name: 'Boutique Inspired', slug: 'boutique-inspired', configData: JSON.stringify({ primaryColor: '#d4a373', secondaryColor: '#2c2c2c', accentColor: '#f8edeb', typography: 'Inter', borderRadius: '8px', announcementText: 'Curated with love, crafted for you.' }), storeId: null },
          { id: 5, themeKey: 'streetwear-inspired', name: 'Streetwear Inspired', slug: 'streetwear-inspired', configData: JSON.stringify({ primaryColor: '#ff6b35', secondaryColor: '#0d0d0d', accentColor: '#f7c59f', typography: 'Inter', borderRadius: '0px', announcementText: 'Urban style, raw attitude.' }), storeId: null },
          { id: 6, themeKey: 'nykaa-inspired', name: 'Nykaa Inspired', slug: 'nykaa-inspired', configData: JSON.stringify({ primaryColor: '#fc2779', secondaryColor: '#1a1a2e', accentColor: '#ffd700', typography: 'Inter', borderRadius: '20px', announcementText: 'Beauty that empowers you!' }), storeId: null },
          { id: 7, themeKey: 'sephora-inspired', name: 'Sephora Inspired', slug: 'sephora-inspired', configData: JSON.stringify({ primaryColor: '#000000', secondaryColor: '#ffffff', accentColor: '#e60023', typography: 'Inter', borderRadius: '0px', announcementText: 'Discover your beauty power.' }), storeId: null },
          { id: 8, themeKey: 'skincare-inspired', name: 'Skincare Inspired', slug: 'skincare-inspired', configData: JSON.stringify({ primaryColor: '#a8d8ea', secondaryColor: '#2c3e50', accentColor: '#f4a261', typography: 'Inter', borderRadius: '16px', announcementText: 'Glow naturally, shine daily.' }), storeId: null },
          { id: 9, themeKey: 'luxury-beauty-inspired', name: 'Luxury Beauty', slug: 'luxury-beauty-inspired', configData: JSON.stringify({ primaryColor: '#c9a84c', secondaryColor: '#1a1a1a', accentColor: '#f5f5f5', typography: 'Inter', borderRadius: '4px', announcementText: 'Indulge in luxury beauty.' }), storeId: null },
          { id: 10, themeKey: 'makeup-inspired', name: 'Makeup Inspired', slug: 'makeup-inspired', configData: JSON.stringify({ primaryColor: '#ff69b4', secondaryColor: '#2d2d2d', accentColor: '#ff1493', typography: 'Inter', borderRadius: '12px', announcementText: 'Paint your world with color.' }), storeId: null },
          { id: 11, themeKey: 'apple-inspired', name: 'Apple Inspired', slug: 'apple-inspired', configData: JSON.stringify({ primaryColor: '#1d1d1f', secondaryColor: '#f5f5f7', accentColor: '#0071e3', typography: 'Inter', borderRadius: '12px', announcementText: 'Think different. Shop smart.' }), storeId: null },
          { id: 12, themeKey: 'samsung-inspired', name: 'Samsung Inspired', slug: 'samsung-inspired', configData: JSON.stringify({ primaryColor: '#1428a0', secondaryColor: '#000000', accentColor: '#ffffff', typography: 'Inter', borderRadius: '8px', announcementText: 'Do what you cant.' }), storeId: null },
          { id: 13, themeKey: 'amazon-tech-inspired', name: 'Amazon Tech', slug: 'amazon-tech-inspired', configData: JSON.stringify({ primaryColor: '#ff9900', secondaryColor: '#131921', accentColor: '#ffffff', typography: 'Inter', borderRadius: '4px', announcementText: 'Tech at your fingertips.' }), storeId: null },
          { id: 14, themeKey: 'gaming-inspired', name: 'Gaming Inspired', slug: 'gaming-inspired', configData: JSON.stringify({ primaryColor: '#ff003c', secondaryColor: '#0a0a0a', accentColor: '#00ff88', typography: 'Inter', borderRadius: '0px', announcementText: 'Level up your game.' }), storeId: null },
          { id: 15, themeKey: 'gadgets-inspired', name: 'Gadgets Inspired', slug: 'gadgets-inspired', configData: JSON.stringify({ primaryColor: '#00bcd4', secondaryColor: '#263238', accentColor: '#ff5722', typography: 'Inter', borderRadius: '8px', announcementText: 'The future is now.' }), storeId: null },
          { id: 16, themeKey: 'blinkit-inspired', name: 'Blinkit Inspired', slug: 'blinkit-inspired', configData: JSON.stringify({ primaryColor: '#fcdb05', secondaryColor: '#1a1a1a', accentColor: '#2e7d32', typography: 'Inter', borderRadius: '8px', announcementText: 'Minutes matter. We deliver.' }), storeId: null },
          { id: 17, themeKey: 'bigbasket-inspired', name: 'Bigbasket Inspired', slug: 'bigbasket-inspired', configData: JSON.stringify({ primaryColor: '#6bbf47', secondaryColor: '#1a3c34', accentColor: '#ff8c00', typography: 'Inter', borderRadius: '8px', announcementText: 'Freshness delivered daily.' }), storeId: null },
          { id: 18, themeKey: 'organic-inspired', name: 'Organic Inspired', slug: 'organic-inspired', configData: JSON.stringify({ primaryColor: '#15803d', secondaryColor: '#1e3a1e', accentColor: '#ca8a04', typography: 'Inter', borderRadius: '16px', announcementText: 'Pure, natural, wholesome.' }), storeId: null },
          { id: 19, themeKey: 'supermarket-inspired', name: 'Supermarket Style', slug: 'supermarket-inspired', configData: JSON.stringify({ primaryColor: '#e53935', secondaryColor: '#1b5e20', accentColor: '#fffde7', typography: 'Inter', borderRadius: '4px', announcementText: 'Big savings, every visit.' }), storeId: null },
          { id: 20, themeKey: 'daily-essentials-inspired', name: 'Daily Essentials', slug: 'daily-essentials-inspired', configData: JSON.stringify({ primaryColor: '#546e7a', secondaryColor: '#37474f', accentColor: '#ffb300', typography: 'Inter', borderRadius: '4px', announcementText: 'Everything you need, every day.' }), storeId: null },
          { id: 21, themeKey: 'ikea-inspired', name: 'IKEA Inspired', slug: 'ikea-inspired', configData: JSON.stringify({ primaryColor: '#003399', secondaryColor: '#ffcc00', accentColor: '#ffffff', typography: 'Inter', borderRadius: '0px', announcementText: 'Make your home come alive.' }), storeId: null },
          { id: 22, themeKey: 'modern-inspired', name: 'Modern Living', slug: 'modern-inspired', configData: JSON.stringify({ primaryColor: '#10b981', secondaryColor: '#1e293b', accentColor: '#f59e0b', typography: 'Inter', borderRadius: '8px', announcementText: 'Modern spaces, modern life.' }), storeId: null },
          { id: 23, themeKey: 'luxury-inspired', name: 'Luxury Living', slug: 'luxury-inspired', configData: JSON.stringify({ primaryColor: '#1a1a2e', secondaryColor: '#c9a84c', accentColor: '#e8e8e8', typography: 'Inter', borderRadius: '4px', announcementText: 'Redefine luxury at home.' }), storeId: null },
          { id: 24, themeKey: 'wooden-inspired', name: 'Wooden Inspired', slug: 'wooden-inspired', configData: JSON.stringify({ primaryColor: '#8d6e63', secondaryColor: '#3e2723', accentColor: '#a5d6a7', typography: 'Inter', borderRadius: '8px', announcementText: 'Natural beauty for your home.' }), storeId: null },
          { id: 25, themeKey: 'decor-inspired', name: 'Decor Inspired', slug: 'decor-inspired', configData: JSON.stringify({ primaryColor: '#f3e5f5', secondaryColor: '#4a148c', accentColor: '#ce93d8', typography: 'Inter', borderRadius: '12px', announcementText: 'Decorate your dreams.' }), storeId: null },
          { id: 26, themeKey: 'nike-performance-inspired', name: 'Nike Performance', slug: 'nike-performance-inspired', configData: JSON.stringify({ primaryColor: '#1a1a1a', secondaryColor: '#f5f5f5', accentColor: '#00e676', typography: 'Inter', borderRadius: '4px', announcementText: 'Unleash your potential.' }), storeId: null },
          { id: 27, themeKey: 'adidas-inspired', name: 'Adidas Inspired', slug: 'adidas-inspired', configData: JSON.stringify({ primaryColor: '#000000', secondaryColor: '#ffffff', accentColor: '#00589b', typography: 'Inter', borderRadius: '0px', announcementText: 'Impossible is nothing.' }), storeId: null },
          { id: 28, themeKey: 'gym-inspired', name: 'Gym Inspired', slug: 'gym-inspired', configData: JSON.stringify({ primaryColor: '#ff1744', secondaryColor: '#212121', accentColor: '#2979ff', typography: 'Inter', borderRadius: '4px', announcementText: 'Train hard, shop easy.' }), storeId: null },
          { id: 29, themeKey: 'outdoor-inspired', name: 'Outdoor Inspired', slug: 'outdoor-inspired', configData: JSON.stringify({ primaryColor: '#2e7d32', secondaryColor: '#1b5e20', accentColor: '#ff8f00', typography: 'Inter', borderRadius: '8px', announcementText: 'Adventure awaits outside.' }), storeId: null },
          { id: 30, themeKey: 'equipment-inspired', name: 'Equipment Inspired', slug: 'equipment-inspired', configData: JSON.stringify({ primaryColor: '#ff6f00', secondaryColor: '#37474f', accentColor: '#ffab00', typography: 'Inter', borderRadius: '4px', announcementText: 'Gear up for greatness.' }), storeId: null },
          { id: 31, themeKey: 'spare-parts-inspired', name: 'Spare Parts', slug: 'spare-parts-inspired', configData: JSON.stringify({ primaryColor: '#e65100', secondaryColor: '#1a237e', accentColor: '#ff9100', typography: 'Inter', borderRadius: '4px', announcementText: 'Parts that keep you moving.' }), storeId: null },
          { id: 32, themeKey: 'bike-inspired', name: 'Bike Inspired', slug: 'bike-inspired', configData: JSON.stringify({ primaryColor: '#c62828', secondaryColor: '#212121', accentColor: '#ffffff', typography: 'Inter', borderRadius: '0px', announcementText: 'Ride free, ride safe.' }), storeId: null },
          { id: 33, themeKey: 'accessories-inspired', name: 'Auto Accessories', slug: 'accessories-inspired', configData: JSON.stringify({ primaryColor: '#1565c0', secondaryColor: '#0d47a1', accentColor: '#ffd600', typography: 'Inter', borderRadius: '8px', announcementText: 'Upgrade your ride.' }), storeId: null },
          { id: 34, themeKey: 'luxury-auto-inspired', name: 'Luxury Auto', slug: 'luxury-auto-inspired', configData: JSON.stringify({ primaryColor: '#b8860b', secondaryColor: '#0a0a0a', accentColor: '#f5f5f5', typography: 'Inter', borderRadius: '4px', announcementText: 'Where luxury meets performance.' }), storeId: null },
          { id: 35, themeKey: 'garage-inspired', name: 'Garage Inspired', slug: 'garage-inspired', configData: JSON.stringify({ primaryColor: '#d32f2f', secondaryColor: '#1a1a1a', accentColor: '#757575', typography: 'Inter', borderRadius: '0px', announcementText: 'Built tough, tested hard.' }), storeId: null }
        ];
        // Save the updated themes setup right away
        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, '../data/database_state.json'), JSON.stringify(localDb, null, 2), 'utf8');
      }

      // Seed default Tenant 1 and Store 1 if empty
      if (localDb.tenants.length === 0) {
        localDb.tenants.push({ id: 1, name: 'SnapShop Platform Tenant', createdAt: new Date().toISOString() });
      }
      if (localDb.stores.length === 0) {
        localDb.stores.push({ id: 1, tenantId: 1, ownerId: 1, name: 'SnapShop Platform', slug: 'platform', isActive: true, createdAt: new Date().toISOString() });
      }
      if (localDb.domains.length === 0) {
        localDb.domains.push({ id: 1, storeId: 1, tenantId: 1, domainName: 'localhost', isPrimary: true, createdAt: new Date().toISOString() });
      }

      // Propagate backward compatible tenantId and storeId to existing records
      if (localDb.users) localDb.users.forEach(u => { if (!u.tenantId) { u.tenantId = 1; u.storeId = 1; } });
      if (localDb.products) localDb.products.forEach(p => { if (!p.tenantId) { p.tenantId = 1; p.storeId = 1; } });
      if (localDb.orders) localDb.orders.forEach(o => {
        if (!o.tenantId) { o.tenantId = 1; o.storeId = 1; }
        if (o.notes === undefined) o.notes = null;
      });
      if (localDb.categories) localDb.categories.forEach(c => {
        if (!c.tenantId) { c.tenantId = 1; }
        if (c.parentCategoryId === undefined) c.parentCategoryId = null;
        if (c.isActive === undefined) c.isActive = true;
      });
      if (localDb.coupons) localDb.coupons.forEach(c => { if (!c.tenantId) { c.tenantId = 1; c.storeId = 1; } });
      if (localDb.reviews) localDb.reviews.forEach(r => { if (!r.tenantId) { r.tenantId = 1; } });
      if (localDb.addresses) localDb.addresses.forEach(a => { if (!a.tenantId) { a.tenantId = 1; } });
      if (localDb.discussions) localDb.discussions.forEach(d => { if (!d.tenantId) { d.tenantId = 1; } });
      if (localDb.notifications) localDb.notifications.forEach(n => { if (!n.tenantId) { n.tenantId = 1; } });

    } catch (err) {
      console.error('Error parsing local DB file, initializing fresh:', err.message);
      saveLocalDb();
    }
  } else {
    loadSeedData();
  }
}

async function initDatabase() {
  loadLocalDb();
  useSqlServer = false;
  // Start SQL Server connection in background (non-blocking)
  attemptSqlConnectionInLoop().catch(err => {
    console.warn('[SQL Server Connection] Background connection error:', err.message);
  });
}

async function attemptSqlConnectionInLoop() {
  const server = process.env.DB_SERVER || 'DESKTOP-ONLKUI7\\SQLEXPRESS';
  const dbName = process.env.DB_NAME || 'SnapShop';
  console.log(`[SQL Server Connection] Starting background connection loop to Server: ${server}...`);

  let connected = false;
  let attempt = 0;
  const maxAttempts = 3;

  while (!connected && attempt < maxAttempts) {
    attempt++;
    console.log(`[SQL Server Connection] Attempt #${attempt} to connect to database "${dbName}"...`);

    const dbConfig = {
      connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${dbName};Trusted_Connection=yes;LoginTimeout=30;`,
      connectionTimeout: 30000,
      requestTimeout: 120000
    };

    const currentPool = new sql.ConnectionPool(dbConfig);
    currentPool.on('error', (err) => {
      console.error('[SQL Server] Pool error:', err.message);
    });

    try {
      await currentPool.connect();
      pool = currentPool;
      connected = true;
    } catch (connectErr) {
      const errMsg = connectErr.message || (typeof connectErr === 'object' ? JSON.stringify(connectErr) : String(connectErr));
      console.log(`[SQL Server Connection] Direct connection to database "${dbName}" failed on attempt #${attempt} with error: ${errMsg}. Trying via master...`);

      try {
        await currentPool.close();
      } catch (closeErr) { }

      const masterConfig = {
        connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=master;Trusted_Connection=yes;LoginTimeout=30;`,
        connectionTimeout: 30000,
        requestTimeout: 120000
      };

      let tempPool = null;
      try {
        tempPool = new sql.ConnectionPool(masterConfig);
        tempPool.on('error', (err) => {
          console.error('[SQL Server] Master pool error:', err.message);
        });
        await tempPool.connect();
        console.log('[SQL Server Connection] Connected to master database. Checking/creating target database...');

        const dbCheck = await tempPool.request().query(`SELECT database_id FROM sys.databases WHERE name = '${dbName}'`);
        if (dbCheck.recordset.length === 0) {
          console.log(`[SQL Server Connection] Creating database "${dbName}"...`);
          await tempPool.request().query(`CREATE DATABASE ${dbName}`);
          console.log(`[SQL Server Connection] Database "${dbName}" created successfully.`);
        }
      } catch (masterErr) {
        const masterErrMsg = masterErr.message || (typeof masterErr === 'object' ? JSON.stringify(masterErr) : String(masterErr));
        console.warn(`[SQL Server Connection] Attempt #${attempt} via master database failed with error: ${masterErrMsg}.`);
      } finally {
        if (tempPool) {
          try {
            await tempPool.close();
          } catch (closeErr) { }
        }
      }

      // Wait 5 seconds before next attempt if we still have attempts left
      if (attempt < maxAttempts) {
        console.log(`[SQL Server Connection] Retrying connection in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  if (!connected) {
    console.log(`[SQL Server Connection] SQL Server connection unavailable after ${maxAttempts} attempts. Persistently using local JSON database (localDb) for this session.`);
    return;
  }

  useSqlServer = true;
  console.log(`[SQL Server Connection] SUCCESS: Connected to SQL Server Database: ${dbName} (Attempt #${attempt})`);

  try {
    await createSqlTables();
    await migrateLocalDbToSql();
    await syncLocalDbToSql();
    console.log('[SQL Server Connection] Tables verified/created and data migrated successfully!');
  } catch (err) {
    console.error('[SQL Server Connection] Error running schema/migration:', err.message);
  }
}

async function createSqlTables() {
  const schemaQueries = [
    // Phase 3: Tenants Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tenants' AND xtype='U')
     CREATE TABLE Tenants (
         TenantId INT IDENTITY(1,1) PRIMARY KEY,
         Name NVARCHAR(150) NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 3: Stores Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Stores' AND xtype='U')
     CREATE TABLE Stores (
         StoreId INT IDENTITY(1,1) PRIMARY KEY,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) ON DELETE CASCADE,
         OwnerId INT NULL,
         Name NVARCHAR(150) NOT NULL,
         Slug NVARCHAR(150) UNIQUE NOT NULL,
         IsActive BIT DEFAULT 1,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 3: StoreSettings Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreSettings' AND xtype='U')
     CREATE TABLE StoreSettings (
         SettingId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId),
         SettingKey NVARCHAR(100) NOT NULL,
         SettingValue NVARCHAR(MAX) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 3: Domains Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Domains' AND xtype='U')
     CREATE TABLE Domains (
         DomainId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId),
         DomainName NVARCHAR(255) UNIQUE NOT NULL,
         IsPrimary BIT DEFAULT 1,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 3: Seed Default Tenant & Store if empty
    `IF NOT EXISTS (SELECT * FROM Tenants WHERE TenantId = 1)
     BEGIN
         SET IDENTITY_INSERT Tenants ON;
         INSERT INTO Tenants (TenantId, Name) VALUES (1, 'SnapShop Platform Tenant');
         SET IDENTITY_INSERT Tenants OFF;
     END`,

    `IF NOT EXISTS (SELECT * FROM Stores WHERE StoreId = 1)
     BEGIN
         SET IDENTITY_INSERT Stores ON;
         INSERT INTO Stores (StoreId, TenantId, OwnerId, Name, Slug, IsActive) VALUES (1, 1, 1, 'SnapShop Platform', 'platform', 1);
         SET IDENTITY_INSERT Stores OFF;
     END`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
     CREATE TABLE Categories (
         CategoryId INT IDENTITY(1,1) PRIMARY KEY,
         Name NVARCHAR(100) NOT NULL,
         Slug NVARCHAR(100) NOT NULL UNIQUE,
         Description NVARCHAR(500),
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
     CREATE TABLE Products (
         ProductId INT IDENTITY(1,1) PRIMARY KEY,
         CategoryId INT FOREIGN KEY REFERENCES Categories(CategoryId),
         VendorId INT DEFAULT 1,
         Name NVARCHAR(150) NOT NULL,
         Slug NVARCHAR(150) NOT NULL UNIQUE,
         Description NVARCHAR(MAX) NOT NULL,
         StorageInstructions NVARCHAR(500) NOT NULL,
         Bullets NVARCHAR(2000) NULL,
         ImagePrompt NVARCHAR(2000) NULL,
         ImageUrl NVARCHAR(MAX) NULL,
         Status NVARCHAR(20) DEFAULT 'Pending Approval' CHECK (Status IN ('Active', 'Inactive', 'Pending Approval', 'Approved', 'Rejected')),
         FssaiLicNo NVARCHAR(50),
         DummyJsonData NVARCHAR(MAX) NULL,
         SaleStartDate DATETIME NULL,
         SaleEndDate DATETIME NULL,
         Discount DECIMAL(5,2) DEFAULT 0,
         Brand NVARCHAR(100) NULL,
         Rating DECIMAL(3,1) NULL,
         DiscountPercentage DECIMAL(5,2) NULL DEFAULT 0,
         Stock INT NULL DEFAULT 0,
         AvailabilityStatus NVARCHAR(50) NULL,
         WeightGrams INT NULL,
         DimensionsJson NVARCHAR(500) NULL,
         WarrantyInformation NVARCHAR(200) NULL,
         ShippingInformation NVARCHAR(200) NULL,
         ReturnPolicy NVARCHAR(200) NULL,
         MinimumOrderQuantity INT NULL DEFAULT 1,
         Barcode NVARCHAR(50) NULL,
         QrCode NVARCHAR(MAX) NULL,
         Thumbnail NVARCHAR(MAX) NULL,
         ImagesJson NVARCHAR(MAX) NULL,
         TagsJson NVARCHAR(1000) NULL,
         ReviewsJson NVARCHAR(MAX) NULL,
         DummyProductId INT NULL,
         UpdatedAt DATETIME NULL,
         CreatedAt DATETIME DEFAULT GETDATE(),
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductAttributes' AND xtype='U')
     CREATE TABLE ProductAttributes (
         AttributeId INT IDENTITY(1,1) PRIMARY KEY,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         AttributeKey NVARCHAR(50) NOT NULL,
         AttributeValue NVARCHAR(250) NOT NULL
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductVariants' AND xtype='U')
     CREATE TABLE ProductVariants (
         VariantId INT IDENTITY(1,1) PRIMARY KEY,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         WeightGrams INT NOT NULL,
         Price DECIMAL(10,2) NOT NULL,
         Stock INT NOT NULL DEFAULT 0,
         Sku NVARCHAR(50) UNIQUE NOT NULL,
         ExpiryDate DATE NULL
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductImages' AND xtype='U')
     CREATE TABLE ProductImages (
         ImageId INT IDENTITY(1,1) PRIMARY KEY,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         ImageUrl NVARCHAR(MAX) NOT NULL,
         SortOrder INT DEFAULT 0,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductTags' AND xtype='U')
     CREATE TABLE ProductTags (
         TagId INT IDENTITY(1,1) PRIMARY KEY,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         Tag NVARCHAR(50) NOT NULL,
         CONSTRAINT UQ_ProductTags_ProductTag UNIQUE (ProductId, Tag)
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductReviews' AND xtype='U')
     CREATE TABLE ProductReviews (
         ReviewId INT IDENTITY(1,1) PRIMARY KEY,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
         Comment NVARCHAR(1000) NULL,
         ReviewDate DATETIME NULL,
         ReviewerName NVARCHAR(100) NULL,
         ReviewerEmail NVARCHAR(150) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
     CREATE TABLE Users (
         UserId INT IDENTITY(1,1) PRIMARY KEY,
         Email NVARCHAR(150) UNIQUE NOT NULL,
         PasswordHash NVARCHAR(255) NOT NULL,
         FirstName NVARCHAR(100) NOT NULL,
         LastName NVARCHAR(100) NOT NULL,
         Phone NVARCHAR(15) NULL,
         Role NVARCHAR(20) DEFAULT 'Customer' CHECK (Role IN ('Customer', 'Admin', 'Seller')),
         Gstin NVARCHAR(15) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SellerProfiles' AND xtype='U')
     CREATE TABLE SellerProfiles (
         ProfileId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT UNIQUE FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL,
         StoreName NVARCHAR(100) NULL,
         StoreDescription NVARCHAR(500) NULL,
         SellerStatus NVARCHAR(20) DEFAULT 'Pending',
         SellerStatusChangedAt DATETIME NULL,
         Gstin NVARCHAR(15) NULL,
         PanNumber NVARCHAR(50) NULL,
         DiscountRate DECIMAL(5,2) DEFAULT 0 NULL,
         DiscountScope NVARCHAR(10) DEFAULT 'all' NULL,
         DiscountProductIds NVARCHAR(500) NULL,
         BankAccountHolder NVARCHAR(150) NULL,
         BankName NVARCHAR(150) NULL,
         BankAccountNumber NVARCHAR(50) NULL,
         BankIfscCode NVARCHAR(20) NULL,
         DocGovId NVARCHAR(MAX) NULL,
         DocPan NVARCHAR(MAX) NULL,
         DocGst NVARCHAR(MAX) NULL,
         DocBizReg NVARCHAR(MAX) NULL,
         DocBank NVARCHAR(MAX) NULL,
         CommissionRate DECIMAL(5,2) DEFAULT 0 NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CustomerProfiles' AND xtype='U')
     CREATE TABLE CustomerProfiles (
         ProfileId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT UNIQUE FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
         AlternatePhone NVARCHAR(50) NULL,
         ProfilePicture NVARCHAR(MAX) NULL,
         Address NVARCHAR(500) NULL,
         City NVARCHAR(100) NULL,
         State NVARCHAR(100) NULL,
         Country NVARCHAR(100) DEFAULT 'India',
         PostalCode NVARCHAR(20) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AdminProfiles' AND xtype='U')
     CREATE TABLE AdminProfiles (
         ProfileId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT UNIQUE FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
         Permissions NVARCHAR(MAX) DEFAULT '["all"]',
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreCustomers' AND xtype='U')
     CREATE TABLE StoreCustomers (
         StoreCustomerId INT IDENTITY(1,1) PRIMARY KEY,
         CustomerId INT FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TotalOrders INT DEFAULT 0,
         TotalSpent DECIMAL(10,2) DEFAULT 0,
         FirstPurchaseAt DATETIME NULL,
         LastPurchaseAt DATETIME NULL,
         CreatedAt DATETIME DEFAULT GETDATE(),
         CONSTRAINT UQ_StoreCustomers UNIQUE (CustomerId, StoreId)
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Addresses' AND xtype='U')
     CREATE TABLE Addresses (
         AddressId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT FOREIGN KEY REFERENCES Users(UserId),
         AddressType NVARCHAR(20) CHECK (AddressType IN ('Shipping', 'Billing')),
         Line1 NVARCHAR(250) NOT NULL,
         Line2 NVARCHAR(250) NULL,
         City NVARCHAR(100) NOT NULL,
         State NVARCHAR(100) NOT NULL,
         PostalCode NVARCHAR(10) NOT NULL,
         Country NVARCHAR(100) DEFAULT 'India'
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
     CREATE TABLE Orders (
         OrderId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT FOREIGN KEY REFERENCES Users(UserId),
         OrderStatus NVARCHAR(30) DEFAULT 'Pending' CHECK (OrderStatus IN ('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
         TotalAmount DECIMAL(10,2) NOT NULL,
         TaxAmount DECIMAL(10,2) NOT NULL,
         ShippingAmount DECIMAL(10,2) NOT NULL,
         PaymentStatus NVARCHAR(30) DEFAULT 'Unpaid' CHECK (PaymentStatus IN ('Unpaid', 'Paid', 'Refunded')),
         CreatedAt DATETIME DEFAULT GETDATE(),
         UpdatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
     CREATE TABLE OrderItems (
         OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
         OrderId INT FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
         VariantId INT FOREIGN KEY REFERENCES ProductVariants(VariantId),
         Quantity INT NOT NULL CHECK (Quantity > 0),
         UnitPrice DECIMAL(10,2) NOT NULL,
         TaxAmount DECIMAL(10,2) NOT NULL
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payments' AND xtype='U')
     CREATE TABLE Payments (
         PaymentId INT IDENTITY(1,1) PRIMARY KEY,
         OrderId INT FOREIGN KEY REFERENCES Orders(OrderId),
         GatewayName NVARCHAR(50) DEFAULT 'Razorpay',
         TransactionId NVARCHAR(100) UNIQUE NOT NULL,
         Amount DECIMAL(10,2) NOT NULL,
         PaymentStatus NVARCHAR(30) NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InventoryLogs' AND xtype='U')
     CREATE TABLE InventoryLogs (
         LogId INT IDENTITY(1,1) PRIMARY KEY,
         VariantId INT FOREIGN KEY REFERENCES ProductVariants(VariantId),
         ChangeQuantity INT NOT NULL,
         Reason NVARCHAR(200) NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Bullets')
     ALTER TABLE Products ADD Bullets NVARCHAR(2000) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ImagePrompt')
     ALTER TABLE Products ADD ImagePrompt NVARCHAR(2000) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ImageUrl')
     ALTER TABLE Products ADD ImageUrl NVARCHAR(MAX)`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Status')
     ALTER TABLE Products ADD Status NVARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive'))`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'FssaiLicNo')
     ALTER TABLE Products ADD FssaiLicNo NVARCHAR(50)`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Discount')
     ALTER TABLE Products ADD Discount DECIMAL(5,2) DEFAULT 0 NULL`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Wishlists' AND xtype='U')
     CREATE TABLE Wishlists (
         WishlistId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reviews' AND xtype='U')
     CREATE TABLE Reviews (
         ReviewId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
         ProductId INT FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
         Rating INT CHECK (Rating >= 1 AND Rating <= 5) NOT NULL,
         Comment NVARCHAR(1000) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Coupons' AND xtype='U')
     CREATE TABLE Coupons (
         CouponId INT IDENTITY(1,1) PRIMARY KEY,
         Code NVARCHAR(50) UNIQUE NOT NULL,
         DiscountType NVARCHAR(20) CHECK (DiscountType IN ('Percentage', 'Fixed')) NOT NULL,
         DiscountValue DECIMAL(10,2) NOT NULL,
         ExpiryDate DATE NULL,
         VendorId INT NULL,
         IsActive BIT DEFAULT 1,
         MinOrderValue DECIMAL(10,2) NULL,
         UsageLimit INT NULL,
         UsedCount INT DEFAULT 0,
         PerCustomerLimit INT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Returns' AND xtype='U')
     CREATE TABLE Returns (
         ReturnId INT IDENTITY(1,1) PRIMARY KEY,
         OrderId INT FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
         Reason NVARCHAR(500) NOT NULL,
         Status NVARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'StoreName')
     ALTER TABLE Users ADD StoreName NVARCHAR(100) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'StoreDescription')
     ALTER TABLE Users ADD StoreDescription NVARCHAR(500) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'SellerStatus')
     ALTER TABLE Users ADD SellerStatus NVARCHAR(20) DEFAULT 'Pending'`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'SellerStatusChangedAt')
     ALTER TABLE Users ADD SellerStatusChangedAt DATETIME NULL`,


    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
     CREATE TABLE Notifications (
         NotificationId INT IDENTITY(1,1) PRIMARY KEY,
         UserId INT NULL,
         Message NVARCHAR(500) NOT NULL,
         Type NVARCHAR(50) NOT NULL,
         IsRead BIT DEFAULT 0,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    `IF EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
     BEGIN
         IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('Products') AND name = 'CK_Products_Status')
         BEGIN
             DECLARE @ConstraintName NVARCHAR(256);
             DECLARE @DropSql NVARCHAR(MAX);
             
             DECLARE constraint_cursor CURSOR FOR 
             SELECT name FROM sys.check_constraints 
             WHERE parent_object_id = OBJECT_ID('Products') AND definition LIKE '%Status%';
             
             OPEN constraint_cursor;
             FETCH NEXT FROM constraint_cursor INTO @ConstraintName;
             
             WHILE @@FETCH_STATUS = 0
             BEGIN
                 SET @DropSql = 'ALTER TABLE Products DROP CONSTRAINT ' + @ConstraintName;
                 EXEC sp_executesql @DropSql;
                 FETCH NEXT FROM constraint_cursor INTO @ConstraintName;
             END;
             
             CLOSE constraint_cursor;
             DEALLOCATE constraint_cursor;
             
             ALTER TABLE Products ADD CONSTRAINT CK_Products_Status CHECK (Status IN ('Active', 'Inactive', 'Pending Approval', 'Approved', 'Rejected'));
         END
     END`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'AlternatePhone')
     ALTER TABLE Users ADD AlternatePhone NVARCHAR(50) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ProfilePicture')
     ALTER TABLE Users ADD ProfilePicture NVARCHAR(MAX) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Address')
     ALTER TABLE Users ADD Address NVARCHAR(500) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'City')
     ALTER TABLE Users ADD City NVARCHAR(100) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'State')
     ALTER TABLE Users ADD State NVARCHAR(100) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Country')
     ALTER TABLE Users ADD Country NVARCHAR(100) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'PostalCode')
     ALTER TABLE Users ADD PostalCode NVARCHAR(20) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'PanNumber')
     ALTER TABLE Users ADD PanNumber NVARCHAR(50) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'BankAccountHolder')
     ALTER TABLE Users ADD BankAccountHolder NVARCHAR(150) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'BankName')
     ALTER TABLE Users ADD BankName NVARCHAR(150) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'BankAccountNumber')
     ALTER TABLE Users ADD BankAccountNumber NVARCHAR(50) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'BankIfscCode')
     ALTER TABLE Users ADD BankIfscCode NVARCHAR(20) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DocGovId')
     ALTER TABLE Users ADD DocGovId NVARCHAR(MAX) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DocPan')
     ALTER TABLE Users ADD DocPan NVARCHAR(MAX) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DocGst')
     ALTER TABLE Users ADD DocGst NVARCHAR(MAX) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DocBizReg')
     ALTER TABLE Users ADD DocBizReg NVARCHAR(MAX) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DocBank')
     ALTER TABLE Users ADD DocBank NVARCHAR(MAX) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'OtpCode')
     ALTER TABLE Users ADD OtpCode NVARCHAR(10) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'OtpExpiry')
     ALTER TABLE Users ADD OtpExpiry DATETIME NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DiscountRate')
     ALTER TABLE Users ADD DiscountRate DECIMAL(5,2) DEFAULT 0 NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DiscountScope')
     ALTER TABLE Users ADD DiscountScope NVARCHAR(10) DEFAULT 'all' NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'DiscountProductIds')
     ALTER TABLE Users ADD DiscountProductIds NVARCHAR(500) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'EmailVerified')
     ALTER TABLE Users ADD EmailVerified BIT DEFAULT 0`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'OtpHash')
     ALTER TABLE Users ADD OtpHash NVARCHAR(255) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'OtpAttempts')
     ALTER TABLE Users ADD OtpAttempts INT DEFAULT 0`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'LastOtpSentAt')
     ALTER TABLE Users ADD LastOtpSentAt DATETIME NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'OtpVerified')
     ALTER TABLE Users ADD OtpVerified BIT DEFAULT 0`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'BusinessType')
     ALTER TABLE Users ADD BusinessType NVARCHAR(50) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'SelectedTemplate')
     ALTER TABLE Users ADD SelectedTemplate NVARCHAR(100) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'SelectedPlan')
     ALTER TABLE Users ADD SelectedPlan NVARCHAR(50) NULL`,

    // Mark existing users as email verified
    `UPDATE Users SET EmailVerified = 1 WHERE PasswordHash IS NOT NULL AND (EmailVerified IS NULL OR EmailVerified = 0)`,

    // Migrate existing Users data into role-specific profile tables (run once)
    `IF EXISTS (SELECT * FROM sysobjects WHERE name='SellerProfiles' AND xtype='U') AND NOT EXISTS (SELECT TOP 1 * FROM SellerProfiles)
     BEGIN
         INSERT INTO SellerProfiles (UserId, StoreName, StoreDescription, SellerStatus, SellerStatusChangedAt, Gstin, PanNumber, DiscountRate, DiscountScope, DiscountProductIds, BankAccountHolder, BankName, BankAccountNumber, BankIfscCode, DocGovId, DocPan, DocGst, DocBizReg, DocBank)
         SELECT UserId, StoreName, StoreDescription, SellerStatus, SellerStatusChangedAt, Gstin, PanNumber, DiscountRate, DiscountScope, DiscountProductIds, BankAccountHolder, BankName, BankAccountNumber, BankIfscCode, DocGovId, DocPan, DocGst, DocBizReg, DocBank FROM Users WHERE Role IN ('Seller');
     END`,

    `IF EXISTS (SELECT * FROM sysobjects WHERE name='CustomerProfiles' AND xtype='U') AND NOT EXISTS (SELECT TOP 1 * FROM CustomerProfiles)
     BEGIN
         INSERT INTO CustomerProfiles (UserId, AlternatePhone, ProfilePicture, Address, City, State, Country, PostalCode)
         SELECT UserId, AlternatePhone, ProfilePicture, Address, City, State, Country, PostalCode FROM Users WHERE Role IN ('Customer');
     END`,

    `IF EXISTS (SELECT * FROM sysobjects WHERE name='AdminProfiles' AND xtype='U') AND NOT EXISTS (SELECT TOP 1 * FROM AdminProfiles)
     BEGIN
         INSERT INTO AdminProfiles (UserId)
         SELECT UserId FROM Users WHERE Role = 'Admin';
     END`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Discussions' AND xtype='U')
     CREATE TABLE Discussions (
         MessageId INT IDENTITY(1,1) PRIMARY KEY,
         ProductId INT NULL,
         SellerId INT NULL,
         SenderId INT NOT NULL,
         SenderRole NVARCHAR(50) NOT NULL,
         Message NVARCHAR(MAX) NOT NULL,
         AttachmentUrl NVARCHAR(MAX) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 3: Add TenantId and StoreId to existing tables
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'TenantId')
     ALTER TABLE Users ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'StoreId')
     ALTER TABLE Users ADD StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'TenantId')
     ALTER TABLE Products ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'StoreId')
     ALTER TABLE Products ADD StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'TenantId')
     ALTER TABLE Orders ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'StoreId')
     ALTER TABLE Orders ADD StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'TenantId')
     ALTER TABLE Categories ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Coupons') AND name = 'TenantId')
     ALTER TABLE Coupons ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Coupons') AND name = 'StoreId')
     ALTER TABLE Coupons ADD StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Reviews') AND name = 'TenantId')
     ALTER TABLE Reviews ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Addresses') AND name = 'TenantId')
     ALTER TABLE Addresses ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Discussions') AND name = 'TenantId')
     ALTER TABLE Discussions ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,

    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notifications') AND name = 'TenantId')
     ALTER TABLE Notifications ADD TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL`,

    // Set existing records to belong to Tenant 1 and Store 1
    `UPDATE Users SET TenantId = 1, StoreId = 1 WHERE TenantId IS NULL`,
    `UPDATE Products SET TenantId = 1, StoreId = 1 WHERE TenantId IS NULL`,
    `UPDATE Orders SET TenantId = 1, StoreId = 1 WHERE TenantId IS NULL`,
    `UPDATE Categories SET TenantId = 1 WHERE TenantId IS NULL`,
    `UPDATE Coupons SET TenantId = 1, StoreId = 1 WHERE TenantId IS NULL`,
    `UPDATE Reviews SET TenantId = 1 WHERE TenantId IS NULL`,
    `UPDATE Addresses SET TenantId = 1 WHERE TenantId IS NULL`,
    `UPDATE Discussions SET TenantId = 1 WHERE TenantId IS NULL`,
    `UPDATE Notifications SET TenantId = 1 WHERE TenantId IS NULL`,

    // Phase 4: Add ParentCategoryId and IsActive to Categories
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'ParentCategoryId')
     ALTER TABLE Categories ADD ParentCategoryId INT FOREIGN KEY REFERENCES Categories(CategoryId) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'IsActive')
     ALTER TABLE Categories ADD IsActive BIT DEFAULT 1`,

    // Phase 4: Expand CK_Products_Status constraint
    `IF EXISTS (SELECT * FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('Products') AND definition LIKE '%Status%')
     BEGIN
         DECLARE @ProdStatusConstraint NVARCHAR(256);
         DECLARE @DropProdStatusSql NVARCHAR(MAX);
         SELECT @ProdStatusConstraint = name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('Products') AND definition LIKE '%Status%';
         SET @DropProdStatusSql = 'ALTER TABLE Products DROP CONSTRAINT ' + @ProdStatusConstraint;
         EXEC sp_executesql @DropProdStatusSql;
         ALTER TABLE Products ADD CONSTRAINT CK_Products_Status CHECK (Status IN ('Active', 'Inactive', 'Pending Approval', 'Approved', 'Rejected', 'Draft', 'Archived'));
     END`,

    // Phase 4: Add Notes to Orders
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'Notes')
     ALTER TABLE Orders ADD Notes NVARCHAR(1000) NULL`,

    // Phase 4: Expand CK_Orders_OrderStatus constraint
    `IF EXISTS (SELECT * FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('Orders') AND definition LIKE '%OrderStatus%')
     BEGIN
         DECLARE @OrdStatusConstraint NVARCHAR(256);
         DECLARE @DropOrdStatusSql NVARCHAR(MAX);
         SELECT @OrdStatusConstraint = name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('Orders') AND definition LIKE '%OrderStatus%';
         SET @DropOrdStatusSql = 'ALTER TABLE Orders DROP CONSTRAINT ' + @OrdStatusConstraint;
         EXEC sp_executesql @DropOrdStatusSql;
         ALTER TABLE Orders ADD CONSTRAINT CK_Orders_OrderStatus CHECK (OrderStatus IN ('Pending', 'Paid', 'Processing', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'));
     END`,

    // Phase 4: Create InventoryLogs Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InventoryLogs' AND xtype='U')
     CREATE TABLE InventoryLogs (
         LogId INT IDENTITY(1,1) PRIMARY KEY,
         VariantId INT FOREIGN KEY REFERENCES ProductVariants(VariantId) ON DELETE CASCADE,
         Adjustment INT NOT NULL,
         StockAfter INT NOT NULL,
         Reason NVARCHAR(255) NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE(),
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL
     )`,

    // Phase 6: StorePaymentMethods Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StorePaymentMethods' AND xtype='U')
     CREATE TABLE StorePaymentMethods (
         StorePaymentMethodId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         MethodName NVARCHAR(50) NOT NULL,
         IsEnabled BIT DEFAULT 0,
         IsDefault BIT DEFAULT 0,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 6: StoreGatewayCredentials Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreGatewayCredentials' AND xtype='U')
     CREATE TABLE StoreGatewayCredentials (
         StoreGatewayCredentialId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         GatewayName NVARCHAR(50) NOT NULL,
         ApiKey NVARCHAR(500) NULL,
         ApiSecret NVARCHAR(500) NULL,
         WebhookSecret NVARCHAR(500) NULL,
         IsTestMode BIT DEFAULT 1,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 6: StoreShippingProviders Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreShippingProviders' AND xtype='U')
     CREATE TABLE StoreShippingProviders (
         StoreShippingProviderId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         ProviderName NVARCHAR(50) NOT NULL,
         IsEnabled BIT DEFAULT 0,
         ApiKey NVARCHAR(500) NULL,
         ApiSecret NVARCHAR(500) NULL,
         WarehouseAddress NVARCHAR(500) NULL,
         PackagingPreferences NVARCHAR(500) NULL,
         ShippingRates NVARCHAR(MAX) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 6: ShipmentTracking Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ShipmentTracking' AND xtype='U')
     CREATE TABLE ShipmentTracking (
         ShipmentTrackingId INT IDENTITY(1,1) PRIMARY KEY,
         OrderId INT FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         TrackingNumber NVARCHAR(100) NOT NULL,
         CourierName NVARCHAR(100) NOT NULL,
         EstimatedDelivery DATETIME NULL,
         ShipmentStatus NVARCHAR(50) NOT NULL,
         DeliveryUpdates NVARCHAR(MAX) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 6: WebhookLogs Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WebhookLogs' AND xtype='U')
     CREATE TABLE WebhookLogs (
         WebhookLogId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) NULL,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         GatewayName NVARCHAR(50) NOT NULL,
         EventId NVARCHAR(150) UNIQUE NOT NULL,
         EventType NVARCHAR(100) NOT NULL,
         Payload NVARCHAR(MAX) NOT NULL,
         ProcessingStatus NVARCHAR(30) DEFAULT 'Success',
         ErrorMessage NVARCHAR(MAX) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 7: Themes Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Themes' AND xtype='U')
     CREATE TABLE Themes (
         ThemeId INT IDENTITY(1,1) PRIMARY KEY,
         ThemeKey NVARCHAR(50) UNIQUE NOT NULL,
         Name NVARCHAR(100) NOT NULL,
         ConfigData NVARCHAR(MAX) NOT NULL
     )`,

    // Phase 7: StoreThemes Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreThemes' AND xtype='U')
     CREATE TABLE StoreThemes (
         StoreThemeId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         ThemeKey NVARCHAR(50) NOT NULL,
         IsActive BIT DEFAULT 0,
         ThemeSettingsJson NVARCHAR(MAX) NOT NULL,
         HomepageSectionsJson NVARCHAR(MAX) NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 7: StorePages Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StorePages' AND xtype='U')
     CREATE TABLE StorePages (
         PageId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         Title NVARCHAR(250) NOT NULL,
         Slug NVARCHAR(100) NOT NULL,
         Content NVARCHAR(MAX) NOT NULL,
         IsPublished BIT DEFAULT 1,
         SeoTitle NVARCHAR(250) NULL,
         SeoDescription NVARCHAR(500) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 7: NavigationMenus Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='NavigationMenus' AND xtype='U')
     CREATE TABLE NavigationMenus (
         MenuId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         MenuKey NVARCHAR(50) NOT NULL,
         Name NVARCHAR(100) NOT NULL,
         MenuItemsJson NVARCHAR(MAX) NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 7: MediaLibrary Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MediaLibrary' AND xtype='U')
     CREATE TABLE MediaLibrary (
         MediaId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         FileName NVARCHAR(250) NOT NULL,
         FileUrl NVARCHAR(MAX) NOT NULL,
         FileSize INT NOT NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,

    // Phase 7: BlogPosts Table
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlogPosts' AND xtype='U')
     CREATE TABLE BlogPosts (
         BlogPostId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         Title NVARCHAR(250) NOT NULL,
         Slug NVARCHAR(250) NOT NULL,
         Content NVARCHAR(MAX) NOT NULL,
         Category NVARCHAR(100) NULL,
         FeaturedImageUrl NVARCHAR(MAX) NULL,
         IsPublished BIT DEFAULT 0,
         SeoTitle NVARCHAR(250) NULL,
         SeoDescription NVARCHAR(500) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
      )`,
    // Phase 8: SubscriptionPlans
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SubscriptionPlans' AND xtype='U')
     CREATE TABLE SubscriptionPlans (
         PlanId INT IDENTITY(1,1) PRIMARY KEY,
         PlanKey NVARCHAR(50) UNIQUE NOT NULL,
         Name NVARCHAR(100) NOT NULL,
         Description NVARCHAR(500) NULL,
         Price DECIMAL(10,2) NOT NULL,
         Currency NVARCHAR(10) DEFAULT 'INR',
         BillingCycle NVARCHAR(20) DEFAULT 'monthly',
         TrialDays INT DEFAULT 0,
         IsActive BIT DEFAULT 1,
         IsRecommended BIT DEFAULT 0,
         SortOrder INT DEFAULT 0,
         Features NVARCHAR(MAX) NOT NULL,
      CreatedAt DATETIME DEFAULT GETDATE()
      )`,
    `IF NOT EXISTS (SELECT 1 FROM SubscriptionPlans)
     INSERT INTO SubscriptionPlans (PlanKey, Name, Description, Price, Currency, BillingCycle, TrialDays, IsActive, IsRecommended, SortOrder, Features)
     VALUES
     ('starter', 'Starter', 'For growing businesses ready to scale', 499, 'INR', 'monthly', 14, 1, 1, 1, '{"maxProducts":500,"maxOrdersPerMonth":-1,"storageMB":500,"staffAccounts":2,"themes":5,"customDomain":true,"apiAccess":false,"prioritySupport":false,"marketingTools":true,"advancedAnalytics":false,"reports":true}'),
     ('professional', 'Professional', 'Advanced tools for serious merchants', 999, 'INR', 'monthly', 14, 1, 0, 2, '{"maxProducts":-1,"maxOrdersPerMonth":-1,"storageMB":2000,"staffAccounts":5,"themes":10,"customDomain":true,"apiAccess":true,"prioritySupport":true,"marketingTools":true,"advancedAnalytics":true,"reports":true}'),
     ('business', 'Business', 'Complete solution for high-volume sellers', 1999, 'INR', 'monthly', 14, 1, 0, 3, '{"maxProducts":-1,"maxOrdersPerMonth":-1,"storageMB":5000,"staffAccounts":15,"themes":-1,"customDomain":true,"apiAccess":true,"prioritySupport":true,"marketingTools":true,"advancedAnalytics":true,"reports":true}'),
     ('enterprise', 'Enterprise', 'Custom solutions for large operations', 4999, 'INR', 'monthly', 14, 1, 0, 4, '{"maxProducts":-1,"maxOrdersPerMonth":-1,"storageMB":-1,"staffAccounts":-1,"themes":-1,"customDomain":true,"apiAccess":true,"prioritySupport":true,"marketingTools":true,"advancedAnalytics":true,"reports":true}')`,
    // Phase 8: StoreSubscriptions
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreSubscriptions' AND xtype='U')
     CREATE TABLE StoreSubscriptions (
         SubscriptionId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         PlanKey NVARCHAR(50) NOT NULL,
         Status NVARCHAR(20) DEFAULT 'active' CHECK (Status IN ('trial','active','past_due','suspended','cancelled','expired')),
         TrialStart DATETIME NULL,
         TrialEnd DATETIME NULL,
         CurrentPeriodStart DATETIME NOT NULL,
         CurrentPeriodEnd DATETIME NOT NULL,
         CancelledAt DATETIME NULL,
         CreatedAt DATETIME DEFAULT GETDATE(),
         UpdatedAt DATETIME DEFAULT GETDATE()
     )`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('StoreSubscriptions') AND name = 'ExpiryNoticesSent')
     ALTER TABLE StoreSubscriptions ADD ExpiryNoticesSent NVARCHAR(MAX) DEFAULT '[]'`,
    // Phase 8: BillingInvoices
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BillingInvoices' AND xtype='U')
     CREATE TABLE BillingInvoices (
         InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         SubscriptionId INT FOREIGN KEY REFERENCES StoreSubscriptions(SubscriptionId) NULL,
         InvoiceNumber NVARCHAR(50) UNIQUE NOT NULL,
         PlanName NVARCHAR(100) NOT NULL,
         Amount DECIMAL(10,2) NOT NULL,
         Currency NVARCHAR(10) DEFAULT 'INR',
         Tax DECIMAL(10,2) DEFAULT 0,
         Total DECIMAL(10,2) NOT NULL,
         Status NVARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending','paid','failed','cancelled','refunded')),
         BillingAddress NVARCHAR(MAX) NULL,
         PeriodStart DATETIME NULL,
         PeriodEnd DATETIME NULL,
         PaidAt DATETIME NULL,
         PaymentGateway NVARCHAR(50) NULL,
         PaymentTransactionId NVARCHAR(200) NULL,
        InvoicePdfUrl NVARCHAR(MAX) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
     )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BillingSequences' AND xtype='U')
     CREATE TABLE BillingSequences (
         SeqName NVARCHAR(100) PRIMARY KEY,
         LastValue INT NOT NULL DEFAULT 0
     )`,
    // Phase 8: SubscriptionPayments
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SubscriptionPayments' AND xtype='U')
     CREATE TABLE SubscriptionPayments (
         PaymentId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         InvoiceId INT FOREIGN KEY REFERENCES BillingInvoices(InvoiceId) NULL,
         SubscriptionId INT FOREIGN KEY REFERENCES StoreSubscriptions(SubscriptionId) NULL,
         GatewayName NVARCHAR(50) NOT NULL,
         TransactionId NVARCHAR(200) UNIQUE NOT NULL,
         Amount DECIMAL(10,2) NOT NULL,
         Currency NVARCHAR(10) DEFAULT 'INR',
         PaymentStatus NVARCHAR(30) NOT NULL,
         GatewayResponse NVARCHAR(MAX) NULL,
         CreatedAt DATETIME DEFAULT GETDATE()
     )`,
    // Phase 8: UsageMetrics
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UsageMetrics' AND xtype='U')
     CREATE TABLE UsageMetrics (
         UsageId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         Month NVARCHAR(7) NOT NULL,
         ProductsUsed INT DEFAULT 0,
         OrdersThisMonth INT DEFAULT 0,
         StorageUsedMB DECIMAL(10,2) DEFAULT 0,
         ApiRequests INT DEFAULT 0,
         MediaCount INT DEFAULT 0,
         CreatedAt DATETIME DEFAULT GETDATE(),
         CONSTRAINT UQ_UsageMetrics_StoreMonth UNIQUE (StoreId, Month)
     )`,
    // Phase 8: TrialHistory
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TrialHistory' AND xtype='U')
     CREATE TABLE TrialHistory (
         TrialId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT FOREIGN KEY REFERENCES Stores(StoreId) ON DELETE CASCADE,
         TenantId INT FOREIGN KEY REFERENCES Tenants(TenantId) NULL,
         PlanKey NVARCHAR(50) NOT NULL,
         StartedAt DATETIME NOT NULL,
         EndedAt DATETIME NULL,
         ConvertedToPlan NVARCHAR(50) NULL,
         Status NVARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active','converted','expired')),
          CreatedAt DATETIME DEFAULT GETDATE()
      )`,
    // Phase 9: Platform Administration
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
     CREATE TABLE AuditLogs (
        LogId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NULL,
        UserEmail NVARCHAR(255) NULL,
        Action NVARCHAR(100) NOT NULL,
        ResourceType NVARCHAR(50) NULL,
        ResourceId NVARCHAR(50) NULL,
        Details NVARCHAR(MAX) NULL,
        IpAddress NVARCHAR(50) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
     )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Announcements' AND xtype='U')
     CREATE TABLE Announcements (
        AnnouncementId INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        TargetType NVARCHAR(50) DEFAULT 'all_stores',
        TargetPlans NVARCHAR(MAX) NULL,
        TargetStoreIds NVARCHAR(MAX) NULL,
        Priority NVARCHAR(20) DEFAULT 'normal',
        Status NVARCHAR(20) DEFAULT 'published',
        CreatedBy INT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL
     )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PlatformSettings' AND xtype='U')
     CREATE TABLE PlatformSettings (
        SettingId INT IDENTITY(1,1) PRIMARY KEY,
        SettingKey NVARCHAR(100) UNIQUE NOT NULL,
        SettingValue NVARCHAR(MAX) NOT NULL,
        SettingType NVARCHAR(50) DEFAULT 'string',
        Description NVARCHAR(MAX) NULL,
        UpdatedAt DATETIME DEFAULT GETDATE()
     )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AdminNotifications' AND xtype='U')
     CREATE TABLE AdminNotifications (
        NotificationId INT IDENTITY(1,1) PRIMARY KEY,
        Type NVARCHAR(50) NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Priority NVARCHAR(20) DEFAULT 'normal',
        IsRead BIT DEFAULT 0,
        ReferenceType NVARCHAR(50) NULL,
        ReferenceId NVARCHAR(50) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
     )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SystemEvents' AND xtype='U')
     CREATE TABLE SystemEvents (
        EventId INT IDENTITY(1,1) PRIMARY KEY,
        EventType NVARCHAR(50) NOT NULL,
        Severity NVARCHAR(20) DEFAULT 'info',
        Source NVARCHAR(100) NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Details NVARCHAR(MAX) NULL,
        Resolved BIT DEFAULT 0,
        ResolvedAt DATETIME NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
     )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SupportTickets' AND xtype='U')
     CREATE TABLE SupportTickets (
         TicketId INT IDENTITY(1,1) PRIMARY KEY,
         StoreId INT NULL,
         StoreName NVARCHAR(255) NULL,
         UserId INT NULL,
         UserEmail NVARCHAR(255) NULL,
         Subject NVARCHAR(255) NOT NULL,
         Description NVARCHAR(MAX) NOT NULL,
         Category NVARCHAR(50) DEFAULT 'general',
         Priority NVARCHAR(20) DEFAULT 'medium',
         Status NVARCHAR(20) DEFAULT 'open',
         AssignedTo INT NULL,
         BusinessType NVARCHAR(100) NULL,
         PlanKey NVARCHAR(50) NULL,
         CreatedAt DATETIME DEFAULT GETDATE(),
         UpdatedAt DATETIME DEFAULT GETDATE()
      )`,
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SupportTicketReplies' AND xtype='U')
     CREATE TABLE SupportTicketReplies (
         ReplyId INT IDENTITY(1,1) PRIMARY KEY,
         TicketId INT NOT NULL,
         UserId INT NULL,
         UserRole NVARCHAR(20) NULL,
         Message NVARCHAR(MAX) NOT NULL,
         IsInternal BIT DEFAULT 0,
         CreatedAt DATETIME DEFAULT GETDATE()
       )`,
    // Phase 99: Update Users Role CHECK constraint and rename B2C->Customer, remove B2B
    `IF EXISTS (SELECT * FROM sys.check_constraints WHERE OBJECT_NAME(parent_object_id) = 'Users' AND name LIKE 'CK__Users__Role%')
     BEGIN
         UPDATE Users SET Role = 'Customer' WHERE Role = 'B2C';
         UPDATE Users SET Role = 'Seller' WHERE Role = 'B2B';
         UPDATE Users SET Role = 'Admin' WHERE Role = 'SuperAdmin';
         DECLARE @RoleConstraintName NVARCHAR(128);
         SELECT @RoleConstraintName = name FROM sys.check_constraints WHERE OBJECT_NAME(parent_object_id) = 'Users' AND name LIKE 'CK__Users__Role%';
         DECLARE @DropRoleSql NVARCHAR(MAX) = 'ALTER TABLE Users DROP CONSTRAINT ' + @RoleConstraintName;
         EXEC sp_executesql @DropRoleSql;
         ALTER TABLE Users ADD CONSTRAINT CK_Users_Role_Updated CHECK (Role IN ('Customer', 'Admin', 'Seller'));
     END`,
    // Phase 101: Ensure admin users have email verified
    `UPDATE Users SET EmailVerified = 1 WHERE Role = 'Admin' AND (EmailVerified IS NULL OR EmailVerified = 0)`,
    // Phase 102: Remove 'free' plan, fix enterprise trial to 14 days, renumber sortOrder
    `IF EXISTS (SELECT 1 FROM SubscriptionPlans WHERE PlanKey = 'free')
     BEGIN
       DELETE FROM StoreSubscriptions WHERE PlanKey = 'free';
       DELETE FROM SubscriptionPlans WHERE PlanKey = 'free';
     END`,
    `UPDATE SubscriptionPlans SET TrialDays = 14 WHERE PlanKey = 'enterprise' AND TrialDays != 14`,
    `UPDATE SubscriptionPlans SET SortOrder = 1 WHERE PlanKey = 'starter' AND SortOrder != 1`,
    `UPDATE SubscriptionPlans SET SortOrder = 2 WHERE PlanKey = 'professional' AND SortOrder != 2`,
    `UPDATE SubscriptionPlans SET SortOrder = 3 WHERE PlanKey = 'business' AND SortOrder != 3`,
    `UPDATE SubscriptionPlans SET SortOrder = 4 WHERE PlanKey = 'enterprise' AND SortOrder != 4`,
    // Phase 103: Add BusinessType, PlanKey to SupportTickets; IsInternal to SupportTicketReplies
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SupportTickets') AND name = 'BusinessType')
      ALTER TABLE SupportTickets ADD BusinessType NVARCHAR(100) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SupportTickets') AND name = 'PlanKey')
      ALTER TABLE SupportTickets ADD PlanKey NVARCHAR(50) NULL`,
    `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SupportTicketReplies') AND name = 'IsInternal')
      ALTER TABLE SupportTicketReplies ADD IsInternal BIT DEFAULT 0`,
  ];


  for (let query of schemaQueries) {
    await pool.request().query(query);
  }
}

async function seedSqlDatabase() {
  const checkCat = await pool.request().query('SELECT COUNT(*) as cnt FROM Categories');
  if (checkCat.recordset[0].cnt === 0) {
    console.log('Seeding SQL Server Categories...');
    await pool.request().query("INSERT INTO Categories (Name, Slug, Description) VALUES ('Grains', 'grains', 'Premium quality grains and flour')");
    await pool.request().query("INSERT INTO Categories (Name, Slug, Description) VALUES ('Dry Fruits', 'dry-fruits', 'Crunchy and nutritious dry fruits')");
    await pool.request().query("INSERT INTO Categories (Name, Slug, Description) VALUES ('Spices', 'spices', 'Aromatic and pure Indian spices')");
  }

  const checkThemes = await pool.request().query('SELECT COUNT(*) as cnt FROM Themes');
  if (checkThemes.recordset[0].cnt === 0) {
    console.log('Seeding SQL Server Starter Themes...');
    const themesToSeed = [
      ['ajio-inspired', 'Ajio Inspired', '{"primaryColor":"#e91e63","secondaryColor":"#212121","accentColor":"#ffc107","typography":"Inter","borderRadius":"12px","announcementText":"Fashion that speaks your style!"}'],
      ['zara-inspired', 'Zara Inspired', '{"primaryColor":"#111111","secondaryColor":"#333333","accentColor":"#ffffff","typography":"Inter","borderRadius":"0px","announcementText":"Timeless elegance, modern edge."}'],
      ['nike-inspired', 'Nike Inspired', '{"primaryColor":"#f5f5f5","secondaryColor":"#1a1a1a","accentColor":"#ea1d2c","typography":"Inter","borderRadius":"4px","announcementText":"Just Do It. Find your edge."}'],
      ['boutique-inspired', 'Boutique Inspired', '{"primaryColor":"#d4a373","secondaryColor":"#2c2c2c","accentColor":"#f8edeb","typography":"Inter","borderRadius":"8px","announcementText":"Curated with love, crafted for you."}'],
      ['streetwear-inspired', 'Streetwear Inspired', '{"primaryColor":"#ff6b35","secondaryColor":"#0d0d0d","accentColor":"#f7c59f","typography":"Inter","borderRadius":"0px","announcementText":"Urban style, raw attitude."}'],
      ['nykaa-inspired', 'Nykaa Inspired', '{"primaryColor":"#fc2779","secondaryColor":"#1a1a2e","accentColor":"#ffd700","typography":"Inter","borderRadius":"20px","announcementText":"Beauty that empowers you!"}'],
      ['sephora-inspired', 'Sephora Inspired', '{"primaryColor":"#000000","secondaryColor":"#ffffff","accentColor":"#e60023","typography":"Inter","borderRadius":"0px","announcementText":"Discover your beauty power."}'],
      ['skincare-inspired', 'Skincare Inspired', '{"primaryColor":"#a8d8ea","secondaryColor":"#2c3e50","accentColor":"#f4a261","typography":"Inter","borderRadius":"16px","announcementText":"Glow naturally, shine daily."}'],
      ['luxury-beauty-inspired', 'Luxury Beauty', '{"primaryColor":"#c9a84c","secondaryColor":"#1a1a1a","accentColor":"#f5f5f5","typography":"Inter","borderRadius":"4px","announcementText":"Indulge in luxury beauty."}'],
      ['makeup-inspired', 'Makeup Inspired', '{"primaryColor":"#ff69b4","secondaryColor":"#2d2d2d","accentColor":"#ff1493","typography":"Inter","borderRadius":"12px","announcementText":"Paint your world with color."}'],
      ['apple-inspired', 'Apple Inspired', '{"primaryColor":"#1d1d1f","secondaryColor":"#f5f5f7","accentColor":"#0071e3","typography":"Inter","borderRadius":"12px","announcementText":"Think different. Shop smart."}'],
      ['samsung-inspired', 'Samsung Inspired', '{"primaryColor":"#1428a0","secondaryColor":"#000000","accentColor":"#ffffff","typography":"Inter","borderRadius":"8px","announcementText":"Do what you cant."}'],
      ['amazon-tech-inspired', 'Amazon Tech', '{"primaryColor":"#ff9900","secondaryColor":"#131921","accentColor":"#ffffff","typography":"Inter","borderRadius":"4px","announcementText":"Tech at your fingertips."}'],
      ['gaming-inspired', 'Gaming Inspired', '{"primaryColor":"#ff003c","secondaryColor":"#0a0a0a","accentColor":"#00ff88","typography":"Inter","borderRadius":"0px","announcementText":"Level up your game."}'],
      ['gadgets-inspired', 'Gadgets Inspired', '{"primaryColor":"#00bcd4","secondaryColor":"#263238","accentColor":"#ff5722","typography":"Inter","borderRadius":"8px","announcementText":"The future is now."}'],
      ['blinkit-inspired', 'Blinkit Inspired', '{"primaryColor":"#fcdb05","secondaryColor":"#1a1a1a","accentColor":"#2e7d32","typography":"Inter","borderRadius":"8px","announcementText":"Minutes matter. We deliver."}'],
      ['bigbasket-inspired', 'Bigbasket Inspired', '{"primaryColor":"#6bbf47","secondaryColor":"#1a3c34","accentColor":"#ff8c00","typography":"Inter","borderRadius":"8px","announcementText":"Freshness delivered daily."}'],
      ['organic-themed', 'Organic Themed', '{"primaryColor":"#15803d","secondaryColor":"#1e3a1e","accentColor":"#ca8a04","typography":"Inter","borderRadius":"16px","announcementText":"Pure, natural, wholesome."}'],
      ['supermarket-inspired', 'Supermarket Style', '{"primaryColor":"#e53935","secondaryColor":"#1b5e20","accentColor":"#fffde7","typography":"Inter","borderRadius":"4px","announcementText":"Big savings, every visit."}'],
      ['daily-essentials-inspired', 'Daily Essentials', '{"primaryColor":"#546e7a","secondaryColor":"#37474f","accentColor":"#ffb300","typography":"Inter","borderRadius":"4px","announcementText":"Everything you need, every day."}'],
      ['ikea-inspired', 'IKEA Inspired', '{"primaryColor":"#003399","secondaryColor":"#ffcc00","accentColor":"#ffffff","typography":"Inter","borderRadius":"0px","announcementText":"Make your home come alive."}'],
      ['modern-inspired', 'Modern Living', '{"primaryColor":"#10b981","secondaryColor":"#1e293b","accentColor":"#f59e0b","typography":"Inter","borderRadius":"8px","announcementText":"Modern spaces, modern life."}'],
      ['luxury-inspired', 'Luxury Living', '{"primaryColor":"#1a1a2e","secondaryColor":"#c9a84c","accentColor":"#e8e8e8","typography":"Inter","borderRadius":"4px","announcementText":"Redefine luxury at home."}'],
      ['wooden-inspired', 'Wooden Inspired', '{"primaryColor":"#8d6e63","secondaryColor":"#3e2723","accentColor":"#a5d6a7","typography":"Inter","borderRadius":"8px","announcementText":"Natural beauty for your home."}'],
      ['decor-inspired', 'Decor Inspired', '{"primaryColor":"#f3e5f5","secondaryColor":"#4a148c","accentColor":"#ce93d8","typography":"Inter","borderRadius":"12px","announcementText":"Decorate your dreams."}'],
      ['nike-performance-inspired', 'Nike Performance', '{"primaryColor":"#1a1a1a","secondaryColor":"#f5f5f5","accentColor":"#00e676","typography":"Inter","borderRadius":"4px","announcementText":"Unleash your potential."}'],
      ['adidas-inspired', 'Adidas Inspired', '{"primaryColor":"#000000","secondaryColor":"#ffffff","accentColor":"#00589b","typography":"Inter","borderRadius":"0px","announcementText":"Impossible is nothing."}'],
      ['gym-inspired', 'Gym Inspired', '{"primaryColor":"#ff1744","secondaryColor":"#212121","accentColor":"#2979ff","typography":"Inter","borderRadius":"4px","announcementText":"Train hard, shop easy."}'],
      ['outdoor-inspired', 'Outdoor Inspired', '{"primaryColor":"#2e7d32","secondaryColor":"#1b5e20","accentColor":"#ff8f00","typography":"Inter","borderRadius":"8px","announcementText":"Adventure awaits outside."}'],
      ['equipment-inspired', 'Equipment Inspired', '{"primaryColor":"#ff6f00","secondaryColor":"#37474f","accentColor":"#ffab00","typography":"Inter","borderRadius":"4px","announcementText":"Gear up for greatness."}'],
      ['spare-parts-inspired', 'Spare Parts', '{"primaryColor":"#e65100","secondaryColor":"#1a237e","accentColor":"#ff9100","typography":"Inter","borderRadius":"4px","announcementText":"Parts that keep you moving."}'],
      ['bike-inspired', 'Bike Inspired', '{"primaryColor":"#c62828","secondaryColor":"#212121","accentColor":"#ffffff","typography":"Inter","borderRadius":"0px","announcementText":"Ride free, ride safe."}'],
      ['accessories-inspired', 'Auto Accessories', '{"primaryColor":"#1565c0","secondaryColor":"#0d47a1","accentColor":"#ffd600","typography":"Inter","borderRadius":"8px","announcementText":"Upgrade your ride."}'],
      ['luxury-auto-inspired', 'Luxury Auto', '{"primaryColor":"#b8860b","secondaryColor":"#0a0a0a","accentColor":"#f5f5f5","typography":"Inter","borderRadius":"4px","announcementText":"Where luxury meets performance."}'],
      ['garage-inspired', 'Garage Inspired', '{"primaryColor":"#d32f2f","secondaryColor":"#1a1a1a","accentColor":"#757575","typography":"Inter","borderRadius":"0px","announcementText":"Built tough, tested hard."}']
    ];
    for (const [key, name, config] of themesToSeed) {
      await pool.request()
        .input('key', sql.NVarChar, key)
        .input('name', sql.NVarChar, name)
        .input('config', sql.NVarChar, config)
        .query('INSERT INTO Themes (ThemeKey, Name, ConfigData) VALUES (@key, @name, @config)');
    }
  }

  const adminRes = await pool.request()
    .input('email', sql.NVarChar, 'admin@snapshop.com')
    .query("SELECT UserId FROM Users WHERE Email = @email");

  const hash = '$2a$10$5r0xM231Aw.pafmx1zoCFe3PRKcrP/G.OBIdnwldB1uMA3EL2GZEW';

  if (adminRes.recordset.length === 0) {
    console.log('Seeding SQL Server Admin User...');
    await pool.request()
      .input('email', sql.NVarChar, 'admin@snapshop.com')
      .input('hash', sql.NVarChar, hash)
      .query(`
        INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Phone, Role)
        VALUES (@email, @hash, 'SnapShop', 'Admin', '9876543210', 'Admin')
      `);
      // Seed AdminProfiles for newly created admin
      const newAdminRes = await pool.request()
        .input('email', sql.NVarChar, 'admin@snapshop.com')
        .query("SELECT UserId FROM Users WHERE Email = @email");
      if (newAdminRes.recordset.length > 0) {
        const adminId = newAdminRes.recordset[0].UserId;
        const existingAp = await pool.request()
          .query("SELECT COUNT(*) as cnt FROM AdminProfiles");
        if (existingAp.recordset[0].cnt === 0) {
          await pool.request()
            .input('userId', sql.Int, adminId)
            .query("INSERT INTO AdminProfiles (UserId) VALUES (@userId)");
        }
      }
  } else {
    console.log('Ensuring SQL Server Admin User has correct password...');
    await pool.request()
      .input('email', sql.NVarChar, 'admin@snapshop.com')
      .input('hash', sql.NVarChar, hash)
      .query("UPDATE Users SET PasswordHash = @hash, Role = 'Admin' WHERE Email = @email");
  }

  // Seed all category seller accounts into SQL Server
  const sellerAccounts = [
    { email: 'fashion@snapshop.com', hash: '$2a$10$2ynuvC.HBchZrJAxuh7PLOqa8qRMgXrWE0HBDvxocay9YTXwtUgRy', firstName: 'Fashion', storeName: 'StyleBazaar Fashion', storeDesc: 'Fashion Seller Store' },
    { email: 'mobiles@snapshop.com', hash: '$2a$10$3LlBQFLJgZXuxyeW0h5A2OYEa.pPhSQlPq0aKygwYjBSsg8PM9116', firstName: 'Mobiles', storeName: 'Mobiles Store', storeDesc: 'Mobiles Seller Store' },
    { email: 'ac@snapshop.com', hash: '$2a$10$ziaWF//05IkrIrAmQSZHN.tgW7hR7Q1mi5rnX//.1tEdIwL4QhTGq', firstName: 'Air Conditioners', storeName: 'AC Store', storeDesc: 'Air Conditioners Seller Store' },
    { email: 'groceries@snapshop.com', hash: '$2a$10$wnTYReWUKutRAcPWacjkaeqGb9vUVGgDPXhZe5.Q.McHUmyJsuAiO', firstName: 'Groceries', storeName: 'Groceries Store', storeDesc: 'Groceries Seller Store' },
    { email: 'menfashion@snapshop.com', hash: '$2a$10$FhpzPpJKQ4B7vc38PJRFH.z8ao.xvGbIyL67G96c3d2ad813aqXxO', firstName: 'Men Fashion', storeName: 'Men Fashion Store', storeDesc: 'Men Fashion Seller Store' },
    { email: 'womanfashion@snapshop.com', hash: '$2a$10$zcLCYSILwVXyiG5h.6SnHegC5tjjol6qLmKF9xJGrAssV55gSRfAS', firstName: 'Woman Fashion', storeName: 'Woman Fashion Store', storeDesc: 'Woman Fashion Seller Store' },
    { email: 'books@snapshop.com', hash: '$2a$10$eHCcFzDBqMXW65auHxK0RetMpXOamG3kG03LxpafmsVaQlsvxi/pC', firstName: 'Books', storeName: 'Books Store', storeDesc: 'Books Seller Store' },
    { email: 'computers@snapshop.com', hash: '$2a$10$oZB.aYp1/mT1Vj3IA2HEduNgo8m8Ua7Rxn9xoZOuBBznVF4Hdc0pG', firstName: 'Computers', storeName: 'Computers Store', storeDesc: 'Computers Seller Store' },
    { email: 'refrigerators@snapshop.com', hash: '$2a$10$P36GA1oaXpPxaSfXDjLvDO2VuBuFS8Mu801jx1s6GW7qElZvd1thS', firstName: 'Refrigerators', storeName: 'Refrigerators Store', storeDesc: 'Refrigerators Seller Store' },
    { email: 'furniture@snapshop.com', hash: '$2a$10$CUYouDstFIWGx.OdJolEnOf4bqsk/SHiR//t.Icm4rP54s5ikOlFe', firstName: 'Furniture', storeName: 'Furniture Store', storeDesc: 'Furniture Seller Store' },
    { email: 'kitchen@snapshop.com', hash: '$2a$10$O5Bvbk4wh6h8DEw3LCC8ZORh3egvxhB597.hXYEKcxQSpYDLk9hy.', firstName: 'Kitchen', storeName: 'Kitchen Store', storeDesc: 'Kitchen Seller Store' },
    { email: 'speakers@snapshop.com', hash: '$2a$10$zjVTFODmhiobbDM.6UOR6OeSxsR.FXc5HCXvOWlUhpc/LBLOz2zIa', firstName: 'Speakers', storeName: 'Speakers Store', storeDesc: 'Speakers Seller Store' },
    { email: 'television@snapshop.com', hash: '$2a$10$3SvT2EuMjhhCa0VLAlqAx.ngaNnUa48XoV1OS.CgItyU9BDCPog.2', firstName: 'Television', storeName: 'Television Store', storeDesc: 'Television Seller Store' },
    { email: 'watches@snapshop.com', hash: '$2a$10$lMNM88Kr9UEj5.H/0PgGWOWDxqIo1jC32IlUTk.OVpFArgbjvaPD2', firstName: 'Watches', storeName: 'Watches Store', storeDesc: 'Watches Seller Store' },
  ];

  for (const seller of sellerAccounts) {
    const sellerRes = await pool.request()
      .input('email', sql.NVarChar, seller.email)
      .query("SELECT UserId FROM Users WHERE Email = @email");

    if (sellerRes.recordset.length === 0) {
      console.log(`Seeding SQL Server Seller: ${seller.email}...`);
      await pool.request()
        .input('email', sql.NVarChar, seller.email)
        .input('hash', sql.NVarChar, seller.hash)
        .input('firstName', sql.NVarChar, seller.firstName)
        .input('storeName', sql.NVarChar, seller.storeName)
        .input('storeDesc', sql.NVarChar, seller.storeDesc)
        .query(`
          INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Phone, Role, Gstin, StoreName, StoreDescription, SellerStatus)
          VALUES (@email, @hash, @firstName, 'Seller', '9876543210', 'Seller', '22AAAAA0000A1Z5', @storeName, @storeDesc, 'Approved')
        `);
      // Seed SellerProfiles for newly created seller
      const newSellerRes = await pool.request()
        .input('email', sql.NVarChar, seller.email)
        .query("SELECT UserId FROM Users WHERE Email = @email");
      if (newSellerRes.recordset.length > 0) {
        const sid = newSellerRes.recordset[0].UserId;
        await pool.request()
          .input('userId', sql.Int, sid)
          .input('storeName', sql.NVarChar, seller.storeName)
          .input('storeDesc', sql.NVarChar, seller.storeDesc)
          .input('gstin', sql.NVarChar, '22AAAAA0000A1Z5')
          .input('status', sql.NVarChar, 'Approved')
          .query(`
            INSERT INTO SellerProfiles (UserId, StoreName, StoreDescription, Gstin, SellerStatus, DiscountRate, DiscountScope)
            VALUES (@userId, @storeName, @storeDesc, @gstin, @status, 0, 'all')
          `);
      }
    } else {
      // Ensure existing seller has correct hash, name, and Approved status
      await pool.request()
        .input('email', sql.NVarChar, seller.email)
        .input('hash', sql.NVarChar, seller.hash)
        .input('firstName', sql.NVarChar, seller.firstName)
        .input('storeName', sql.NVarChar, seller.storeName)
        .input('storeDesc', sql.NVarChar, seller.storeDesc)
        .query(`
          UPDATE Users 
          SET PasswordHash = @hash, FirstName = @firstName, LastName = 'Seller', Role = 'Seller', StoreName = @storeName, StoreDescription = @storeDesc, SellerStatus = 'Approved'
          WHERE Email = @email
        `);
    }
  }
  console.log('SQL Server seller accounts seeded/verified.');

  const checkProd = await pool.request().query('SELECT COUNT(*) as cnt FROM Products');
  if (checkProd.recordset[0].cnt === 0) {
    console.log('Seeding SQL Server 50-Product Catalog...');
    const seedPath = path.join(__dirname, '../snapshop_catalog_seed.json');
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, 'utf8');
      const seedItems = JSON.parse(raw);

      let pId = 1;
      for (let item of seedItems) {
        let catId = 1;
        if (item.category === 'Dry Fruits') catId = 2;
        if (item.category === 'Spices') catId = 3;

        const imageUrl = `/assets/groceesary/${pId++}.png`;

        const prodResult = await pool.request()
          .input('catId', sql.Int, catId)
          .input('name', sql.NVarChar, item.name)
          .input('slug', sql.NVarChar, item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
          .input('desc', sql.NVarChar, item.description)
          .input('storage', sql.NVarChar, item.storage_instructions)
          .input('bullets', sql.NVarChar, item.bullets.join(';'))
          .input('imagePrompt', sql.NVarChar, item.image_prompt)
          .input('imageUrl', sql.NVarChar, imageUrl)
          .query(`
            INSERT INTO Products (CategoryId, VendorId, Name, Slug, Description, StorageInstructions, Bullets, ImagePrompt, ImageUrl, Status, FssaiLicNo)
            OUTPUT INSERTED.ProductId
            VALUES (@catId, 1, @name, @slug, @desc, @storage, @bullets, @imagePrompt, @imageUrl, 'Active', '10021051000123')
          `);

        const newProdId = prodResult.recordset[0].ProductId;

        await pool.request()
          .input('prodId', sql.Int, newProdId)
          .input('key', sql.NVarChar, 'ShelfLife')
          .input('val', sql.NVarChar, `${item.shelf_life_months} Months`)
          .query(`INSERT INTO ProductAttributes (ProductId, AttributeKey, AttributeValue) VALUES (@prodId, @key, @val)`);

        for (let sz of item.pack_sizes) {
          let weightGrams = parseInt(sz) * (sz.includes('kg') ? 1000 : 1);
          let priceMult = sz.includes('kg') ? 3.5 : (sz.includes('500g') ? 1.8 : 1);
          let basePrice = item.price_inr_estimate;
          let calculatedPrice = Math.round(basePrice * priceMult);
          let sku = `FK-${catId}-${newProdId}-${weightGrams}`;

          await pool.request()
            .input('prodId', sql.Int, newProdId)
            .input('weight', sql.Int, weightGrams)
            .input('price', sql.Decimal(10, 2), calculatedPrice)
            .input('sku', sql.NVarChar, sku)
            .query(`
              INSERT INTO ProductVariants (ProductId, WeightGrams, Price, Stock, Sku, ExpiryDate)
              VALUES (@prodId, @weight, @price, 100, @sku, '2027-06-30')
            `);
        }
      }
      console.log('SQL Server Database seeding complete with 50 products.');
    }
  }
}

async function migrateLocalDbToSql() {
  const data = getLocalDb();
  if (!data || !data.categories || data.categories.length === 0) {
    console.log('[Migration] Local DB is empty, nothing to migrate.');
    return;
  }
  const catCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Categories');
  const prodCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Products');
  const userCount = await pool.request().query('SELECT COUNT(*) as cnt FROM Users');
  const jsonProdCount = data.products.length;

  const sqlHasData = catCount.recordset[0].cnt > 0 || userCount.recordset[0].cnt > 0 || prodCount.recordset[0].cnt > 0;
  if (sqlHasData) {
    // Ensure all DummyJSON columns exist in Products table
    const productColumns = [
      'DummyJsonData NVARCHAR(MAX) NULL',
      'SaleStartDate DATETIME NULL',
      'SaleEndDate DATETIME NULL',
      'Discount DECIMAL(5,2) NULL DEFAULT 0',
      'Brand NVARCHAR(100) NULL',
      'Rating DECIMAL(3,1) NULL',
      'DiscountPercentage DECIMAL(5,2) NULL DEFAULT 0',
      'Stock INT NULL DEFAULT 0',
      'AvailabilityStatus NVARCHAR(50) NULL',
      'WeightGrams INT NULL',
      'DimensionsJson NVARCHAR(500) NULL',
      'WarrantyInformation NVARCHAR(200) NULL',
      'ShippingInformation NVARCHAR(200) NULL',
      'ReturnPolicy NVARCHAR(200) NULL',
      'MinimumOrderQuantity INT NULL DEFAULT 1',
      'Barcode NVARCHAR(50) NULL',
      'QrCode NVARCHAR(MAX) NULL',
      'Thumbnail NVARCHAR(MAX) NULL',
      'ImagesJson NVARCHAR(MAX) NULL',
      'TagsJson NVARCHAR(1000) NULL',
      'ReviewsJson NVARCHAR(MAX) NULL',
      'DummyProductId INT NULL',
      'UpdatedAt DATETIME NULL'
    ];
    for (const col of productColumns) {
      try { await pool.request().query(`ALTER TABLE Products ADD ${col}`); } catch (e) { }
    }

    // SQL already has data — it is the source of truth. Never clear and re-import.
    // Log a warning if counts differ but do not touch SQL data.
    const sqlProdCnt = parseInt(prodCount.recordset[0].cnt);
    if (sqlProdCnt !== jsonProdCount) {
      console.log(`[Migration] SQL has ${sqlProdCnt} products (JSON has ${jsonProdCount}). SQL is source of truth, skipping migration.`);
    } else {
      console.log(`[Migration] SQL already has exactly ${sqlProdCnt} products, skipping migration.`);
    }
    useSqlServer = true;
    return;
  }

  console.log('[Migration] Starting full data migration from JSON to SQL Server...');

  try {
    // 0. Migrate Tenants (skip if already exists)
    if (data.tenants && data.tenants.length > 0) {
      const existingTenants = await pool.request().query('SELECT COUNT(*) as cnt FROM Tenants');
      if (existingTenants.recordset[0].cnt === 0) {
        console.log(`[Migration] Migrating ${data.tenants.length} tenants...`);
        await pool.request().query('SET IDENTITY_INSERT Tenants ON');
        for (const t of data.tenants) {
          await pool.request()
            .input('id', sql.Int, t.id)
            .input('name', sql.NVarChar, t.name)
            .query(`INSERT INTO Tenants (TenantId, Name) VALUES (@id, @name)`);
        }
        await pool.request().query('SET IDENTITY_INSERT Tenants OFF');
      }
    }

    // 0b. Migrate Stores (skip if already exists)
    if (data.stores && data.stores.length > 0) {
      const existingStores = await pool.request().query('SELECT COUNT(*) as cnt FROM Stores');
      if (existingStores.recordset[0].cnt === 0) {
        console.log(`[Migration] Migrating ${data.stores.length} stores...`);
        await pool.request().query('SET IDENTITY_INSERT Stores ON');
        for (const s of data.stores) {
          await pool.request()
            .input('id', sql.Int, s.id)
            .input('tenantId', sql.Int, s.tenantId || 1)
            .input('ownerId', sql.Int, s.ownerId || 1)
            .input('name', sql.NVarChar, s.name)
            .input('slug', sql.NVarChar, s.slug)
            .input('isActive', sql.Bit, s.isActive !== undefined ? (s.isActive ? 1 : 0) : 1)
            .query(`INSERT INTO Stores (StoreId, TenantId, OwnerId, Name, Slug, IsActive) VALUES (@id, @tenantId, @ownerId, @name, @slug, @isActive)`);
        }
        await pool.request().query('SET IDENTITY_INSERT Stores OFF');
      }
    }

    // 0c. Migrate StoreSettings
    if (data.storeSettings && data.storeSettings.length > 0) {
      console.log(`[Migration] Migrating ${data.storeSettings.length} store settings...`);
      await pool.request().query('SET IDENTITY_INSERT StoreSettings ON');
      for (const ss of data.storeSettings) {
        await pool.request()
          .input('id', sql.Int, ss.id || ss.SettingId)
          .input('storeId', sql.Int, ss.storeId || ss.StoreId)
          .input('tenantId', sql.Int, ss.tenantId || ss.TenantId || 1)
          .input('key', sql.NVarChar, ss.settingKey || ss.SettingKey)
          .input('val', sql.NVarChar, ss.settingValue || ss.SettingValue || null)
          .query(`INSERT INTO StoreSettings (SettingId, StoreId, TenantId, SettingKey, SettingValue) VALUES (@id, @storeId, @tenantId, @key, @val)`);
      }
      await pool.request().query('SET IDENTITY_INSERT StoreSettings OFF');
    }

    // 0d. Migrate Domains
    if (data.domains && data.domains.length > 0) {
      console.log(`[Migration] Migrating ${data.domains.length} domains...`);
      await pool.request().query('SET IDENTITY_INSERT Domains ON');
      for (const d of data.domains) {
        await pool.request()
          .input('id', sql.Int, d.id)
          .input('storeId', sql.Int, d.storeId || 1)
          .input('tenantId', sql.Int, d.tenantId || 1)
          .input('name', sql.NVarChar, d.domainName)
          .input('isPrimary', sql.Bit, d.isPrimary ? 1 : 0)
          .query(`INSERT INTO Domains (DomainId, StoreId, TenantId, DomainName, IsPrimary) VALUES (@id, @storeId, @tenantId, @name, @isPrimary)`);
      }
      await pool.request().query('SET IDENTITY_INSERT Domains OFF');
    }

    // 1. Migrate Categories
    console.log(`[Migration] Migrating ${data.categories.length} categories...`);
    await pool.request().query('SET IDENTITY_INSERT Categories ON');
    for (const c of data.categories) {
      await pool.request()
        .input('id', sql.Int, c.id)
        .input('name', sql.NVarChar, c.name)
        .input('slug', sql.NVarChar, c.slug)
        .input('desc', sql.NVarChar, c.description || '')
        .input('tenantId', sql.Int, c.tenantId || 1)
        .input('parentId', sql.Int, c.parentCategoryId || null)
        .input('isActive', sql.Bit, c.isActive !== undefined ? (c.isActive ? 1 : 0) : 1)
        .query('INSERT INTO Categories (CategoryId, Name, Slug, Description, TenantId, ParentCategoryId, IsActive) VALUES (@id, @name, @slug, @desc, @tenantId, @parentId, @isActive)');
    }
    await pool.request().query('SET IDENTITY_INSERT Categories OFF');

    // 2. Migrate Users
    console.log(`[Migration] Migrating ${data.users.length} users...`);
    await pool.request().query('SET IDENTITY_INSERT Users ON');
    for (const u of data.users) {
      const role = u.role || 'Customer';
      const status = u.sellerStatus || (role === 'Seller' ? 'Pending' : 'Approved');
      await pool.request()
        .input('id', sql.Int, u.id)
        .input('email', sql.NVarChar, u.email)
        .input('hash', sql.NVarChar, u.passwordHash)
        .input('first', sql.NVarChar, u.firstName)
        .input('last', sql.NVarChar, u.lastName || '')
        .input('phone', sql.NVarChar, u.phone || '')
        .input('role', sql.NVarChar, role)
        .input('gstin', sql.NVarChar, u.gstin || null)
        .input('storeName', sql.NVarChar, u.storeName || null)
        .input('storeDesc', sql.NVarChar, u.storeDescription || null)
        .input('status', sql.NVarChar, status)
        .input('tenantId', sql.Int, u.tenantId || 1)
        .input('storeId', sql.Int, u.storeId || 1)
        .query(`
          INSERT INTO Users (UserId, Email, PasswordHash, FirstName, LastName, Phone, Role, Gstin, StoreName, StoreDescription, SellerStatus, TenantId, StoreId)
          VALUES (@id, @email, @hash, @first, @last, @phone, @role, @gstin, @storeName, @storeDesc, @status, @tenantId, @storeId)
        `);
    }
    await pool.request().query('SET IDENTITY_INSERT Users OFF');

    // 2b. Migrate SellerProfiles (if any exist in data)
    if (data.sellerProfiles && data.sellerProfiles.length > 0) {
      console.log(`[Migration] Migrating ${data.sellerProfiles.length} seller profiles...`);
      for (const sp of data.sellerProfiles) {
        await pool.request()
          .input('userId', sql.Int, sp.userId)
          .input('storeName', sql.NVarChar, sp.storeName || null)
          .input('storeDesc', sql.NVarChar, sp.storeDescription || null)
          .input('status', sql.NVarChar, sp.sellerStatus || 'Pending')
          .input('gstin', sql.NVarChar, sp.gstin || null)
          .input('discount', sql.Decimal(5,2), sp.discountRate || 0)
          .input('discountScope', sql.NVarChar(10), sp.discountScope || 'all')
          .input('discountPids', sql.NVarChar(500), (sp.discountProductIds || []).join(','))
          .query("INSERT INTO SellerProfiles (UserId, StoreName, StoreDescription, SellerStatus, Gstin, DiscountRate, DiscountScope, DiscountProductIds) VALUES (@userId, @storeName, @storeDesc, @status, @gstin, @discount, @discountScope, @discountPids)");
      }
    }

    // 2c. Migrate CustomerProfiles (if any exist in data)
    if (data.customerProfiles && data.customerProfiles.length > 0) {
      console.log(`[Migration] Migrating ${data.customerProfiles.length} customer profiles...`);
      for (const cp of data.customerProfiles) {
        await pool.request()
          .input('userId', sql.Int, cp.userId)
          .input('altPhone', sql.NVarChar, cp.alternatePhone || null)
          .input('pic', sql.NVarChar, cp.profilePicture || null)
          .input('addr', sql.NVarChar, cp.address || null)
          .input('city', sql.NVarChar, cp.city || null)
          .input('state', sql.NVarChar, cp.state || null)
          .input('country', sql.NVarChar, cp.country || 'India')
          .input('zip', sql.NVarChar, cp.postalCode || null)
          .query("INSERT INTO CustomerProfiles (UserId, AlternatePhone, ProfilePicture, Address, City, State, Country, PostalCode) VALUES (@userId, @altPhone, @pic, @addr, @city, @state, @country, @zip)");
      }
    }

    // 2d. Migrate AdminProfiles (if any exist in data)
    if (data.adminProfiles && data.adminProfiles.length > 0) {
      console.log(`[Migration] Migrating ${data.adminProfiles.length} admin profiles...`);
      for (const ap of data.adminProfiles) {
        await pool.request()
          .input('userId', sql.Int, ap.userId)
          .input('perms', sql.NVarChar, ap.permissions || '["all"]')
          .query("INSERT INTO AdminProfiles (UserId, Permissions) VALUES (@userId, @perms)");
      }
    }

    // 2e. Migrate StoreCustomers (if any exist in data)
    if (data.storeCustomers && data.storeCustomers.length > 0) {
      console.log(`[Migration] Migrating ${data.storeCustomers.length} store-customer mappings...`);
      for (const sc of data.storeCustomers) {
        await pool.request()
          .input('customerId', sql.Int, sc.customerId)
          .input('storeId', sql.Int, sc.storeId)
          .input('totalOrders', sql.Int, sc.totalOrders || 0)
          .input('totalSpent', sql.Decimal(10,2), sc.totalSpent || 0)
          .input('firstPurchase', sql.DateTime, sc.firstPurchaseAt || null)
          .input('lastPurchase', sql.DateTime, sc.lastPurchaseAt || null)
          .query("INSERT INTO StoreCustomers (CustomerId, StoreId, TotalOrders, TotalSpent, FirstPurchaseAt, LastPurchaseAt) VALUES (@customerId, @storeId, @totalOrders, @totalSpent, @firstPurchase, @lastPurchase)");
      }
    }

    // 3. Migrate Products
    console.log(`[Migration] Migrating ${data.products.length} products...`);
    await pool.request().query('SET IDENTITY_INSERT Products ON');
    for (const p of data.products) {
      const bullets = Array.isArray(p.bullets) ? p.bullets.join(';') : (p.bullets || null);
      const jsonPayload = p.dummyJsonId ? JSON.stringify(p) : null;
      await pool.request()
        .input('id', sql.Int, p.id)
        .input('catId', sql.Int, p.categoryId)
        .input('vendorId', sql.Int, p.vendorId || 1)
        .input('name', sql.NVarChar, p.name)
        .input('slug', sql.NVarChar, p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
        .input('desc', sql.NVarChar, p.description || '')
        .input('storage', sql.NVarChar, p.storageInstructions || 'Store in cool dry place')
        .input('bullets', sql.NVarChar, bullets)
        .input('imagePrompt', sql.NVarChar, p.imagePrompt || null)
        .input('imageUrl', sql.NVarChar, p.imageUrl || null)
        .input('status', sql.NVarChar, p.status || 'Active')
        .input('jsonData', sql.NVarChar, jsonPayload)
        .input('tenantId', sql.Int, p.tenantId || 1)
        .input('storeId', sql.Int, p.storeId || 1)
        .query(`
          INSERT INTO Products (ProductId, CategoryId, VendorId, Name, Slug, Description, StorageInstructions, Bullets, ImagePrompt, ImageUrl, Status, DummyJsonData, TenantId, StoreId)
          VALUES (@id, @catId, @vendorId, @name, @slug, @desc, @storage, @bullets, @imagePrompt, @imageUrl, @status, @jsonData, @tenantId, @storeId)
        `);
    }
    await pool.request().query('SET IDENTITY_INSERT Products OFF');

    // 4. Migrate ProductAttributes
    if (data.productAttributes && data.productAttributes.length > 0) {
      console.log(`[Migration] Migrating ${data.productAttributes.length} product attributes...`);
      await pool.request().query('SET IDENTITY_INSERT ProductAttributes ON');
      for (const a of data.productAttributes) {
        await pool.request()
          .input('id', sql.Int, a.id)
          .input('prodId', sql.Int, a.productId)
          .input('key', sql.NVarChar, a.key || a.AttributeKey)
          .input('val', sql.NVarChar, a.value || a.AttributeValue)
          .query('INSERT INTO ProductAttributes (AttributeId, ProductId, AttributeKey, AttributeValue) VALUES (@id, @prodId, @key, @val)');
      }
      await pool.request().query('SET IDENTITY_INSERT ProductAttributes OFF');
    }

    // 5. Migrate ProductVariants
    if (data.productVariants && data.productVariants.length > 0) {
      console.log(`[Migration] Migrating ${data.productVariants.length} product variants...`);
      await pool.request().query('SET IDENTITY_INSERT ProductVariants ON');
      for (const v of data.productVariants) {
        await pool.request()
          .input('id', sql.Int, v.id)
          .input('prodId', sql.Int, v.productId)
          .input('weight', sql.Int, v.weightGrams || 0)
          .input('price', sql.Decimal(10, 2), parseFloat(v.price) || 0)
          .input('stock', sql.Int, v.stock || 0)
          .input('sku', sql.NVarChar, v.sku || `FK-${v.productId}-${v.id}`)
          .input('expiry', sql.Date, v.expiryDate || null)
          .query('INSERT INTO ProductVariants (VariantId, ProductId, WeightGrams, Price, Stock, Sku, ExpiryDate) VALUES (@id, @prodId, @weight, @price, @stock, @sku, @expiry)');
      }
      await pool.request().query('SET IDENTITY_INSERT ProductVariants OFF');
    }

    // 6. Migrate Addresses
    if (data.addresses && data.addresses.length > 0) {
      console.log(`[Migration] Migrating ${data.addresses.length} addresses...`);
      await pool.request().query('SET IDENTITY_INSERT Addresses ON');
      for (const a of data.addresses) {
        await pool.request()
          .input('id', sql.Int, a.id)
          .input('userId', sql.Int, a.userId)
          .input('type', sql.NVarChar, a.addressType || 'Shipping')
          .input('line1', sql.NVarChar, a.line1 || '')
          .input('line2', sql.NVarChar, a.line2 || null)
          .input('city', sql.NVarChar, a.city || '')
          .input('state', sql.NVarChar, a.state || '')
          .input('zip', sql.NVarChar, a.postalCode || '')
          .input('country', sql.NVarChar, a.country || 'India')
          .query('INSERT INTO Addresses (AddressId, UserId, AddressType, Line1, Line2, City, State, PostalCode, Country) VALUES (@id, @userId, @type, @line1, @line2, @city, @state, @zip, @country)');
      }
      await pool.request().query('SET IDENTITY_INSERT Addresses OFF');
    }

    // 7. Migrate Orders
    if (data.orders && data.orders.length > 0) {
      console.log(`[Migration] Migrating ${data.orders.length} orders...`);
      await pool.request().query('SET IDENTITY_INSERT Orders ON');
      for (const o of data.orders) {
        await pool.request()
          .input('id', sql.Int, o.id)
          .input('userId', sql.Int, o.userId)
          .input('status', sql.NVarChar, o.orderStatus || 'Pending')
          .input('total', sql.Decimal(10, 2), parseFloat(o.totalAmount) || 0)
          .input('tax', sql.Decimal(10, 2), parseFloat(o.taxAmount) || 0)
          .input('shipping', sql.Decimal(10, 2), parseFloat(o.shippingAmount) || 0)
          .input('payStatus', sql.NVarChar, o.paymentStatus || 'Unpaid')
          .input('tenantId', sql.Int, o.tenantId || 1)
          .input('storeId', sql.Int, o.storeId || 1)
          .input('notes', sql.NVarChar, o.notes || null)
          .query('INSERT INTO Orders (OrderId, UserId, OrderStatus, TotalAmount, TaxAmount, ShippingAmount, PaymentStatus, TenantId, StoreId, Notes) VALUES (@id, @userId, @status, @total, @tax, @shipping, @payStatus, @tenantId, @storeId, @notes)');
      }
      await pool.request().query('SET IDENTITY_INSERT Orders OFF');
    }

    // 8. Migrate OrderItems
    if (data.orderItems && data.orderItems.length > 0) {
      console.log(`[Migration] Migrating ${data.orderItems.length} order items...`);
      await pool.request().query('SET IDENTITY_INSERT OrderItems ON');
      for (const oi of data.orderItems) {
        await pool.request()
          .input('id', sql.Int, oi.id)
          .input('orderId', sql.Int, oi.orderId)
          .input('variantId', sql.Int, oi.variantId)
          .input('qty', sql.Int, oi.quantity || 1)
          .input('price', sql.Decimal(10, 2), parseFloat(oi.unitPrice) || 0)
          .input('tax', sql.Decimal(10, 2), parseFloat(oi.taxAmount) || 0)
          .query('INSERT INTO OrderItems (OrderItemId, OrderId, VariantId, Quantity, UnitPrice, TaxAmount) VALUES (@id, @orderId, @variantId, @qty, @price, @tax)');
      }
      await pool.request().query('SET IDENTITY_INSERT OrderItems OFF');
    }

    // 9. Migrate Payments
    if (data.payments && data.payments.length > 0) {
      console.log(`[Migration] Migrating ${data.payments.length} payments...`);
      await pool.request().query('SET IDENTITY_INSERT Payments ON');
      for (const p of data.payments) {
        await pool.request()
          .input('id', sql.Int, p.id)
          .input('orderId', sql.Int, p.orderId)
          .input('gateway', sql.NVarChar, p.gatewayName || 'Razorpay')
          .input('txnId', sql.NVarChar, p.transactionId || '')
          .input('amount', sql.Decimal(10, 2), parseFloat(p.amount) || 0)
          .input('payStatus', sql.NVarChar, p.paymentStatus || 'Unpaid')
          .query('INSERT INTO Payments (PaymentId, OrderId, GatewayName, TransactionId, Amount, PaymentStatus) VALUES (@id, @orderId, @gateway, @txnId, @amount, @payStatus)');
      }
      await pool.request().query('SET IDENTITY_INSERT Payments OFF');
    }

    // 10. Migrate InventoryLogs
    if (data.inventoryLogs && data.inventoryLogs.length > 0) {
      console.log(`[Migration] Migrating ${data.inventoryLogs.length} inventory logs...`);
      await pool.request().query('SET IDENTITY_INSERT InventoryLogs ON');
      for (const l of data.inventoryLogs) {
        await pool.request()
          .input('id', sql.Int, l.id)
          .input('variantId', sql.Int, l.variantId)
          .input('change', sql.Int, l.changeQuantity || 0)
          .input('reason', sql.NVarChar, l.reason || '')
          .query('INSERT INTO InventoryLogs (LogId, VariantId, ChangeQuantity, Reason) VALUES (@id, @variantId, @change, @reason)');
      }
      await pool.request().query('SET IDENTITY_INSERT InventoryLogs OFF');
    }

    // 11. Migrate Wishlists
    if (data.wishlists && data.wishlists.length > 0) {
      console.log(`[Migration] Migrating ${data.wishlists.length} wishlist items...`);
      await pool.request().query('SET IDENTITY_INSERT Wishlists ON');
      for (const w of data.wishlists) {
        await pool.request()
          .input('id', sql.Int, w.id)
          .input('userId', sql.Int, w.userId)
          .input('prodId', sql.Int, w.productId)
          .query('INSERT INTO Wishlists (WishlistId, UserId, ProductId) VALUES (@id, @userId, @prodId)');
      }
      await pool.request().query('SET IDENTITY_INSERT Wishlists OFF');
    }

    // 12. Migrate Reviews
    if (data.reviews && data.reviews.length > 0) {
      console.log(`[Migration] Migrating ${data.reviews.length} reviews...`);
      await pool.request().query('SET IDENTITY_INSERT Reviews ON');
      for (const r of data.reviews) {
        await pool.request()
          .input('id', sql.Int, r.id)
          .input('userId', sql.Int, r.userId)
          .input('prodId', sql.Int, r.productId)
          .input('rating', sql.Int, r.rating || 5)
          .input('comment', sql.NVarChar, r.comment || null)
          .query('INSERT INTO Reviews (ReviewId, UserId, ProductId, Rating, Comment) VALUES (@id, @userId, @prodId, @rating, @comment)');
      }
      await pool.request().query('SET IDENTITY_INSERT Reviews OFF');
    }

    // 13. Migrate Coupons
    if (data.coupons && data.coupons.length > 0) {
      console.log(`[Migration] Migrating ${data.coupons.length} coupons...`);
      await pool.request().query('SET IDENTITY_INSERT Coupons ON');
      for (const c of data.coupons) {
        await pool.request()
          .input('id', sql.Int, c.id)
          .input('code', sql.NVarChar, c.code || '')
          .input('discType', sql.NVarChar, c.discountType || 'Percentage')
          .input('discVal', sql.Decimal(10, 2), parseFloat(c.discountValue) || 0)
          .input('expiry', sql.Date, c.expiryDate || null)
          .input('vendorId', sql.Int, c.vendorId || null)
          .input('active', sql.Bit, c.isActive !== undefined ? (c.isActive ? 1 : 0) : 1)
          .query('INSERT INTO Coupons (CouponId, Code, DiscountType, DiscountValue, ExpiryDate, VendorId, IsActive) VALUES (@id, @code, @discType, @discVal, @expiry, @vendorId, @active)');
      }
      await pool.request().query('SET IDENTITY_INSERT Coupons OFF');
    }

    // 14. Migrate Returns
    if (data.returns && data.returns.length > 0) {
      console.log(`[Migration] Migrating ${data.returns.length} returns...`);
      await pool.request().query('SET IDENTITY_INSERT Returns ON');
      for (const r of data.returns) {
        await pool.request()
          .input('id', sql.Int, r.id)
          .input('orderId', sql.Int, r.orderId)
          .input('reason', sql.NVarChar, r.reason || '')
          .input('status', sql.NVarChar, r.status || 'Pending')
          .query('INSERT INTO Returns (ReturnId, OrderId, Reason, Status) VALUES (@id, @orderId, @reason, @status)');
      }
      await pool.request().query('SET IDENTITY_INSERT Returns OFF');
    }

    // 15. Migrate Notifications
    if (data.notifications && data.notifications.length > 0) {
      console.log(`[Migration] Migrating ${data.notifications.length} notifications...`);
      await pool.request().query('SET IDENTITY_INSERT Notifications ON');
      for (const n of data.notifications) {
        await pool.request()
          .input('id', sql.Int, n.id)
          .input('userId', sql.Int, n.userId || null)
          .input('message', sql.NVarChar, n.message || '')
          .input('type', sql.NVarChar, n.type || 'info')
          .input('isRead', sql.Bit, n.isRead ? 1 : 0)
          .query('INSERT INTO Notifications (NotificationId, UserId, Message, Type, IsRead) VALUES (@id, @userId, @message, @type, @isRead)');
      }
      await pool.request().query('SET IDENTITY_INSERT Notifications OFF');
    }

    // 16. Migrate Discussions
    if (data.discussions && data.discussions.length > 0) {
      console.log(`[Migration] Migrating ${data.discussions.length} discussions...`);
      await pool.request().query('SET IDENTITY_INSERT Discussions ON');
      for (const d of data.discussions) {
        await pool.request()
          .input('id', sql.Int, d.id || d.MessageId)
          .input('prodId', sql.Int, d.productId || null)
          .input('sellerId', sql.Int, d.sellerId || null)
          .input('senderId', sql.Int, d.senderId || 1)
          .input('senderRole', sql.NVarChar, d.senderRole || 'Admin')
          .input('message', sql.NVarChar, d.message || '')
          .input('attachment', sql.NVarChar, d.attachmentUrl || null)
          .query('INSERT INTO Discussions (MessageId, ProductId, SellerId, SenderId, SenderRole, Message, AttachmentUrl) VALUES (@id, @prodId, @sellerId, @senderId, @senderRole, @message, @attachment)');
      }
      await pool.request().query('SET IDENTITY_INSERT Discussions OFF');
    }

    // Fix EmailVerified for users that had it set in localDb
    for (const u of data.users) {
      if (u.emailVerified) {
        await pool.request()
          .input('email', sql.NVarChar, u.email)
          .query("UPDATE Users SET EmailVerified = 1 WHERE Email = @email AND (EmailVerified IS NULL OR EmailVerified = 0)");
      }
    }
    useSqlServer = true;
    console.log('[Migration] Full data migration completed successfully! SQL Server is now the primary database.');
  } catch (err) {
    console.error('[Migration] Error during migration:', err.message);
    useSqlServer = false;
  }
}

async function syncLocalDbToSql() {
  const data = getLocalDb();
  if (!data || !data.stores || data.stores.length === 0) return;

  try {
    // Sync stores from localDb to SQL (insert missing)
    const existingStores = await pool.request().query('SELECT StoreId FROM Stores');
    const existingStoreIds = new Set(existingStores.recordset.map(r => r.StoreId));
    const missingStores = data.stores.filter(s => !existingStoreIds.has(s.id));
    if (missingStores.length > 0) {
      console.log(`[Sync] Inserting ${missingStores.length} missing stores into SQL...`);
      for (const st of missingStores) {
        await pool.request()
          .input('id', sql.Int, st.id)
          .input('tenantId', sql.Int, st.tenantId || 1)
          .input('ownerId', sql.Int, st.ownerId || 1)
          .input('name', sql.NVarChar, st.name)
          .input('slug', sql.NVarChar, st.slug)
          .input('isActive', sql.Bit, st.isActive !== undefined ? (st.isActive ? 1 : 0) : 1)
          .input('createdAt', sql.DateTime, st.createdAt || new Date())
          .query('SET IDENTITY_INSERT Stores ON; INSERT INTO Stores (StoreId, TenantId, OwnerId, Name, Slug, IsActive, CreatedAt) VALUES (@id, @tenantId, @ownerId, @name, @slug, @isActive, @createdAt); SET IDENTITY_INSERT Stores OFF');
      }
    }

    // Sync users from localDb to SQL (insert missing sellers)
    const rawUsers = data.users || [];
    const usersArr = Array.isArray(rawUsers) ? rawUsers : (rawUsers.value || []);
    if (usersArr.length > 0) {
      const existingUsers = await pool.request().query('SELECT UserId, Email FROM Users');
      const existingUserIds = new Set(existingUsers.recordset.map(r => r.UserId));
      const existingEmails = new Set(existingUsers.recordset.map(r => r.Email.toLowerCase()));
      const missingUsers = usersArr.filter(u => !existingUserIds.has(u.id) && !existingEmails.has((u.email || '').toLowerCase()));
      if (missingUsers.length > 0) {
        console.log(`[Sync] Inserting ${missingUsers.length} missing users into SQL...`);
        for (const u of missingUsers) {
          try {
            const role = u.role || 'Customer';
            await pool.request()
              .input('id', sql.Int, u.id)
              .input('email', sql.NVarChar, u.email || 'unknown@email.com')
              .input('hash', sql.NVarChar, u.passwordHash || '')
              .input('firstName', sql.NVarChar, u.firstName || '')
              .input('lastName', sql.NVarChar, u.lastName || '')
              .input('phone', sql.NVarChar, u.phone || '')
              .input('role', sql.NVarChar, role)
              .input('sellerStatus', sql.NVarChar, u.sellerStatus || (role === 'Seller' ? 'Pending' : 'Approved'))
              .input('storeName', sql.NVarChar, u.storeName || '')
              .input('storeDesc', sql.NVarChar, u.storeDescription || '')
              .query(`SET IDENTITY_INSERT Users ON; INSERT INTO Users (UserId, Email, PasswordHash, FirstName, LastName, Phone, Role, SellerStatus, StoreName, StoreDescription, EmailVerified) VALUES (@id, @email, @hash, @firstName, @lastName, @phone, @role, @sellerStatus, @storeName, @storeDesc, 1); SET IDENTITY_INSERT Users OFF`);
          } catch (insertErr) {
            console.error(`[Sync] Failed to insert user ${u.email}: ${insertErr.message}`);
          }
        }
      }
    }

    // Clean up orphaned subscriptions (storeId that no longer exists)
    await pool.request().query(`DELETE FROM StoreSubscriptions WHERE StoreId IS NOT NULL AND StoreId NOT IN (SELECT StoreId FROM Stores)`);
    await pool.request().query(`DELETE FROM StoreSubscriptions WHERE StoreId IS NULL`);

    // Sync subscriptions from localDb to SQL
    if (data.storeSubscriptions && data.storeSubscriptions.length > 0) {
      for (const sub of data.storeSubscriptions) {
        const existing = await pool.request()
          .input('storeId', sql.Int, sub.storeId)
          .query('SELECT SubscriptionId FROM StoreSubscriptions WHERE StoreId = @storeId');
        if (existing.recordset.length === 0) {
          // Check if the referenced plan still exists
          const planCheck = await pool.request()
            .input('planKey', sql.NVarChar, sub.planKey)
            .query('SELECT PlanId FROM SubscriptionPlans WHERE PlanKey = @planKey');
          const planKey = planCheck.recordset.length > 0 ? sub.planKey : null;
          await pool.request()
            .input('storeId', sql.Int, sub.storeId)
            .input('tenantId', sql.Int, sub.tenantId || 1)
            .input('planKey', sql.NVarChar, planKey)
            .input('status', sql.NVarChar, sub.status || 'trial')
            .input('trialStart', sql.DateTime, sub.trialStart || null)
            .input('trialEnd', sql.DateTime, sub.trialEnd || null)
            .input('periodStart', sql.DateTime, sub.currentPeriodStart || new Date())
            .input('periodEnd', sql.DateTime, sub.currentPeriodEnd || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
            .query('INSERT INTO StoreSubscriptions (StoreId, TenantId, PlanKey, Status, TrialStart, TrialEnd, CurrentPeriodStart, CurrentPeriodEnd) VALUES (@storeId, @tenantId, @planKey, @status, @trialStart, @trialEnd, @periodStart, @periodEnd)');
        }
      }
    }

    // Create starter trial for approved seller stores that still have no subscription
    const storesWithoutSub = await pool.request().query(
      `SELECT st.StoreId, st.OwnerId, st.TenantId, st.CreatedAt
       FROM Stores st
       LEFT JOIN StoreSubscriptions ss ON st.StoreId = ss.StoreId
       INNER JOIN Users u ON st.OwnerId = u.UserId
       WHERE ss.SubscriptionId IS NULL AND st.IsActive = 1 AND st.StoreId != 1 AND u.SellerStatus = 'Approved'`
    );
    for (const st of storesWithoutSub.recordset) {
      const created = new Date(st.CreatedAt);
      const startOfDay = new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate()));
      const now = new Date();
      const trialStart = startOfDay.toISOString();
      const trialEnd = new Date(startOfDay.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await pool.request()
        .input('storeId', sql.Int, st.StoreId)
        .input('tenantId', sql.Int, st.TenantId || 1)
        .input('planKey', sql.NVarChar, 'starter')
        .input('status', sql.NVarChar, 'trial')
        .input('trialStart', sql.DateTime, trialStart)
        .input('trialEnd', sql.DateTime, trialEnd)
        .input('periodStart', sql.DateTime, trialStart)
        .input('periodEnd', sql.DateTime, trialEnd)
        .query('INSERT INTO StoreSubscriptions (StoreId, TenantId, PlanKey, Status, TrialStart, TrialEnd, CurrentPeriodStart, CurrentPeriodEnd) VALUES (@storeId, @tenantId, @planKey, @status, @trialStart, @trialEnd, @periodStart, @periodEnd)');
      console.log(`[Sync] Created starter trial for Store #${st.StoreId}`);
    }
  } catch (err) {
    console.error('[Sync] Error syncing localDb to SQL:', err.message);
  }
}

function getPool() {
  return pool;
}

function getUseSqlServer() {
  return useSqlServer;
}

function setUseSqlServer(val) {
  useSqlServer = val;
}

function getLocalDb() {
  return localDb;
}

module.exports = {
  sql,
  initDatabase,
  getPool,
  getUseSqlServer,
  setUseSqlServer,
  getLocalDb,
  saveLocalDb
};
