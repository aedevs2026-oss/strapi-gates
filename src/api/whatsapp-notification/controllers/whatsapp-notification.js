'use strict';

const { badRequest, success } = require('../../../utils/api-response');
const {
  sendFeeReminderWhatsApp,
  sendAttendanceAlertWhatsApp,
  sendGateEntryWhatsApp,
  sendGateExitWhatsApp,
  sendCircularWhatsApp,
  sendNotificationWhatsApp,
  isWhatsAppEnabled,
} = require('../../../services/whatsapp');

const ensureWhatsAppEnabled = (ctx) => {
  if (!isWhatsAppEnabled(strapi)) {
    badRequest(
      ctx,
      'WhatsApp is disabled. Set WHFLOW_ENABLED=true and connect in Strapi Admin → WhatsApp.'
    );
    return false;
  }
  return true;
};

module.exports = {
  async sendFeeReminder(ctx) {
    if (!ensureWhatsAppEnabled(ctx)) return;

    const { parentId, studentName, amount, dueDate, feeType } = ctx.request.body || {};

    if (!parentId || !studentName || !amount || !dueDate) {
      return badRequest(ctx, 'parentId, studentName, amount, and dueDate are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent?.mobileNumber) {
      return badRequest(ctx, 'Parent mobile number not found.');
    }

    const result = await sendFeeReminderWhatsApp(
      {
        mobile: parent.mobileNumber,
        studentName,
        amount,
        dueDate,
        feeType,
      },
      strapi
    );

    return success(ctx, result);
  },

  async sendAttendanceAlert(ctx) {
    if (!ensureWhatsAppEnabled(ctx)) return;

    const { parentId, studentName, date, status } = ctx.request.body || {};

    if (!parentId || !studentName || !date || !status) {
      return badRequest(ctx, 'parentId, studentName, date, and status are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent?.mobileNumber) {
      return badRequest(ctx, 'Parent mobile number not found.');
    }

    const result = await sendAttendanceAlertWhatsApp(
      {
        mobile: parent.mobileNumber,
        studentName,
        date,
        status,
      },
      strapi
    );

    return success(ctx, result);
  },

  async sendGateEntry(ctx) {
    if (!ensureWhatsAppEnabled(ctx)) return;

    const { parentId, studentName, time, gateName } = ctx.request.body || {};

    if (!parentId || !studentName || !time) {
      return badRequest(ctx, 'parentId, studentName, and time are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent?.mobileNumber) {
      return badRequest(ctx, 'Parent mobile number not found.');
    }

    const result = await sendGateEntryWhatsApp(
      {
        mobile: parent.mobileNumber,
        studentName,
        time,
        gateName,
      },
      strapi
    );

    return success(ctx, result);
  },

  async sendGateExit(ctx) {
    if (!ensureWhatsAppEnabled(ctx)) return;

    const { parentId, studentName, time, gateName } = ctx.request.body || {};

    if (!parentId || !studentName || !time) {
      return badRequest(ctx, 'parentId, studentName, and time are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent?.mobileNumber) {
      return badRequest(ctx, 'Parent mobile number not found.');
    }

    const result = await sendGateExitWhatsApp(
      {
        mobile: parent.mobileNumber,
        studentName,
        time,
        gateName,
      },
      strapi
    );

    return success(ctx, result);
  },

  async sendCircular(ctx) {
    if (!ensureWhatsAppEnabled(ctx)) return;

    const { parentId, title, body, linkUrl } = ctx.request.body || {};

    if (!parentId || !title) {
      return badRequest(ctx, 'parentId and title are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent?.mobileNumber) {
      return badRequest(ctx, 'Parent mobile number not found.');
    }

    const result = await sendCircularWhatsApp(
      {
        mobile: parent.mobileNumber,
        title,
        body,
        linkUrl,
      },
      strapi
    );

    return success(ctx, result);
  },

  async sendCustom(ctx) {
    if (!ensureWhatsAppEnabled(ctx)) return;

    const { parentId, title, message, imageUrl } = ctx.request.body || {};

    if (!parentId || !title || !message) {
      return badRequest(ctx, 'parentId, title, and message are required.');
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: parentId,
    });

    if (!parent?.mobileNumber) {
      return badRequest(ctx, 'Parent mobile number not found.');
    }

    const result = await sendNotificationWhatsApp(
      {
        mobile: parent.mobileNumber,
        title,
        message,
        imageUrl,
      },
      strapi
    );

    return success(ctx, result);
  },
};
