const isProduction = process.env.NODE_ENV === 'production';

const middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
          }
        : false,
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) || ['*'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  },
  ...(isProduction ? [] : ['strapi::poweredBy']),
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '10mb',
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: {
        maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10),
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::rate-limit',
  'global::log-teacher-save',
];

if (process.env.DEBUG_PARENT_API === 'true') {
  middlewares.push('global::debug-parent-api');
}

module.exports = middlewares;
