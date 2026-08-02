'use strict';

const path = require('path');
const { resolveChromeExecutable } = require(
  path.join(process.cwd(), 'config', 'puppeteer-chrome')
);

module.exports = ({ strapi }) => {
  const chromePath = resolveChromeExecutable();
  if (chromePath) {
    strapi.log.info(`[WhatsApp] Chrome found at ${chromePath}`);
  } else {
    strapi.log.warn(
      '[WhatsApp] Chrome not found yet — it will be installed on first Connect (Render/Linux).'
    );
  }

  strapi.log.info('[WhatsApp] plugin loaded — connect via Admin → WhatsApp');
};
