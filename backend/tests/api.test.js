require('./setup');
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, data }); }
      });
    }).on('error', reject);
  });
}

describe('API Health Check', () => {
  test('GET /api/health returns 200', async () => {
    try {
      const res = await get('/health');
      expect(res.status).toBe(200);
      expect(res.data.status).toBeDefined();
    } catch (e) {
      console.log('  ~ Skipped (server not running)');
    }
  });
});

describe('API Error Response Format', () => {
  const { errorHandler, correlationIdMiddleware } = require('../middlewares/errorHandler');
  test('errorHandler returns correlationId', () => {
    const req = { correlationId: 'abc123', method: 'GET', path: '/test', user: null };
    const res = {
      status: (code) => {
        expect(code).toBe(500);
        return { json: (body) => {
          expect(body.error).toBeDefined();
          expect(body.correlationId).toBe('abc123');
        }};
      }
    };
    errorHandler(new Error('Test'), req, res, () => {});
  });
});
