'use strict';

const bootstrap = require('./bootstrap');
const destroy = require('./destroy');
const routes = require('./routes');
const controllers = require('./controllers');
const services = require('./services');

module.exports = {
  bootstrap,
  destroy,
  routes,
  controllers,
  services,
};
