'use strict';

const fs = require('fs');
const path = require('path');
const { resolveChromeExecutable } = require(
  path.join(process.cwd(), 'config', 'puppeteer-chrome')
);
const { ensurePuppeteerChrome } = require(
  path.join(process.cwd(), 'scripts', 'ensure-puppeteer-chrome')
);
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');

async function ensureChromeReady() {
  if (resolveChromeExecutable()) {
    return resolveChromeExecutable();
  }

  if (process.env.RENDER || process.env.RENDER_SERVICE_ID) {
    console.log('[WhatsApp] Chrome missing at runtime — installing now...');
    return ensurePuppeteerChrome();
  }

  return undefined;
}

const MESSAGE_DELAY_MS = 5000;
const QR_WAIT_TIMEOUT_MS = 90000;
const KEEP_ALIVE_MS = 45000;
const READY_WAIT_TIMEOUT_MS = 120000;
const SESSION_CLEANUP_ATTEMPTS = 8;
const SESSION_CLEANUP_DELAY_MS = 500;
const BROWSER_CLOSE_DELAY_MS = 1500;

function wrapSafeLocalAuthLogout(authStrategy) {
  const userDataDir = () => authStrategy.userDataDir;

  authStrategy.logout = async function safeLogout() {
    const dir = userDataDir();
    if (!dir || !fs.existsSync(dir)) {
      return;
    }

    for (let attempt = 1; attempt <= SESSION_CLEANUP_ATTEMPTS; attempt += 1) {
      try {
        await fs.promises.rm(dir, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 250,
        });
        return;
      } catch (err) {
        const code = err && err.code;
        const retryable = code === 'EBUSY' || code === 'EPERM' || code === 'ENOTEMPTY';
        if (!retryable || attempt === SESSION_CLEANUP_ATTEMPTS) {
          console.warn(
            `[WhatsApp] Session cleanup skipped after ${attempt} attempt(s): ${err.message}`
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, SESSION_CLEANUP_DELAY_MS * attempt));
      }
    }
  };

  return authStrategy;
}

const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--disable-gpu',
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-features=MemorySaverMode',
  '--memory-pressure-off',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
];

class WhatsAppService {
  constructor(dataPath) {
    this.dataPath = dataPath || path.join(process.cwd(), '.wwebjs_auth');
    this.client = null;
    this.status = 'disconnected';
    this.qrCode = null;
    this.qrDataUrl = null;
    this.lastError = null;
    this.messageLogs = [];
    this.totalMessagesSent = 0;
    this.contactSet = new Set();
    this.isInitializing = false;
    this.isSending = false;
    this.isRecovering = false;
    this.qrWaiters = [];
    this.readyWaiters = [];
    this.keepAliveTimer = null;
    this.isDisconnecting = false;
  }

  getSessionDir() {
    return path.join(this.dataPath, 'session');
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async clearSessionDataWithRetry() {
    const sessionDir = this.getSessionDir();
    if (!fs.existsSync(sessionDir)) {
      return true;
    }

    for (let attempt = 1; attempt <= SESSION_CLEANUP_ATTEMPTS; attempt += 1) {
      try {
        await fs.promises.rm(sessionDir, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 250,
        });
        return true;
      } catch (err) {
        const code = err && err.code;
        const retryable = code === 'EBUSY' || code === 'EPERM' || code === 'ENOTEMPTY';
        if (!retryable || attempt === SESSION_CLEANUP_ATTEMPTS) {
          const message = `Could not remove WhatsApp session folder: ${err.message}`;
          this.lastError = message;
          console.warn(`[WhatsApp] ${message}`);
          return false;
        }
        await this.delay(SESSION_CLEANUP_DELAY_MS * attempt);
      }
    }

    return false;
  }

  async closeBrowserSafely(client) {
    if (!client?.pupBrowser) {
      return;
    }

    try {
      const browser = client.pupBrowser;
      if (browser.isConnected?.()) {
        const pages = await browser.pages().catch(() => []);
        await Promise.allSettled(pages.map((page) => page.close().catch(() => {})));
        await browser.close();
      }
    } catch (err) {
      console.warn('[WhatsApp] Browser close warning:', err.message);
    }

    await this.delay(BROWSER_CLOSE_DELAY_MS);
  }

  getStatus() {
    return this.status;
  }

  getQrCode() {
    return this.qrDataUrl;
  }

  getLastError() {
    return this.lastError;
  }

  resolveQrWaiters(qrDataUrl) {
    const waiters = this.qrWaiters.splice(0);
    for (const { resolve, timer } of waiters) {
      if (timer) clearTimeout(timer);
      resolve(qrDataUrl);
    }
  }

  rejectQrWaiters(error) {
    const waiters = this.qrWaiters.splice(0);
    for (const { reject, timer } of waiters) {
      if (timer) clearTimeout(timer);
      reject(error);
    }
  }

  resolveReadyWaiters() {
    const waiters = this.readyWaiters.splice(0);
    for (const { resolve, timer } of waiters) {
      if (timer) clearTimeout(timer);
      resolve();
    }
  }

  rejectReadyWaiters(error) {
    const waiters = this.readyWaiters.splice(0);
    for (const { reject, timer } of waiters) {
      if (timer) clearTimeout(timer);
      reject(error);
    }
  }

  waitForQrOrReady(timeoutMs = QR_WAIT_TIMEOUT_MS) {
    if (this.qrDataUrl) {
      return Promise.resolve(this.qrDataUrl);
    }
    if (this.status === 'connected') {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const entry = { resolve, reject };
      this.qrWaiters.push(entry);

      const timer = setTimeout(() => {
        const index = this.qrWaiters.indexOf(entry);
        if (index !== -1) {
          this.qrWaiters.splice(index, 1);
          reject(
            new Error(
              'QR code generation timed out. Delete .wwebjs_auth and .wwebjs_cache, then restart Strapi.'
            )
          );
        }
      }, timeoutMs);

      entry.timer = timer;
    });
  }

  waitForReady(timeoutMs = READY_WAIT_TIMEOUT_MS) {
    if (this.status === 'connected' && this.client) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const entry = { resolve, reject };
      this.readyWaiters.push(entry);

      const timer = setTimeout(() => {
        const index = this.readyWaiters.indexOf(entry);
        if (index !== -1) {
          this.readyWaiters.splice(index, 1);
          reject(new Error('WhatsApp reconnect timed out. Scan the QR code again.'));
        }
      }, timeoutMs);

      entry.timer = timer;
    });
  }

  getStats() {
    return {
      totalMessagesSent: this.totalMessagesSent,
      totalContacts: this.contactSet.size,
      connectionStatus: this.status,
    };
  }

  getLogs() {
    return [...this.messageLogs].reverse();
  }

  buildClientOptions() {
    const authStrategy = wrapSafeLocalAuthLogout(
      new LocalAuth({
        dataPath: this.dataPath,
        rmMaxRetries: 10,
      })
    );

    return {
      authStrategy,
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/{version}.html',
      },
      puppeteer: {
        headless: true,
        executablePath: resolveChromeExecutable(),
        args: PUPPETEER_ARGS,
      },
    };
  }

  attachClientEvents(client) {
    client.on('qr', async (qr) => {
      this.qrCode = qr;
      try {
        this.qrDataUrl = await QRCode.toDataURL(qr, { width: 280, margin: 2 });
        this.resolveQrWaiters(this.qrDataUrl);
      } catch (err) {
        this.lastError = err instanceof Error ? err.message : String(err);
        this.rejectQrWaiters(err);
      }
    });

    client.on('ready', () => {
      this.status = 'connected';
      this.qrCode = null;
      this.qrDataUrl = null;
      this.isInitializing = false;
      this.lastError = null;
      this.resolveQrWaiters(null);
      this.resolveReadyWaiters();
      this.startKeepAlive();
    });

    client.on('disconnected', async (reason) => {
      this.stopKeepAlive();
      this.status = 'disconnected';
      this.qrCode = null;
      this.qrDataUrl = null;
      this.isInitializing = false;

      if (!this.isSending && !this.isRecovering && !this.isDisconnecting) {
        this.client = null;
      }

      const reasonText = String(reason || '');
      if (reasonText.includes('LOGOUT') || reasonText.includes('UNPAIRED')) {
        await this.clearSessionDataWithRetry();
      }

      this.rejectQrWaiters(new Error(`Disconnected: ${reason}`));
      this.rejectReadyWaiters(new Error(`Disconnected: ${reason}`));
    });

    client.on('auth_failure', (msg) => {
      this.stopKeepAlive();
      this.status = 'disconnected';
      this.isInitializing = false;
      this.lastError = String(msg);
      this.rejectQrWaiters(new Error(String(msg)));
      this.rejectReadyWaiters(new Error(String(msg)));
    });
  }

  async setupAndStartClient() {
    await ensureChromeReady();
    this.client = new Client(this.buildClientOptions());
    this.attachClientEvents(this.client);

    await this.client.initialize().catch((err) => {
      this.status = 'disconnected';
      this.isInitializing = false;
      let message = err instanceof Error ? err.message : String(err);
      if (message.includes('Could not find Chrome')) {
        message += ' Install Google Chrome, or set CHROME_PATH to your browser executable.';
      }
      this.lastError = message;
      this.client = null;
      this.rejectQrWaiters(new Error(message));
      this.rejectReadyWaiters(new Error(message));
      throw new Error(message);
    });
  }

  startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(async () => {
      if (this.status !== 'connected' || !this.client || this.isSending || this.isRecovering) {
        return;
      }
      try {
        await this.client.sendPresenceAvailable();
      } catch (err) {
        if (this.isDetachedFrameError(err)) {
          console.warn('WhatsApp keep-alive hit detached frame; session may need recovery.');
        }
      }
    }, KEEP_ALIVE_MS);
  }

  stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  async initialize() {
    if (this.isDisconnecting) {
      await this.delay(500);
    }

    if (this.client || this.isInitializing) {
      try {
        const qrCode = await this.waitForQrOrReady(15000);
        return {
          status: this.status,
          qrCode: qrCode || this.qrDataUrl,
          error: this.lastError,
        };
      } catch (err) {
        return {
          status: this.status,
          qrCode: this.qrDataUrl,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    this.isInitializing = true;
    this.status = 'connecting';
    this.lastError = null;

    try {
      await this.setupAndStartClient();
      const qrCode = await this.waitForQrOrReady();
      return {
        status: this.status,
        qrCode: qrCode || this.qrDataUrl,
        error: this.lastError,
      };
    } catch (err) {
      this.isInitializing = false;
      const message = err instanceof Error ? err.message : String(err);
      this.lastError = message;
      return {
        status: this.status,
        qrCode: this.qrDataUrl,
        error: message,
      };
    }
  }

  async recoverSession() {
    if (this.isRecovering) {
      await this.waitForReady();
      return;
    }

    this.isRecovering = true;

    try {
      this.stopKeepAlive();
      const oldClient = this.client;
      this.client = null;
      this.isInitializing = false;
      this.status = 'connecting';

      if (oldClient) {
        await this.closeBrowserSafely(oldClient);
        try {
          await oldClient.authStrategy.destroy();
        } catch (err) {
          console.warn('[WhatsApp] Recovery browser cleanup:', err.message);
        }
      }

      await this.setupAndStartClient();
      await this.waitForReady();
    } finally {
      this.isRecovering = false;
    }
  }

  async disconnect() {
    if (this.isDisconnecting) {
      return { status: 'disconnected', sessionCleared: false, message: 'Disconnect already in progress' };
    }

    this.isDisconnecting = true;
    this.stopKeepAlive();
    this.rejectQrWaiters(new Error('Disconnected by user'));
    this.rejectReadyWaiters(new Error('Disconnected by user'));

    const client = this.client;
    this.client = null;
    this.status = 'disconnected';
    this.qrCode = null;
    this.qrDataUrl = null;
    this.isInitializing = false;
    this.lastError = null;

    if (client) {
      await this.closeBrowserSafely(client);
      try {
        await client.authStrategy.destroy();
      } catch (err) {
        console.warn('[WhatsApp] Auth destroy warning:', err.message);
      }
    }

    const sessionCleared = await this.clearSessionDataWithRetry();
    this.isDisconnecting = false;

    return {
      status: 'disconnected',
      sessionCleared,
      qrCode: null,
      message: sessionCleared
        ? 'Disconnected. Click Connect WhatsApp to scan a new QR code.'
        : 'Disconnected. If reconnect fails, stop Strapi and delete the .wwebjs_auth folder.',
    };
  }

  formatPhoneNumber(number) {
    const cleaned = String(number).replace(/\D/g, '');
    return `${cleaned}@c.us`;
  }

  normalizeMessageContent(content) {
    if (typeof content === 'string') {
      return { text: content.trim(), imageUrl: null, linkUrl: null, linkText: null };
    }

    const text = (content.text || content.body || '').trim();
    const imageUrl = content.imageUrl || content.image || null;
    const linkUrl = content.linkUrl || content.link?.url || null;
    const linkText = content.linkText || content.link?.text || null;

    let fullText = text;
    if (linkUrl) {
      const linkLine = linkText ? `${linkText}: ${linkUrl}` : linkUrl;
      fullText = fullText ? `${fullText}\n\n${linkLine}` : linkLine;
    }

    return { text: fullText, imageUrl, linkUrl, linkText };
  }

  formatLogMessage(content) {
    const normalized = this.normalizeMessageContent(content);
    return normalized.text || normalized.imageUrl || '(empty message)';
  }

  isDetachedFrameError(err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      message.includes('detached Frame') ||
      message.includes('Execution context was destroyed') ||
      message.includes('Session closed') ||
      message.includes('Target closed')
    );
  }

  ensureClientAvailable() {
    if (this.status !== 'connected' || !this.client) {
      throw new Error(
        'WhatsApp is not connected. Open Strapi Admin → WhatsApp and scan the QR code.'
      );
    }
  }

  async sendMessageToChat(chatId, content, maxRetries = 2) {
    const { text, imageUrl } = this.normalizeMessageContent(content);

    if (!text && !imageUrl) {
      throw new Error('Message text or image is required');
    }

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        this.ensureClientAvailable();

        if (imageUrl) {
          const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
          await this.client.sendMessage(chatId, media, {
            caption: text || undefined,
          });
        } else {
          await this.client.sendMessage(chatId, text);
        }

        return;
      } catch (err) {
        lastError = err;

        if (this.isDetachedFrameError(err) && attempt < maxRetries) {
          try {
            await this.recoverSession();
            await this.delay(1500);
            continue;
          } catch (recoverErr) {
            throw new Error(
              'WhatsApp browser session crashed. Open Strapi Admin → WhatsApp, disconnect, and scan the QR code again.'
            );
          }
        }

        if (this.isDetachedFrameError(err)) {
          throw new Error(
            'WhatsApp browser session crashed. Open Strapi Admin → WhatsApp, disconnect, and scan the QR code again.'
          );
        }

        throw err;
      }
    }

    throw lastError || new Error('Failed to send message');
  }

  async sendMessage(phoneNumber, content) {
    this.ensureClientAvailable();
    const chatId = this.formatPhoneNumber(phoneNumber);
    await this.sendMessageToChat(chatId, content);
    return { phoneNumber, status: 'success' };
  }

  async sendBulkMessages(phoneNumbers, content) {
    this.ensureClientAvailable();

    this.isSending = true;
    const results = [];
    const logMessage = this.formatLogMessage(content);

    try {
      for (let i = 0; i < phoneNumbers.length; i += 1) {
        const phoneNumber = phoneNumbers[i].trim();
        if (!phoneNumber) continue;

        const logEntry = {
          id: randomUUID(),
          phoneNumber,
          message: logMessage,
          status: 'pending',
          sentAt: new Date().toISOString(),
        };

        this.messageLogs.push(logEntry);
        this.contactSet.add(phoneNumber);

        try {
          const chatId = this.formatPhoneNumber(phoneNumber);
          await this.sendMessageToChat(chatId, content);

          logEntry.status = 'success';
          this.totalMessagesSent += 1;
          results.push({ phoneNumber, status: 'success' });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
          logEntry.status = 'failed';
          logEntry.error = errorMessage;
          results.push({ phoneNumber, status: 'failed', error: errorMessage });
        }

        if (i < phoneNumbers.length - 1) {
          await this.delay(MESSAGE_DELAY_MS);
        }
      }
    } finally {
      this.isSending = false;
      if (this.status === 'disconnected' && !this.isRecovering) {
        this.client = null;
      }
    }

    return results;
  }
}

let instance = null;

function getWhatsAppService(dataPath) {
  if (!instance) {
    instance = new WhatsAppService(dataPath);
    global.whatsappServiceInstance = instance;
  }
  return instance;
}

module.exports = { getWhatsAppService, WhatsAppService };
