'use strict';

const { sendOtpWhatsApp, isWhatsAppEnabled } = require('../services/whatsapp');

/**
 * Whether the send-otp API may include the OTP in the JSON response.
 * Production never exposes OTP unless OTP_DEV_MODE=true (must stay false in prod).
 */
function shouldExposeOtpInResponse(devMode, whatsappEnabled) {
  if (devMode) {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return !whatsappEnabled;
}

/**
 * Send OTP via WhatsApp when configured, or log for local development.
 */
async function deliverOtp({ strapi, normalized, otp, expiryMinutes, logLabel }) {
  const devMode = process.env.OTP_DEV_MODE === 'true';
  const whatsappEnabled = isWhatsAppEnabled(strapi);
  const exposeOtpInResponse = shouldExposeOtpInResponse(devMode, whatsappEnabled);

  if (devMode) {
    strapi.log.info(`[DEV ${logLabel} OTP] ${normalized}: ${otp}`);
  } else if (whatsappEnabled) {
    const whatsappResult = await sendOtpWhatsApp(
      { mobile: normalized, otp, expiryMinutes },
      strapi
    );

    if (!whatsappResult.success) {
      return {
        error:
          whatsappResult.reason || 'Failed to send OTP via WhatsApp. Please try again later.',
      };
    }
  } else if (process.env.NODE_ENV !== 'production') {
    strapi.log.info(
      `[DEV ${logLabel} OTP] WhatsApp disabled — returning OTP in API for ${normalized}: ${otp}`
    );
  } else {
    strapi.log.warn(
      `[${logLabel} OTP] WhatsApp disabled. Set OTP_DEV_MODE=true for development. OTP for ${normalized}: ${otp}`
    );
  }

  return { exposeOtpInResponse };
}

module.exports = {
  deliverOtp,
  shouldExposeOtpInResponse,
};
