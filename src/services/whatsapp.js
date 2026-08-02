'use strict';

const {
  isWhatsAppEnabled: checkWhatsAppEnabled,
  sendDirectMessage,
  sendBulkDirectMessages,
} = require('./whatsapp-transport');
const {
  otpMessage,
  notificationMessage,
  paymentConfirmationMessage,
  feeReminderMessage,
  attendanceAlertMessage,
  gateEntryMessage,
  gateExitMessage,
  circularMessage,
} = require('../utils/message-templates');

const logWhatsAppResult = (strapi, action, mobile, result) => {
  if (result.success) {
    strapi?.log?.info(`[WhatsApp] ${action} sent to ${mobile}`);
    return;
  }

  if (result.skipped) {
    strapi?.log?.debug(`[WhatsApp] ${action} skipped for ${mobile}: ${result.reason}`);
    return;
  }

  strapi?.log?.warn(`[WhatsApp] ${action} failed for ${mobile}: ${result.reason}`);
};

async function sendOtpWhatsApp({ mobile, otp, expiryMinutes }, strapi) {
  const text = otpMessage({ otp, expiryMinutes });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'OTP', mobile, result);
  return result;
}

async function sendNotificationWhatsApp({ mobile, title, message, imageUrl }, strapi) {
  const text = notificationMessage({ title, message });
  const result = await sendDirectMessage({ mobile, text, imageUrl }, strapi);
  logWhatsAppResult(strapi, 'notification', mobile, result);
  return result;
}

async function sendBulkNotificationWhatsApp({ mobiles, title, message, imageUrl }, strapi) {
  const text = notificationMessage({ title, message });
  const result = await sendBulkDirectMessages({ mobiles, text, imageUrl }, strapi);
  logWhatsAppResult(strapi, `bulk notification (${mobiles?.length || 0})`, 'multiple', result);
  return result;
}

async function sendPaymentConfirmationWhatsApp(
  { mobile, studentName, amount, receiptNumber },
  strapi
) {
  const text = paymentConfirmationMessage({ studentName, amount, receiptNumber });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'payment confirmation', mobile, result);
  return result;
}

async function sendFeeReminderWhatsApp(
  { mobile, studentName, amount, dueDate, feeType },
  strapi
) {
  const text = feeReminderMessage({ studentName, amount, dueDate, feeType });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'fee reminder', mobile, result);
  return result;
}

async function sendAttendanceAlertWhatsApp({ mobile, studentName, date, status }, strapi) {
  const text = attendanceAlertMessage({ studentName, date, status });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'attendance alert', mobile, result);
  return result;
}

async function sendGateEntryWhatsApp({ mobile, studentName, time, gateName }, strapi) {
  const text = gateEntryMessage({ studentName, time, gateName });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'gate entry', mobile, result);
  return result;
}

async function sendGateExitWhatsApp({ mobile, studentName, time, gateName }, strapi) {
  const text = gateExitMessage({ studentName, time, gateName });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'gate exit', mobile, result);
  return result;
}

async function sendCircularWhatsApp({ mobile, title, body, linkUrl }, strapi) {
  const text = circularMessage({ title, body, linkUrl });
  const result = await sendDirectMessage({ mobile, text }, strapi);
  logWhatsAppResult(strapi, 'circular', mobile, result);
  return result;
}

const isWhatsAppEnabled = (strapi) => checkWhatsAppEnabled(strapi);

module.exports = {
  isWhatsAppEnabled,
  sendDirectMessage,
  sendBulkDirectMessages,
  sendOtpWhatsApp,
  sendNotificationWhatsApp,
  sendBulkNotificationWhatsApp,
  sendPaymentConfirmationWhatsApp,
  sendFeeReminderWhatsApp,
  sendAttendanceAlertWhatsApp,
  sendGateEntryWhatsApp,
  sendGateExitWhatsApp,
  sendCircularWhatsApp,
};
