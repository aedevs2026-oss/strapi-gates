'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { configurePuppeteerEnv, getPuppeteerCacheDir } = require('../config/puppeteer-env');

configurePuppeteerEnv();

const {
  Browser,
  detectBrowserPlatform,
  getInstalledBrowsers,
  install,
  resolveBuildId,
} = require('@puppeteer/browsers');
const { PUPPETEER_REVISIONS } = require('puppeteer-core/internal/revisions.js');

const WINDOWS_CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA
    ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
    : null,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const LINUX_CHROME_PATHS = [
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
];

function pathExists(candidate) {
  return Boolean(candidate && fs.existsSync(candidate));
}

function findInstalledChrome(cacheDir) {
  if (!cacheDir || !fs.existsSync(cacheDir)) {
    return null;
  }

  try {
    const installed = getInstalledBrowsers({ cacheDir });
    const chrome = installed.find((browser) => browser.browser === Browser.CHROME);
    if (chrome && pathExists(chrome.executablePath)) {
      return chrome.executablePath;
    }
  } catch (err) {
    console.warn(`[postinstall] Could not read Puppeteer cache at ${cacheDir}: ${err.message}`);
  }

  return null;
}

function findSystemChrome() {
  const envCandidates = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH];
  const envMatch = envCandidates.find(pathExists);
  if (envMatch) {
    return envMatch;
  }

  const platformPaths = process.platform === 'win32' ? WINDOWS_CHROME_PATHS : LINUX_CHROME_PATHS;
  return platformPaths.find(pathExists) || null;
}

function resolveChromePath() {
  const systemChrome = findSystemChrome();
  if (systemChrome) {
    return systemChrome;
  }

  const cacheDirs = [
    getPuppeteerCacheDir(),
    path.join(os.homedir(), '.cache', 'puppeteer'),
  ];

  for (const cacheDir of [...new Set(cacheDirs)]) {
    const installedChrome = findInstalledChrome(cacheDir);
    if (installedChrome) {
      return installedChrome;
    }
  }

  return null;
}

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
      console.log(`[postinstall] Removing incomplete Puppeteer cache: ${versionDir}`);
      fs.rmSync(versionDir, { recursive: true, force: true });
    }
  }
}

function clearChromeCache(cacheRoot) {
  const chromeCacheDir = path.join(cacheRoot, 'chrome');
  if (fs.existsSync(chromeCacheDir)) {
    console.log(`[postinstall] Clearing Puppeteer Chrome cache: ${chromeCacheDir}`);
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

  const buildId = await resolveBuildId(Browser.CHROME, platform, PUPPETEER_REVISIONS.chrome);
  console.log(`[postinstall] Installing Puppeteer Chrome ${buildId} (cache: ${cacheDir})...`);

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
  const cacheDirs = [getPuppeteerCacheDir(), path.join(os.homedir(), '.cache', 'puppeteer')];

  for (const cacheDir of [...new Set(cacheDirs)]) {
    const chromeCacheDir = path.join(cacheDir, 'chrome');
    console.error(`[postinstall] Cache dir: ${cacheDir}`);
    if (!fs.existsSync(chromeCacheDir)) {
      console.error('[postinstall]   chrome/ folder: missing');
      continue;
    }

    for (const entry of fs.readdirSync(chromeCacheDir)) {
      const versionDir = path.join(chromeCacheDir, entry);
      console.error(`[postinstall]   ${entry}: ${fs.existsSync(versionDir) ? 'present' : 'missing'}`);
    }
  }
}

async function main() {
  let chromePath = resolveChromePath();

  if (!chromePath) {
    try {
      chromePath = await installChrome();
    } catch (err) {
      console.warn(`[postinstall] Chrome install failed (${err.message}), retrying after cache wipe...`);
      clearChromeCache(getPuppeteerCacheDir());
      clearChromeCache(path.join(os.homedir(), '.cache', 'puppeteer'));
      chromePath = await installChrome();
    }
  } else {
    console.log('[postinstall] Chrome already available — skipping Puppeteer browser download.');
  }

  const verifiedPath = resolveChromePath();
  if (!verifiedPath) {
    logDiagnostics();
    console.error('[postinstall] Chrome install completed but executable is still missing.');
    process.exit(1);
  }

  process.env.PUPPETEER_EXECUTABLE_PATH = verifiedPath;
  console.log(`[postinstall] Chrome ready at: ${verifiedPath}`);
}

main().catch((err) => {
  console.error('[postinstall] Failed:', err);
  process.exit(1);
});
