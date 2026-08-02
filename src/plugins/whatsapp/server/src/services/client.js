'use strict';

const path = require('path');
const { getWhatsAppService } = require('./whatsapp-client');

module.exports = ({ strapi }) => {
  const getInstance = () => {
    const dataPath =
      strapi.config.get('plugin::whatsapp.authDataPath') ||
      path.join(process.cwd(), '.wwebjs_auth');
    return getWhatsAppService(dataPath);
  };

  return {
    getInstance,

    getStatus() {
      const service = getInstance();
      return {
        status: service.getStatus(),
        qrCode: service.getQrCode(),
        error: service.getLastError(),
        stats: service.getStats(),
        logs: service.getLogs(),
      };
    },

    initialize() {
      return getInstance().initialize();
    },

    disconnect() {
      return getInstance().disconnect();
    },

    sendMessage(recipient, content) {
      return getInstance().sendMessage(recipient, content);
    },

    sendBulkMessages(recipients, content) {
      return getInstance().sendBulkMessages(recipients, content);
    },
  };
};
