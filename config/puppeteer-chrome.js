'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { configurePuppeteerEnv, getPuppeteerCacheDir } = require('./puppeteer-env');

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
  if (candidate == null) {
    return false;
  }

  if (typeof candidate === 'string') {
    return candidate.length > 0 && fs.existsSync(candidate);
  }

  if (Buffer.isBuffer(candidate) || candidate instanceof URL) {
    return fs.existsSync(candidate);
  }

  return false;
}

function getChromePathRecordFile() {
  return path.join(getPuppeteerCacheDir(), 'chrome-path.txt');
}

function readChromePathRecord() {
  const recordFile = getChromePathRecordFile();
  if (!pathExists(recordFile)) {
    return null;
  }

  const savedPath = fs.readFileSync(recordFile, 'utf8').trim();
  return pathExists(savedPath) ? savedPath : null;
}

function writeChromePathRecord(chromePath) {
  const cacheDir = getPuppeteerCacheDir();
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(getChromePathRecordFile(), chromePath, 'utf8');
  process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;
}

function findInstalledChrome(cacheDir) {
  if (!pathExists(cacheDir)) {
    return null;
  }

  try {
    const { Browser, getInstalledBrowsers } = require('@puppeteer/browsers');
    const installed = getInstalledBrowsers({ cacheDir });
    const chrome = installed.find((browser) => browser.browser === Browser.CHROME);
    if (chrome && pathExists(chrome.executablePath)) {
      return chrome.executablePath;
    }
  } catch {
    // ignore cache read errors
  }

  const chromeCacheDir = path.join(cacheDir, 'chrome');
  if (!pathExists(chromeCacheDir)) {
    return null;
  }

  for (const entry of fs.readdirSync(chromeCacheDir)) {
    const candidates = [
      path.join(chromeCacheDir, entry, 'chrome-linux64', 'chrome'),
      path.join(chromeCacheDir, entry, 'chrome-win64', 'chrome.exe'),
      path.join(
        chromeCacheDir,
        entry,
        'chrome-mac',
        'Chromium.app',
        'Contents',
        'MacOS',
        'Chromium'
      ),
    ];
    const match = candidates.find(pathExists);
    if (match) {
      return match;
    }
  }

  return null;
}

function resolveChromeExecutable() {
  configurePuppeteerEnv();

  const envCandidates = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH];
  const envMatch = envCandidates.find(pathExists);
  if (envMatch) {
    return envMatch;
  }

  const recordedPath = readChromePathRecord();
  if (recordedPath) {
    return recordedPath;
  }

  const platformPaths = process.platform === 'win32' ? WINDOWS_CHROME_PATHS : LINUX_CHROME_PATHS;
  const systemChrome = platformPaths.find(pathExists);
  if (systemChrome) {
    return systemChrome;
  }

  const cacheDirs = [
    getPuppeteerCacheDir(),
    path.join(process.cwd(), '.cache', 'puppeteer'),
    path.join(os.homedir(), '.cache', 'puppeteer'),
  ];

  for (const cacheDir of [...new Set(cacheDirs)]) {
    const installedChrome = findInstalledChrome(cacheDir);
    if (installedChrome) {
      return installedChrome;
    }
  }

  try {
    const puppeteer = require('puppeteer');
    const bundledPath = puppeteer.executablePath();
    if (pathExists(bundledPath)) {
      return bundledPath;
    }
  } catch {
    // ignore
  }

  return undefined;
}

module.exports = {
  resolveChromeExecutable,
  readChromePathRecord,
  writeChromePathRecord,
  findInstalledChrome,
  pathExists,
};
