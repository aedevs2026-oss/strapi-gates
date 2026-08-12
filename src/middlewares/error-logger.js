'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await next();

      if (ctx.status >= 500 && ctx.body?.error) {
        strapi.log.error(
          `[error-logger] ${ctx.method} ${ctx.request.path} returned ${ctx.status}: ${
            ctx.body.error.message || JSON.stringify(ctx.body.error)
          }`
        );

        if (ctx.body.error.stack) {
          strapi.log.error(ctx.body.error.stack);
        }
      }
    } catch (error) {
      strapi.log.error(
        `[error-logger] uncaught exception on ${ctx.method} ${ctx.request.path}: ${error.message}`
      );
      if (error.stack) {
        strapi.log.error(error.stack);
      }
      throw error;
    }
  };
};
