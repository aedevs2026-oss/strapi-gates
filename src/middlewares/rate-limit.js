'use strict';

const rateLimitStore = new Map();

const PARENT_API_PREFIXES = [
  '/api/auth',
  '/api/parent',
  '/api/payment',
  '/api/push-notification',
  '/api/whatsapp-notification',
];

const getClientIp = (ctx) => {
  return (
    ctx.request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    ctx.request.ip ||
    'unknown'
  );
};

const shouldRateLimit = (path) => {
  if (process.env.RATE_LIMIT_ENABLED === 'false') {
    return false;
  }

  return PARENT_API_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const isRateLimited = (key, windowMs, maxRequests) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.start > windowMs) {
    rateLimitStore.set(key, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (!shouldRateLimit(ctx.request.path)) {
      return next();
    }

    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
    const ip = getClientIp(ctx);
    const key = `global:${ip}`;

    if (isRateLimited(key, windowMs, maxRequests)) {
      return ctx.tooManyRequests('Too many requests. Please try again later.');
    }

    await next();
  };
};

module.exports.isRateLimited = isRateLimited;
module.exports.getClientIp = getClientIp;
module.exports.shouldRateLimit = shouldRateLimit;
