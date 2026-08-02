'use strict';

const { generateOtp, normalizeMobile, isValidMobile, getOtpExpiry } = require('../../../utils/otp');
const { signParentToken } = require('../../../utils/jwt');
const { badRequest, success, unauthorized } = require('../../../utils/api-response');
const { isRateLimited, getClientIp } = require('../../../middlewares/rate-limit');
const { sendOtpWhatsApp, isWhatsAppEnabled } = require('../../../services/whatsapp');

const MAX_OTP_ATTEMPTS = 5;

module.exports = {
  async sendOtp(ctx) {
    const { mobileNumber } = ctx.request.body || {};

    if (!isValidMobile(mobileNumber)) {
      return badRequest(ctx, 'Invalid mobile number. Enter a valid 10-digit Indian mobile number.');
    }

    const normalized = normalizeMobile(mobileNumber);
    const ip = getClientIp(ctx);
    const otpMax = parseInt(process.env.OTP_RATE_LIMIT_MAX || '5', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

    if (isRateLimited(`otp:${ip}:${normalized}`, windowMs, otpMax)) {
      return ctx.tooManyRequests('Too many OTP requests. Please try again later.');
    }

    const parent = await strapi.documents('api::parent.parent').findFirst({
      filters: { mobileNumber: normalized },
    });

    if (!parent) {
      return badRequest(ctx, 'Mobile number is not registered. Please contact the school office.');
    }

    if (parent.blocked) {
      return unauthorized(ctx, 'Your account has been blocked. Please contact the school.');
    }

    const otpLength = parseInt(process.env.OTP_LENGTH || '6', 10);
    const otp = generateOtp(otpLength);
    const expiresAt = getOtpExpiry();

    const staleOtps = await strapi.documents('api::otp-record.otp-record').findMany({
      filters: { mobileNumber: normalized, verified: false },
    });
    for (const record of staleOtps) {
      await strapi.documents('api::otp-record.otp-record').delete({
        documentId: record.documentId,
      });
    }

    await strapi.documents('api::otp-record.otp-record').create({
      data: {
        mobileNumber: normalized,
        otp,
        expiresAt,
        verified: false,
        attempts: 0,
      },
    });

    const devMode = process.env.OTP_DEV_MODE === 'true';
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);

    if (devMode) {
      strapi.log.info(`[DEV OTP] ${normalized}: ${otp}`);
    } else if (isWhatsAppEnabled(strapi)) {
      const whatsappResult = await sendOtpWhatsApp(
        { mobile: normalized, otp, expiryMinutes },
        strapi
      );

      if (!whatsappResult.success) {
        return ctx.internalServerError(
          whatsappResult.reason || 'Failed to send OTP via WhatsApp. Please try again later.'
        );
      }
    } else {
      strapi.log.warn(
        `[OTP] WhatsApp disabled. Set WHFLOW_ENABLED=true, connect in Admin → WhatsApp, or use OTP_DEV_MODE=true for development. OTP for ${normalized}: ${otp}`
      );
    }

    return success(ctx, {
      message: 'OTP sent successfully',
      mobileNumber: normalized,
      expiresInMinutes: expiryMinutes,
      ...(devMode && { otp }),
    });
  },

  async verifyOtp(ctx) {
    const { mobileNumber, otp, deviceToken } = ctx.request.body || {};

    if (!isValidMobile(mobileNumber) || !otp) {
      return badRequest(ctx, 'Mobile number and OTP are required.');
    }

    const normalized = normalizeMobile(mobileNumber);
    const ip = getClientIp(ctx);
    const verifyMax = parseInt(process.env.OTP_VERIFY_RATE_LIMIT_MAX || '10', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

    if (isRateLimited(`verify:${ip}:${normalized}`, windowMs, verifyMax)) {
      return ctx.tooManyRequests('Too many verification attempts. Please try again later.');
    }

    const otpRecord = await strapi.documents('api::otp-record.otp-record').findFirst({
      filters: {
        mobileNumber: normalized,
        verified: false,
      },
      sort: 'createdAt:desc',
    });

    if (!otpRecord) {
      return badRequest(ctx, 'OTP expired or not found. Please request a new OTP.');
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      await strapi.documents('api::otp-record.otp-record').delete({
        documentId: otpRecord.documentId,
      });
      return badRequest(ctx, 'OTP has expired. Please request a new OTP.');
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return badRequest(ctx, 'Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    if (String(otpRecord.otp) !== String(otp)) {
      await strapi.documents('api::otp-record.otp-record').update({
        documentId: otpRecord.documentId,
        data: { attempts: (otpRecord.attempts || 0) + 1 },
      });
      return badRequest(ctx, 'Invalid OTP. Please try again.');
    }

    await strapi.documents('api::otp-record.otp-record').update({
      documentId: otpRecord.documentId,
      data: { verified: true },
    });

    const updateData = { lastLoginAt: new Date() };
    if (deviceToken) {
      updateData.deviceToken = deviceToken;
    }

    const existingParent = await strapi.documents('api::parent.parent').findFirst({
      filters: { mobileNumber: normalized },
    });

    const parent = await strapi.documents('api::parent.parent').update({
      documentId: existingParent.documentId,
      data: updateData,
      populate: {
        students: {
          populate: ['photo', 'class', 'section'],
        },
      },
    });

    const token = signParentToken({
      documentId: parent.documentId,
      mobileNumber: parent.mobileNumber,
      type: 'parent',
    });

    return success(ctx, {
      jwt: token,
      parent: {
        documentId: parent.documentId,
        fatherName: parent.fatherName,
        motherName: parent.motherName,
        guardianName: parent.guardianName,
        mobileNumber: parent.mobileNumber,
        email: parent.email,
        students: parent.students,
      },
    });
  },

  async refreshProfile(ctx) {
    const parent = ctx.state.parent;
    const profile = await strapi.documents('api::parent.parent').findOne({
      documentId: parent.documentId,
      populate: {
        students: {
          populate: ['photo', 'class', 'section'],
        },
      },
    });

    return success(ctx, { parent: profile });
  },

  async updateDeviceToken(ctx) {
    const parent = ctx.state.parent;
    const { deviceToken } = ctx.request.body || {};

    if (!deviceToken) {
      return badRequest(ctx, 'deviceToken is required');
    }

    await strapi.documents('api::parent.parent').update({
      documentId: parent.documentId,
      data: { deviceToken },
    });

    return success(ctx, { message: 'Device token updated successfully' });
  },
};
