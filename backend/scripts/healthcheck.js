const http = require('http');
const HOST = process.env.HEALTH_CHECK_HOST || 'localhost';
const PORT = process.env.PORT || 5000;
const TIMEOUT = parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000;

const req = http.get(`http://${HOST}:${PORT}/api/health`, { timeout: TIMEOUT }, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const data = JSON.parse(body);
        if (data.status === 'healthy') {
          console.log('Health check passed:', data.status);
          process.exit(0);
        } else {
          console.error('Health check failed: status =', data.status);
          process.exit(1);
        }
      } catch {
        console.error('Health check: invalid JSON response');
        process.exit(1);
      }
    } else {
      console.error(`Health check: HTTP ${res.statusCode}`);
      process.exit(1);
    }
  });
});
req.on('error', (err) => { console.error('Health check failed:', err.message); process.exit(1); });
req.on('timeout', () => { req.destroy(); console.error('Health check timed out'); process.exit(1); });
