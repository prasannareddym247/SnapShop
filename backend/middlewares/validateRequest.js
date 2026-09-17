const { ValidationError } = require('../utils/AppError');

function validateRequest(schema) {
  return (req, _res, next) => {
    const errors = [];
    if (schema.body && req.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push({ field, message: `${field} is required` });
          continue;
        }
        if (value !== undefined && value !== null) {
          if (rules.type === 'string' && typeof value !== 'string') errors.push({ field, message: `${field} must be a string` });
          if (rules.type === 'number' && (typeof value !== 'number' || isNaN(value))) errors.push({ field, message: `${field} must be a number` });
          if (rules.type === 'boolean' && typeof value !== 'boolean') errors.push({ field, message: `${field} must be a boolean` });
          if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push({ field, message: `${field} must be a valid email` });
          if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
          if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
          if (rules.min !== undefined && typeof value === 'number' && value < rules.min) errors.push({ field, message: `${field} must be at least ${rules.min}` });
          if (rules.max !== undefined && typeof value === 'number' && value > rules.max) errors.push({ field, message: `${field} must be at most ${rules.max}` });
          if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) errors.push({ field, message: `${field} format is invalid` });
          if (rules.enum && !rules.enum.includes(value)) errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
        }
      }
    }
    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }
    next();
  };
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

function sanitizeInput(req, _res, next) {
  if (req.body) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        let val = req.body[key].trim();
        if (val.startsWith('http://') || val.startsWith('https://')) {
          req.body[key] = val;
          continue;
        }
        val = decodeHtmlEntities(val);
        req.body[key] = val.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' }[c] || c));
      }
    }
  }
  next();
}

module.exports = { validateRequest, sanitizeInput };
