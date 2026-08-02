'use strict';

const bootstrap = require('./bootstrap');
const destroy = require('./destroy');
const routes = require('./routes');
const controllers = require('./controllers');
const path = require('path');

require(path.join(process.cwd(), 'config', 'puppeteer-env')).configurePuppeteerEnv();

const services = require('./services');

module.exports = {
  bootstrap,
  destroy,
  routes,
  controllers,
  services,
};
