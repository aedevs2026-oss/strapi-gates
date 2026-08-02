'use strict';

const path = require('path');
const os = require('os');

function isRenderLike() {
  return Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.CI);
}

function getPuppeteerCacheDir() {
  if (process.env.PUPPETEER_CACHE_DIR) {
    return process.env.PUPPETEER_CACHE_DIR;
  }

  if (process.platform === 'linux' && isRenderLike()) {
    return path.join(process.cwd(), '.cache', 'puppeteer');
  }

  return path.join(os.homedir(), '.cache', 'puppeteer');
}

function configurePuppeteerEnv() {
  if (!process.env.PUPPETEER_CACHE_DIR) {
    process.env.PUPPETEER_CACHE_DIR = getPuppeteerCacheDir();
  }

  return process.env.PUPPETEER_CACHE_DIR;
}

module.exports = {
  configurePuppeteerEnv,
  getPuppeteerCacheDir,
  isRenderLike,
};
