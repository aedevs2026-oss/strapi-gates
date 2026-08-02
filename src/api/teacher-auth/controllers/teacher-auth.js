'use strict';

const { generateOtp, normalizeMobile, isValidMobile, getOtpExpiry } = require('../../../utils/otp');
const { signTeacherToken } = require('../../../utils/jwt');
const { badRequest, success, unauthorized } = require('../../../utils/api-response');
const { isRateLimited, getClientIp } = require('../../../middlewares/rate-limit');
const { sendOtpWhatsApp, isWhatsAppEnabled } = require('../../../services/whatsapp');
const {
  resolveTeacherRoles,
  resolvePrimaryRole,
  buildPermissionKeysForRoles,
  filterEnabledPermissions,
} = require('../../../utils/teacher-permissions');
const {
  loadTeacherContext,
  formatClass,
  formatSubject,
  formatAssignment,
} = require('../../../utils/teacher-context');

const MAX_OTP_ATTEMPTS = 5;

const buildLoginPayload = async (strapi, teacherDocumentId) => {
  const teacherContext = await loadTeacherContext(strapi, teacherDocumentId);
  const { teacher, assignments, inchargeClasses, assignedClasses, assignedSubjects } =
    teacherContext;

  const roles = resolveTeacherRoles({
    inchargeClassIds: teacherContext.inchargeClassIds,
    assignmentCount: assignments.length,
  });
  const primaryRole = resolvePrimaryRole(roles);
  const permissionKeys = buildPermissionKeysForRoles(roles);

  const dbPermissions = await strapi.documents('api::permission.permission').findMany({
    filters: { key: { $in: permissionKeys } },
  });

  const permissions = filterEnabledPermissions(permissionKeys, dbPermissions);

  return {
    teacher: {
      documentId: teacher.documentId,
      name: teacher.name,
      employeeId: teacher.employeeId,
      mobile: teacher.mobile,
      email: teacher.email,
      role: primaryRole.code,
      status: teacher.teacherStatus,
    },
    role: {
      name: primaryRole.name,
      code: primaryRole.code,
      roles: roles.map((r) => ({ name: r.name, code: r.code })),
    },
    permissions,
    assignedClasses: assignedClasses.map(formatClass),
    assignedSubjects: assignedSubjects.map(formatSubject),
    teacherAssignments: assignments.map(formatAssignment),
    inchargeClasses: inchargeClasses.map(formatClass),
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

    if (isRateLimited(`teacher-otp:${ip}:${normalized}`, windowMs, otpMax)) {
      return ctx.tooManyRequests('Too many OTP requests. Please try again later.');
    }

    const teacher = await strapi.documents('api::teacher.teacher').findFirst({
      filters: {
        $or: [{ mobile: normalized }, { phone: normalized }],
      },
    });

    if (!teacher) {
      return badRequest(ctx, 'Mobile number is not registered. Please contact the school office.');
    }

    if (teacher.teacherStatus !== 'active') {
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

    const devMode = process.env.OTP_DEV_MODE === 'true';
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);

    if (devMode) {
      strapi.log.info(`[DEV TEACHER OTP] ${normalized}: ${otp}`);
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
        `[TEACHER OTP] WhatsApp disabled. Set OTP_DEV_MODE=true for development. OTP for ${normalized}: ${otp}`
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

    if (isRateLimited(`teacher-verify:${ip}:${normalized}`, windowMs, verifyMax)) {
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

    const existingTeacher = await strapi.documents('api::teacher.teacher').findFirst({
      filters: {
        $or: [{ mobile: normalized }, { phone: normalized }],
      },
    });

    if (!existingTeacher || existingTeacher.teacherStatus !== 'active') {
      return unauthorized(ctx, 'Teacher account not found or inactive.');
    }

    const updateData = { lastLoginAt: new Date(), mobile: normalized };
    if (deviceToken) {
      updateData.deviceToken = deviceToken;
    }

    await strapi.documents('api::teacher.teacher').update({
      documentId: existingTeacher.documentId,
      data: updateData,
    });

    const loginPayload = await buildLoginPayload(strapi, existingTeacher.documentId);

    const token = signTeacherToken({
      documentId: existingTeacher.documentId,
      mobile: normalized,
    });

    return success(ctx, {
      jwt: token,
      ...loginPayload,
    });
  },

  async me(ctx) {
    const teacher = ctx.state.teacher;
    const loginPayload = await buildLoginPayload(strapi, teacher.documentId);
    return success(ctx, loginPayload);
  },

  async updateDeviceToken(ctx) {
    const teacher = ctx.state.teacher;
    const { deviceToken } = ctx.request.body || {};

    if (!deviceToken) {
      return badRequest(ctx, 'deviceToken is required');
    }

    await strapi.documents('api::teacher.teacher').update({
      documentId: teacher.documentId,
      data: { deviceToken },
    });

    return success(ctx, { message: 'Device token updated successfully' });
  },
};
