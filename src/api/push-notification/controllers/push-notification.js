'use strict';

const { sendPushNotification, sendMulticast } = require('../../../services/firebase');
const { badRequest, success } = require('../../../utils/api-response');
const {
  sendNotificationWhatsApp,
  sendBulkNotificationWhatsApp,
  isWhatsAppEnabled,
} = require('../../../services/whatsapp');

const collectParentContacts = (parents) => {
  const tokens = [];
  const mobiles = [];

  for (const parent of parents) {
    if (parent.deviceToken) tokens.push(parent.deviceToken);
    if (parent.mobileNumber) mobiles.push(parent.mobileNumber);
  }

  return {
    tokens: [...new Set(tokens)],
    mobiles: [...new Set(mobiles)],
  };
};

module.exports = {
  async sendToParent(ctx) {
    const { parentId, title, message, imageUrl, data } = ctx.request.body || {};

    if (!parentId || !title || !message) {
      return badRequest(ctx, 'parentId, title, and message are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent) {
      return badRequest(ctx, 'Parent not found.');
    }

    const canPush = Boolean(parent.deviceToken);
    const canWhatsApp = isWhatsAppEnabled(strapi) && Boolean(parent.mobileNumber);

    if (!canPush && !canWhatsApp) {
      return badRequest(ctx, 'Parent has no device token or mobile number for notifications.');
    }

    const pushResult = canPush
      ? await sendPushNotification({
          token: parent.deviceToken,
          title,
          body: message,
          imageUrl,
          data,
        })
      : { success: false, skipped: true, reason: 'No device token' };

    const whatsappResult = canWhatsApp
      ? await sendNotificationWhatsApp(
          { mobile: parent.mobileNumber, title, message, imageUrl },
          strapi
        )
      : { success: false, skipped: true, reason: 'WhatsApp disabled or no mobile number' };

    const sent = Boolean(pushResult.success || whatsappResult.success);

    await strapi.documents('api::notification.notification').create({
      data: {
        title,
        message,
        target: 'specific_parent',
        targetParent: parentId,
        sentDate: new Date(),
        sent,
        dataPayload: {
          ...(data || {}),
          channels: {
            push: pushResult,
            whatsapp: whatsappResult,
          },
        },
      },
    });

    return success(ctx, {
      success: sent,
      push: pushResult,
      whatsapp: whatsappResult,
    });
  },

  async sendToAllParents(ctx) {
    const { title, message, imageUrl, data } = ctx.request.body || {};

    if (!title || !message) {
      return badRequest(ctx, 'title and message are required.');
    }

    const parents = await strapi.documents('api::parent.parent').findMany({
      filters: {
        $or: [{ deviceToken: { $notNull: true } }, { mobileNumber: { $notNull: true } }],
      },
    });

    const { tokens, mobiles } = collectParentContacts(parents);

    const pushResult = tokens.length
      ? await sendMulticast({ tokens, title, body: message, data })
      : { success: false, skipped: true, reason: 'No device tokens' };

    const whatsappResult =
      isWhatsAppEnabled(strapi) && mobiles.length
        ? await sendBulkNotificationWhatsApp({ mobiles, title, message, imageUrl }, strapi)
        : { success: false, skipped: true, reason: 'WhatsApp disabled or no mobile numbers' };

    const sent = Boolean(pushResult.success || whatsappResult.success);

    await strapi.documents('api::notification.notification').create({
      data: {
        title,
        message,
        target: 'all_parents',
        sentDate: new Date(),
        sent,
        dataPayload: {
          ...(data || {}),
          channels: {
            push: pushResult,
            whatsapp: whatsappResult,
          },
        },
      },
    });

    return success(ctx, {
      success: sent,
      recipientCount: parents.length,
      pushRecipientCount: tokens.length,
      whatsappRecipientCount: mobiles.length,
      push: pushResult,
      whatsapp: whatsappResult,
    });
  },

  async sendToClass(ctx) {
    const { classId, title, message, data, imageUrl } = ctx.request.body || {};

    if (!classId || !title || !message) {
      return badRequest(ctx, 'classId, title, and message are required.');
    }

    const students = await strapi.documents('api::student.student').findMany({
      filters: { class: { documentId: classId } },
      populate: ['parent'],
    });

    const parentMap = new Map();
    students.forEach((student) => {
      if (student.parent?.documentId) {
        parentMap.set(student.parent.documentId, student.parent);
      }
    });

    const parents = [...parentMap.values()];
    const { tokens, mobiles } = collectParentContacts(parents);

    const pushResult = tokens.length
      ? await sendMulticast({ tokens, title, body: message, data })
      : { success: false, skipped: true, reason: 'No device tokens for class parents' };

    const whatsappResult =
      isWhatsAppEnabled(strapi) && mobiles.length
        ? await sendBulkNotificationWhatsApp({ mobiles, title, message, imageUrl }, strapi)
        : { success: false, skipped: true, reason: 'WhatsApp disabled or no mobile numbers' };

    const sent = Boolean(pushResult.success || whatsappResult.success);

    await strapi.documents('api::notification.notification').create({
      data: {
        title,
        message,
        target: 'specific_class',
        targetClass: classId,
        sentDate: new Date(),
        sent,
        dataPayload: {
          ...(data || {}),
          channels: {
            push: pushResult,
            whatsapp: whatsappResult,
          },
        },
      },
    });

    return success(ctx, {
      success: sent,
      recipientCount: parents.length,
      pushRecipientCount: tokens.length,
      whatsappRecipientCount: mobiles.length,
      push: pushResult,
      whatsapp: whatsappResult,
    });
  },
};
