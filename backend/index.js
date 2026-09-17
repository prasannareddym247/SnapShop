const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { initDatabase } = require('./config/db');
const emailService = require('./services/emailService');
const { resolveTenant } = require('./middlewares/tenantMiddleware');
const { errorHandler, correlationIdMiddleware, notFoundHandler } = require('./middlewares/errorHandler');
const { sanitizeInput } = require('./middlewares/validateRequest');
const { requestMetrics, healthCheck } = require('./monitoring');
const logger = require('./logger');
const { runMigrations } = require('./db/migrate');

// ── Global error handlers to prevent crashes ──
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { error: reason?.message || reason, stack: reason?.stack });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const storeRoutes = require('./routes/storeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeIntegrationRoutes = require('./routes/storeIntegrationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const themeRoutes = require('./routes/themeRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminSubscriptionRoutes = require('./routes/adminSubscriptionRoutes');
const adminPlatformRoutes = require('./routes/adminPlatformRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ── Correlation ID (must be first) ──
app.use(correlationIdMiddleware);

// ── Request logging & metrics ──
app.use(requestMetrics);
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { correlationId: req.correlationId, query: JSON.stringify(req.query), ip: req.ip });
  next();
});

// ── Security: Helmet ──
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true
}));

// ── CORS ──
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : (isDev ? ['http://localhost:5173', 'http://localhost:5000'] : []);
app.use(cors({
  origin: isDev ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Store-ID', 'X-Tenant-ID', 'X-Correlation-ID'],
  credentials: true
}));

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Input sanitization ──
app.use('/api/', sanitizeInput);

// ── Tenant resolution ──
app.use(resolveTenant);

// ── Global API rate limiter ──
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.GLOBAL_RATE_LIMIT) || 200,
  message: { error: 'Too many requests. Please slow down.' }
});
app.use('/api/', globalLimiter);

// ── Auth endpoint rate limiting ──
const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: isDev ? 200 : 20, 
  message: { error: 'Too many login attempts.' } 
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { error: 'Too many OTP requests.' } });
app.use('/api/auth/send-verification-otp', otpLimiter);
app.use('/api/auth/forgot-password', otpLimiter);

// ── Static files with caching ──
app.use(express.static(path.join(__dirname, '../frontend/dist'), { maxAge: isDev ? 0 : '7d', etag: true }));
app.use('/assets', express.static(path.join(__dirname, '../frontend/public/assets'), { maxAge: '30d', etag: true }));

// ── Public maintenance mode check ──
const platformSettingsService = require('./services/platformSettingsService');
app.get('/api/maintenance-status', async (_req, res) => {
  try {
    const settings = await platformSettingsService.get('maintenanceMode');
    res.json({ maintenanceMode: settings?.value === 'true' });
  } catch (err) {
    res.json({ maintenanceMode: false });
  }
});

// ── Health check endpoint ──
app.get('/api/health', async (_req, res) => {
  try {
    const health = await healthCheck();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (err) {
    logger.error('Health check failed', { error: err.message });
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/store', storeIntegrationRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin/subscription', adminSubscriptionRoutes);
app.use('/api/admin', adminPlatformRoutes);

// ── Swagger ──
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const swaggerDocPath = path.join(__dirname, './.docs/swagger.json');
if (fs.existsSync(swaggerDocPath)) {
  try {
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocPath, 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    logger.warn('Failed to load swagger.json', { error: err.message });
  }
}

// ── Views ──
app.get('/views', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'index.html')); });

// ── SPA fallback ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ── Error handling (must be last) ──
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ──
async function startServer() {
  try {
    await initDatabase();
  } catch (dbErr) {
    logger.error('Database initialization failed, server cannot start', { error: dbErr.message });
    process.exit(1);
  }
  try {
    await runMigrations();
  } catch (migrateErr) {
    logger.warn('Migrations skipped or failed', { error: migrateErr.message });
  }
  try {
    await emailService.init();
  } catch (emailErr) {
    logger.warn('Email service init failed', { error: emailErr.message });
  }
  const server = app.listen(PORT);
  server.on('listening', () => {
    logger.info(`SnapShop Server listening on port ${PORT}`, { env: process.env.NODE_ENV || 'development' });
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Another instance may be running. Close it or use a different port.`, { error: err.message });
      process.exit(1);
    } else {
      logger.error('Server error', { error: err.message, stack: err.stack });
      process.exit(1);
    }
  });
}

startServer().catch(err => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});
