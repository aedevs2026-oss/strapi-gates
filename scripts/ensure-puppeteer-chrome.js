'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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

function getPuppeteerCacheDir() {
  if (process.env.PUPPETEER_CACHE_DIR) {
    return process.env.PUPPETEER_CACHE_DIR;
  }

  if (process.env.RENDER) {
    return path.join(process.cwd(), '.cache', 'puppeteer');
  }

  return path.join(os.homedir(), '.cache', 'puppeteer');
}

function pathExists(candidate) {
  return Boolean(candidate && fs.existsSync(candidate));
}

function getBundledChromeExecutables() {
  const chromeCacheDir = path.join(getPuppeteerCacheDir(), 'chrome');
  if (!fs.existsSync(chromeCacheDir)) {
    return [];
  }

  const executables = [];
  for (const entry of fs.readdirSync(chromeCacheDir)) {
    const versionDir = path.join(chromeCacheDir, entry);
    if (!fs.statSync(versionDir).isDirectory()) {
      continue;
    }

    executables.push(
      path.join(versionDir, 'chrome-linux64', 'chrome'),
      path.join(versionDir, 'chrome-win64', 'chrome.exe'),
      path.join(versionDir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
    );
  }

  return executables;
}

function getPuppeteerChromePath() {
  try {
    const puppeteer = require('puppeteer');
    const bundledPath = puppeteer.executablePath();
    return pathExists(bundledPath) ? bundledPath : null;
  } catch {
    return getBundledChromeExecutables().find(pathExists) || null;
  }
}

function chromeIsAvailable() {
  const envCandidates = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH];
  if (envCandidates.some(pathExists)) {
    return true;
  }

  const platformPaths = process.platform === 'win32' ? WINDOWS_CHROME_PATHS : LINUX_CHROME_PATHS;
  if (platformPaths.some(pathExists)) {
    return true;
  }

  return Boolean(getPuppeteerChromePath());
}

function removeCorruptedPuppeteerCache() {
  const chromeCacheDir = path.join(getPuppeteerCacheDir(), 'chrome');
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
    const hasExecutable = bundledCandidates.some(pathExists);

    if (!hasExecutable) {
      console.log(`[postinstall] Removing incomplete Puppeteer cache: ${versionDir}`);
      fs.rmSync(versionDir, { recursive: true, force: true });
    }
  }
}

function installPuppeteerChrome() {
  const cacheDir = getPuppeteerCacheDir();
  fs.mkdirSync(cacheDir, { recursive: true });

  console.log(`[postinstall] Installing Puppeteer Chrome (cache: ${cacheDir})...`);
  execSync('npx puppeteer browsers install chrome', {
    stdio: 'inherit',
    env: {
      ...process.env,
      PUPPETEER_CACHE_DIR: cacheDir,
    },
  });
}

function clearPuppeteerChromeCache() {
  const chromeCacheDir = path.join(getPuppeteerCacheDir(), 'chrome');
  if (fs.existsSync(chromeCacheDir)) {
    console.log(`[postinstall] Clearing Puppeteer Chrome cache: ${chromeCacheDir}`);
    fs.rmSync(chromeCacheDir, { recursive: true, force: true });
  }
}

removeCorruptedPuppeteerCache();

if (!chromeIsAvailable()) {
  try {
    installPuppeteerChrome();
  } catch (err) {
    console.warn('[postinstall] Chrome install failed, clearing cache and retrying once...');
    clearPuppeteerChromeCache();
    installPuppeteerChrome();
  }
} else {
  console.log('[postinstall] Chrome already available — skipping Puppeteer browser download.');
}

if (!chromeIsAvailable()) {
  console.error('[postinstall] Chrome install completed but executable is still missing.');
  process.exit(1);
}

console.log(`[postinstall] Chrome ready at: ${getPuppeteerChromePath()}`);
