const db = require('../config/db');

async function resolveTenant(req, res, next) {
  let tenantId = null;
  let storeId = null;

  // 1. Resolve from authenticated user token
  if (req.user) {
    if (req.user.tenantId) {
      tenantId = req.user.tenantId;
    }
    if (req.user.storeId) {
      storeId = req.user.storeId;
    }
  }

  // 2. Resolve from headers (for guest requests to a tenant storefront)
  const headerTenantId = req.headers['x-tenant-id'];
  const headerStoreId = req.headers['x-store-id'];
  
  if (headerTenantId) {
    tenantId = parseInt(headerTenantId);
  }
  if (headerStoreId) {
    storeId = parseInt(headerStoreId);
  }

  // 3. Resolve from query parameters
  if (req.query.tenantId) {
    tenantId = parseInt(req.query.tenantId);
  }
  if (req.query.storeId) {
    storeId = parseInt(req.query.storeId);
  }

  // 4. Default fallback: use TenantId = 1 and StoreId = 1
  if (!tenantId) {
    tenantId = 1;
  }
  if (!storeId) {
    storeId = 1;
  }

  req.tenantId = parseInt(tenantId);
  req.storeId = parseInt(storeId);
  next();
}

function validateTenant(req, res, next) {
  // Store Owners (Seller role) and Customers can only access their own Tenant's data.
  // Administrator has global access.
  if (req.user && req.user.role !== 'Admin') {
    const userTenantId = parseInt(req.user.tenantId);
    const explicitTenant = req.headers['x-tenant-id'] || req.query.tenantId;
    if (explicitTenant) {
      const reqTenantId = parseInt(explicitTenant);
      if (userTenantId && reqTenantId !== userTenantId) {
        return res.status(403).json({ error: 'Security alert: Access denied. Tenant context mismatch.' });
      }
    } else {
      if (userTenantId) {
        req.tenantId = userTenantId;
        if (req.user.storeId) {
          req.storeId = parseInt(req.user.storeId);
        }
      }
    }
  }
  next();
}

module.exports = {
  resolveTenant,
  validateTenant
};
