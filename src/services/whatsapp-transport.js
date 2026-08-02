'use strict';

const { normalizeMobile } = require('../utils/otp');

const isWhatsAppEnabled = (strapi) => {
  if (process.env.WHFLOW_ENABLED === 'false') {
    return false;
  }

  try {
    return Boolean(strapi?.plugin('whatsapp'));
  } catch {
    return false;
  }
};

const formatRecipient = (mobile) => {
  const normalized = normalizeMobile(mobile);
  if (!normalized) return null;
  return `91${normalized}`;
};

const getClient = (strapi) => {
  if (!isWhatsAppEnabled(strapi)) {
    return null;
  }

  return strapi.plugin('whatsapp').service('client');
};

async function sendDirectMessage({ mobile, text, imageUrl }, strapi) {
  if (!isWhatsAppEnabled(strapi)) {
    return { success: false, skipped: true, reason: 'WhatsApp integration disabled' };
  }

  const recipient = formatRecipient(mobile);
  if (!recipient) {
    return { success: false, reason: 'Invalid mobile number' };
  }

  if (!text?.trim() && !imageUrl) {
    return { success: false, reason: 'Message text or image is required' };
  }

  try {
    await getClient(strapi).sendMessage(recipient, {
      text: text?.trim() || null,
      imageUrl: imageUrl || null,
    });
    return { success: true, data: { recipient, status: 'sent' } };
  } catch (err) {
    return {
      success: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

async function sendBulkDirectMessages({ mobiles, text, imageUrl }, strapi) {
  if (!isWhatsAppEnabled(strapi)) {
    return { success: false, skipped: true, reason: 'WhatsApp integration disabled' };
  }

  const recipients = [...new Set(mobiles.map(formatRecipient).filter(Boolean))];
  if (!recipients.length) {
    return { success: false, reason: 'No valid mobile numbers' };
  }

  if (!text?.trim() && !imageUrl) {
    return { success: false, reason: 'Message text or image is required' };
  }

  try {
    const results = await getClient(strapi).sendBulkMessages(recipients, {
      text: text?.trim() || null,
      imageUrl: imageUrl || null,
    });

    return {
      success: results.some((item) => item.status === 'success'),
      data: {
        results,
        summary: {
          total: results.length,
          success: results.filter((item) => item.status === 'success').length,
          failed: results.filter((item) => item.status === 'failed').length,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

module.exports = {
  isWhatsAppEnabled,
  sendDirectMessage,
  sendBulkDirectMessages,
};
