const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('\n======================================================');
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
    console.error('Please configure JWT_SECRET in your backend/.env file.');
    console.error('======================================================\n');
    process.exit(1);
  } else {
    JWT_SECRET = 'freshkart-dev-secret-key-replace-in-production';
    console.warn('[AUTH] Warning: JWT_SECRET not set in .env. Using default key for local development.');
  }
}

const authService = {
  JWT_SECRET,

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id || user.UserId, 
        email: user.email || user.Email, 
        role: user.role || user.Role,
        tenantId: user.tenantId || user.TenantId || null,
        storeId: user.storeId || user.StoreId || null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
};

module.exports = authService;
