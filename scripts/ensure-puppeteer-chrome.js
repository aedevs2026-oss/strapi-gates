'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { configurePuppeteerEnv, getPuppeteerCacheDir } = require('../config/puppeteer-env');
const {
  findInstalledChrome,
  pathExists,
  resolveChromeExecutable,
  writeChromePathRecord,
} = require('../config/puppeteer-chrome');

configurePuppeteerEnv();

const {
  Browser,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} = require('@puppeteer/browsers');
const { PUPPETEER_REVISIONS } = require('puppeteer-core/internal/revisions.js');

function removeCorruptedCache(cacheRoot) {
  const chromeCacheDir = path.join(cacheRoot, 'chrome');
  if (!fs.existsSync(chromeCacheDir)) {
    return;
  }

  for (const entry of fs.readdirSync(chromeCacheDir)) {
    const versionDir = path.join(chromeCacheDir, entry);
    if (!fs.statSync(versionDir).isDirectory()) {
      continue;
    }

    const bundledCandidates = [
      path.join(versionDir, 'chrome-linux64', 'chrome'),
      path.join(versionDir, 'chrome-win64', 'chrome.exe'),
      path.join(versionDir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
    ];

    if (!bundledCandidates.some(pathExists)) {
      console.log(`[puppeteer] Removing incomplete cache: ${versionDir}`);
      fs.rmSync(versionDir, { recursive: true, force: true });
    }
  }
}

function clearChromeCache(cacheRoot) {
  const chromeCacheDir = path.join(cacheRoot, 'chrome');
  if (fs.existsSync(chromeCacheDir)) {
    console.log(`[puppeteer] Clearing Chrome cache: ${chromeCacheDir}`);
    fs.rmSync(chromeCacheDir, { recursive: true, force: true });
  }
}

async function installChrome() {
  const cacheDir = getPuppeteerCacheDir();
  const platform = detectBrowserPlatform();

  if (!platform) {
    throw new Error(`Unsupported platform: ${os.platform()} (${os.arch()})`);
  }

  fs.mkdirSync(cacheDir, { recursive: true });
  removeCorruptedCache(cacheDir);
  removeCorruptedCache(path.join(os.homedir(), '.cache', 'puppeteer'));
  removeCorruptedCache(path.join(process.cwd(), '.cache', 'puppeteer'));

  const buildId = await resolveBuildId(Browser.CHROME, platform, PUPPETEER_REVISIONS.chrome);
  console.log(`[puppeteer] Installing Chrome ${buildId} (cache: ${cacheDir})...`);

  const installed = await install({
    browser: Browser.CHROME,
    buildId,
    cacheDir,
    platform,
    downloadProgressCallback: 'default',
  });

  if (!pathExists(installed.executablePath)) {
    throw new Error(`Chrome installed but executable is missing: ${installed.executablePath}`);
  }

  return installed.executablePath;
}

function logDiagnostics() {
  const cacheDirs = [
    getPuppeteerCacheDir(),
    path.join(process.cwd(), '.cache', 'puppeteer'),
    path.join(os.homedir(), '.cache', 'puppeteer'),
  ];

  for (const cacheDir of [...new Set(cacheDirs)]) {
    const chromeCacheDir = path.join(cacheDir, 'chrome');
    console.error(`[puppeteer] Cache dir: ${cacheDir}`);
    if (!fs.existsSync(chromeCacheDir)) {
      console.error('[puppeteer]   chrome/ folder: missing');
      continue;
    }

    for (const entry of fs.readdirSync(chromeCacheDir)) {
      console.error(`[puppeteer]   ${entry}: present`);
    }
  }
}

async function ensurePuppeteerChrome() {
  let chromePath = resolveChromeExecutable();

  if (!chromePath) {
    try {
      chromePath = await installChrome();
    } catch (err) {
      console.warn(`[puppeteer] Install failed (${err.message}), retrying after cache wipe...`);
      clearChromeCache(getPuppeteerCacheDir());
      clearChromeCache(path.join(os.homedir(), '.cache', 'puppeteer'));
      clearChromeCache(path.join(process.cwd(), '.cache', 'puppeteer'));
      chromePath = await installChrome();
    }
  } else {
    console.log('[puppeteer] Chrome already available — skipping download.');
  }

  const verifiedPath = resolveChromeExecutable() || chromePath;
  if (!verifiedPath || !pathExists(verifiedPath)) {
    logDiagnostics();
    throw new Error('Chrome install completed but executable is still missing.');
  }

  writeChromePathRecord(verifiedPath);
  console.log(`[puppeteer] Chrome ready at: ${verifiedPath}`);
  return verifiedPath;
}

async function main() {
  await ensurePuppeteerChrome();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[puppeteer] Failed:', err);
    process.exit(1);
  });
}

module.exports = { ensurePuppeteerChrome };
