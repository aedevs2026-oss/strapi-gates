'use strict';

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(process.cwd(), '..', 'debug-12d67a.log');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    if (
      ctx.status === 400 &&
      ctx.request.path.includes('/content-manager/collection-types/api::teacher.teacher')
    ) {
      try {
        fs.appendFileSync(
          LOG_PATH,
          `${JSON.stringify({
            sessionId: '12d67a',
            timestamp: Date.now(),
            location: 'log-teacher-save.js',
            message: 'teacher content-manager 400',
            data: {
              method: ctx.request.method,
              path: ctx.request.path,
              body: ctx.body,
            },
            hypothesisId: 'H1,H2,H3',
          })}\n`
        );
      } catch {
        // ignore
      }
    }
  };
};
