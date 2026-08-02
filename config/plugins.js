module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: env.int('UPLOAD_MAX_FILE_SIZE', 10 * 1024 * 1024),
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
      },
    },
  },
  whatsapp: {
    enabled: true,
    resolve: './src/plugins/whatsapp',
    config: {
      authDataPath: env('WHATSAPP_AUTH_PATH', '.wwebjs_auth'),
    },
  },
});
