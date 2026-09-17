const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'Access token required.' });

  try {
    const user = authService.verifyToken(token);
    req.user = user;
    console.log(`[JWT] ${user.role} "${user.email}" — token verified ✓`);
    
    // Validate tenant context for non-admin users
    if (user.role !== 'Admin') {
      const userTenantId = parseInt(user.tenantId);
      const userStoreId = parseInt(user.storeId);
      const explicitTenant = req.headers['x-tenant-id'] || req.query.tenantId;
      if (explicitTenant) {
        const reqTenantId = parseInt(explicitTenant);
        if (userTenantId && reqTenantId !== userTenantId) {
          return res.status(403).json({ error: 'Security alert: Access denied. Tenant context mismatch.' });
        }
      } else {
        if (userTenantId) req.tenantId = userTenantId;
        if (userStoreId) req.storeId = userStoreId;
      }
    }
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function checkAdmin(req, res, next) {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
}

async function checkSeller(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  try {
    const user = await userRepository.getUserByEmail(req.user.email);
    if (user && user.role === 'Seller') {
      if (user.sellerStatus === 'Approved') {
        next();
      } else {
        res.status(403).json({ error: 'Access denied. Seller account is pending approval.' });
      }
    } else {
      res.status(403).json({ error: 'Access denied. Retailer/Seller privileges required.' });
    }
  } catch (err) {
    console.error('checkSeller middleware error:', err);
    res.status(500).json({ error: 'Server error validating permissions.' });
  }
}

module.exports = {
  authenticateToken,
  checkAdmin,
  checkSeller
};
