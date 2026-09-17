require('./setup');
const { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError, AppError } = require('../utils/AppError');

describe('Tenant Isolation - Error Classes', () => {
  test('AppError has correct structure', () => {
    const err = new AppError('Test error', 400, 'TEST');
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('TEST');
    expect(err.isOperational).toBe(true);
  });

  test('BadRequestError defaults to 400', () => {
    const err = new BadRequestError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
  });

  test('ForbiddenError defaults to 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  test('NotFoundError defaults to 404', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  test('ValidationError includes details', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = new ValidationError('Validation failed', details);
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual(details);
  });
});

describe('Pagination', () => {
  const { paginate, paginatedResponse } = require('../utils/pagination');

  test('paginate returns correct offset', () => {
    const req = { query: { page: '2', limit: '10' } };
    const result = paginate(req);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(10);
  });

  test('paginatedResponse calculates totalPages correctly', () => {
    const result = paginatedResponse([], 50, 1, 20);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrev).toBe(false);
  });
});
