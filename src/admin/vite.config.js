const { mergeConfig } = require('vite');

/**
 * Strapi generates `.strapi/client/index.html` with Windows backslashes in the
 * entry script path (e.g. `/.strapi\client\app.js`), which breaks ES module
 * loading and leaves the admin panel as a blank white screen.
 */
module.exports = (config) => {
  return mergeConfig(config, {
    plugins: [
      {
        name: 'strapi-fix-windows-admin-paths',
        transformIndexHtml(html) {
          return html.replace(/src="([^"]+)"/g, (match, src) => {
            const normalized = src.replace(/\\/g, '/');
            return normalized === src ? match : `src="${normalized}"`;
          });
        },
      },
    ],
  });
};
