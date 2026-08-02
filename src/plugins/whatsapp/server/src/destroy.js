'use strict';

module.exports = async ({ strapi }) => {
  try {
    await strapi.plugin('whatsapp').service('client').disconnect();
  } catch (err) {
    strapi.log.warn('[WhatsApp] disconnect on shutdown failed:', err.message);
  }
};
