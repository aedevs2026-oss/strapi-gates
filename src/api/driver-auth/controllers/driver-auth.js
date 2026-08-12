'use strict';

const { generateOtp, normalizeMobile, isValidMobile, getOtpExpiry } = require('../../../utils/otp');
const { signDriverToken } = require('../../../utils/jwt');
const { badRequest, success, unauthorized } = require('../../../utils/api-response');
const { isRateLimited, getClientIp } = require('../../../middlewares/rate-limit');
const { deliverOtp } = require('../../../utils/otp-delivery');

const MAX_OTP_ATTEMPTS = 5;

const buildLoginPayload = async (strapi, driverDocumentId) => {
  const driver = await strapi.documents('api::driver.driver').findOne({
    documentId: driverDocumentId,
    populate: {
      bus: {
        populate: ['route', 'school'],
      },
    },
  });

  const bus = driver.bus;
  const route = bus?.route;
  const school = bus?.school;

  return {
    driver: {
      documentId: driver.documentId,
      name: driver.name,
      mobile: driver.mobile,
      licenseNumber: driver.licenseNumber,
      status: driver.driverStatus,
    },
    bus: bus
      ? {
          documentId: bus.documentId,
          busNumber: bus.busNumber,
          registrationNumber: bus.registrationNumber,
        }
      : null,
    route: route
      ? {
          documentId: route.documentId,
          name: route.name,
          startPoint: route.startPoint,
          endPoint: route.endPoint,
        }
      : null,
    school: school
      ? {
          documentId: school.documentId,
          schoolName: school.schoolName,
        }
      : null,
  };
};

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

    if (isRateLimited(`driver-otp:${ip}:${normalized}`, windowMs, otpMax)) {
      return ctx.tooManyRequests('Too many OTP requests. Please try again later.');
    }

    const driver = await strapi.documents('api::driver.driver').findFirst({
      filters: { mobile: normalized },
    });

    if (!driver) {
      return badRequest(ctx, 'Mobile number is not registered. Please contact the school office.');
    }

    if (driver.driverStatus !== 'active') {
      return unauthorized(ctx, 'Your account is inactive. Please contact the school office.');
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

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
    const delivery = await deliverOtp({
      strapi,
      normalized,
      otp,
      expiryMinutes,
      logLabel: 'DRIVER',
    });

    if (delivery.error) {
      return ctx.internalServerError(delivery.error);
    }

    return success(ctx, {
      message: 'OTP sent successfully',
      mobileNumber: normalized,
      expiresInMinutes: expiryMinutes,
      ...(delivery.exposeOtpInResponse && { otp }),
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

    if (isRateLimited(`driver-verify:${ip}:${normalized}`, windowMs, verifyMax)) {
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

    const existingDriver = await strapi.documents('api::driver.driver').findFirst({
      filters: { mobile: normalized },
    });

    if (!existingDriver || existingDriver.driverStatus !== 'active') {
      return unauthorized(ctx, 'Driver account not found or inactive.');
    }

    const updateData = { lastLoginAt: new Date(), mobile: normalized };
    if (deviceToken) {
      updateData.deviceToken = deviceToken;
    }

    await strapi.documents('api::driver.driver').update({
      documentId: existingDriver.documentId,
      data: updateData,
    });

    const loginPayload = await buildLoginPayload(strapi, existingDriver.documentId);

    const token = signDriverToken({
      documentId: existingDriver.documentId,
      mobile: normalized,
    });

    return success(ctx, {
      jwt: token,
      ...loginPayload,
    });
  },

  async me(ctx) {
    const driver = ctx.state.driver;
    const loginPayload = await buildLoginPayload(strapi, driver.documentId);
    return success(ctx, loginPayload);
  },
};
