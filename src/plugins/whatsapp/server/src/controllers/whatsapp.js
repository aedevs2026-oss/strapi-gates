'use strict';

module.exports = ({ strapi }) => ({
  async getStatus(ctx) {
    ctx.body = strapi.plugin('whatsapp').service('client').getStatus();
  },

  async connect(ctx) {
    const result = await strapi.plugin('whatsapp').service('client').initialize();
    ctx.body = result;
  },

  async disconnect(ctx) {
    const result = await strapi.plugin('whatsapp').service('client').disconnect();
    ctx.body = result;
  },

  async getStats(ctx) {
    const { stats } = strapi.plugin('whatsapp').service('client').getStatus();
    ctx.body = stats;
  },

  async getLogs(ctx) {
    const { logs } = strapi.plugin('whatsapp').service('client').getStatus();
    ctx.body = logs;
  },
});
