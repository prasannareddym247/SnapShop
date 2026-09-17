const logger = require('../logger');
const { AppError } = require('../utils/AppError');
const crypto = require('crypto');

function generateCorrelationId() {
  return crypto.randomBytes(8).toString('hex');
}

function errorHandler(err, req, res, _next) {
  const correlationId = req.correlationId || generateCorrelationId();
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  const logMeta = {
    correlationId,
    method: req.method,
    path: req.path,
    statusCode,
    code,
    userId: req.user?.id || req.user?.userId || null,
    userEmail: req.user?.email || null
  };

  if (statusCode >= 500) {
    logger.error(`${err.message}`, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(`${err.message}`, logMeta);
  }

  const response = {
    error: err.isOperational ? err.message : 'Internal server error',
    code,
    correlationId
  };
  if (err.details) response.details = err.details;
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) response.stack = err.stack;

  res.status(statusCode).json(response);
}

function correlationIdMiddleware(req, _res, next) {
  req.correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  next();
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
    correlationId: req.correlationId
  });
}

module.exports = { errorHandler, correlationIdMiddleware, notFoundHandler };
