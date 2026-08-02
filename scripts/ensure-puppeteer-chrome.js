'use strict';

const fs = require('fs');
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

function pathExists(candidate) {
  return Boolean(candidate && fs.existsSync(candidate));
}

function getPuppeteerChromePath() {
  try {
    const puppeteer = require('puppeteer');
    const bundledPath = puppeteer.executablePath();
    return pathExists(bundledPath) ? bundledPath : null;
  } catch {
    return null;
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

if (!chromeIsAvailable()) {
  console.log('[postinstall] Chrome not found — installing Puppeteer Chrome...');
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
} else {
  console.log('[postinstall] Chrome already available — skipping Puppeteer browser download.');
}
