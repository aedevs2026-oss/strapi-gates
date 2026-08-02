'use strict';

const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  pdf: ['application/pdf'],
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.request.files) {
      const files = Object.values(ctx.request.files).flat();
      for (const file of files) {
        const mime = file.mimetype || file.type;
        const allowed = [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.pdf];
        if (mime && !allowed.includes(mime)) {
          return ctx.badRequest('File type not allowed. Only images and PDF files are permitted.');
        }
      }
    }
    await next();
  };
};
