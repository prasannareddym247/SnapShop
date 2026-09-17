const logger = require('./logger');
const db = require('./config/db');

const metrics = {
  requestCount: 0,
  errorCount: 0,
  totalLatency: 0,
  latencies: [],
  startTime: Date.now()
};

function requestMetrics(req, _res, next) {
  const start = Date.now();
  metrics.requestCount++;
  _res.on('finish', () => {
    const latency = Date.now() - start;
    metrics.totalLatency += latency;
    metrics.latencies.push(latency);
    if (metrics.latencies.length > 1000) metrics.latencies.shift();
    if (_res.statusCode >= 400) metrics.errorCount++;
  });
  next();
}

function getMetrics() {
  const avgLatency = metrics.requestCount > 0 ? (metrics.totalLatency / metrics.requestCount).toFixed(2) : 0;
  const recentLatencies = metrics.latencies.slice(-100);
  const p95 = recentLatencies.length > 0 ? recentLatencies.sort((a, b) => a - b)[Math.floor(recentLatencies.length * 0.95)] : 0;
  const p99 = recentLatencies.length > 0 ? recentLatencies.sort((a, b) => a - b)[Math.floor(recentLatencies.length * 0.99)] : 0;
  return {
    uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
    requestCount: metrics.requestCount,
    errorCount: metrics.errorCount,
    errorRate: metrics.requestCount > 0 ? (metrics.errorCount / metrics.requestCount * 100).toFixed(2) + '%' : '0%',
    averageLatencyMs: parseFloat(avgLatency),
    p95LatencyMs: p95,
    p99LatencyMs: p99,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  };
}

function getDatabaseMetrics() {
  const isSql = db.getUseSqlServer();
  const localDb = db.getLocalDb();
  return {
    driver: isSql ? 'sqlserver' : 'json',
    collections: isSql ? {} : Object.fromEntries(
      Object.entries(localDb).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length])
    ),
    timestamp: new Date().toISOString()
  };
}

const healthCheck = async () => {
  const checks = {
    database: { status: 'ok' },
    memory: { status: 'ok' }
  };
  try {
    if (db.getUseSqlServer()) {
      await db.getPool().request().query('SELECT 1');
    }
  } catch (err) {
    checks.database = { status: 'error', message: err.message };
  }
  const mem = process.memoryUsage();
  const heapRatio = mem.heapUsed / mem.heapTotal;
  if (heapRatio > 0.95 || mem.heapUsed > 500 * 1024 * 1024) {
    checks.memory = { status: 'warning', message: `Heap usage at ${(heapRatio * 100).toFixed(1)}% (${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB)` };
  }
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  return {
    status: allOk ? 'healthy' : 'degraded',
    checks,
    metrics: getMetrics(),
    timestamp: new Date().toISOString()
  };
};

module.exports = { requestMetrics, getMetrics, getDatabaseMetrics, healthCheck };
