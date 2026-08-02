'use strict';

const { debugLog } = require('../utils/debug-log');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (!ctx.request.path.startsWith('/api/parent')) {
      return next();
    }

    const hasAuth = Boolean(ctx.request.headers.authorization?.startsWith('Bearer '));
    debugLog(
      'debug-parent-api.js:entry',
      'parent API request',
      { path: ctx.request.path, method: ctx.request.method, hasAuth },
      'H2'
    );

    try {
      await next();
      debugLog(
        'debug-parent-api.js:exit',
        'parent API response',
        { path: ctx.request.path, status: ctx.status, bodyError: ctx.body?.error?.message || null },
        ctx.status >= 500 ? 'H1,H3,H4,H5' : 'H2'
      );
    } catch (error) {
      debugLog(
        'debug-parent-api.js:catch',
        'parent API uncaught error',
        {
          path: ctx.request.path,
          errorName: error.name,
          errorMessage: error.message,
          stack: error.stack?.slice(0, 600) || null,
        },
        'H1,H3,H4,H5'
      );
      throw error;
    }
  };
};
