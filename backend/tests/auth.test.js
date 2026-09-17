require('./setup');
const authService = require('../services/authService');

describe('Auth Service', () => {
  test('hashPassword returns a string', async () => {
    const hash = await authService.hashPassword('test123');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(20);
  });

  test('comparePassword returns true for correct password', async () => {
    const hash = await authService.hashPassword('test123');
    const match = await authService.comparePassword('test123', hash);
    expect(match).toBe(true);
  });

  test('comparePassword returns false for wrong password', async () => {
    const hash = await authService.hashPassword('test123');
    const match = await authService.comparePassword('wrong', hash);
    expect(match).toBe(false);
  });

  test('generateToken and verifyToken work', () => {
    const user = { id: 1, email: 'test@test.com', role: 'Admin' };
    const token = authService.generateToken(user);
    expect(typeof token).toBe('string');
    const decoded = authService.verifyToken(token);
    expect(decoded.email).toBe('test@test.com');
    expect(decoded.role).toBe('Admin');
  });

  test('verifyToken throws on invalid token', () => {
    expect(() => authService.verifyToken('invalid-token')).toThrow();
  });
});
