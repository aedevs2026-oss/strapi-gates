'use strict';

const path = require('path');
const { configurePuppeteerEnv, getPuppeteerCacheDir } = require(
  path.join(process.cwd(), 'config', 'puppeteer-env')
);
const { resolveChromeExecutable } = require(
  path.join(process.cwd(), 'config', 'puppeteer-chrome')
);

module.exports = ({ strapi }) => {
  configurePuppeteerEnv();
  const cacheDir = getPuppeteerCacheDir();
  const chromePath = resolveChromeExecutable();

  strapi.log.info(`[WhatsApp] Puppeteer cache: ${cacheDir}`);

  if (chromePath) {
    strapi.log.info(`[WhatsApp] Chrome found at ${chromePath}`);
  } else {
    strapi.log.warn(
      '[WhatsApp] Chrome not found at startup — Connect will try to install it (requires build:render on Render).'
    );
  }

  strapi.log.info('[WhatsApp] plugin loaded — connect via Admin → WhatsApp');
};
