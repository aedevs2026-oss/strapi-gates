'use strict';

const path = require('path');

require(path.join(process.cwd(), 'config', 'puppeteer-env')).configurePuppeteerEnv();

const ADMIN_ROLES = [
  {
    name: 'Principal',
    code: 'principal',
    description: 'School principal with full academic access',
  },
  {
    name: 'Teacher',
    code: 'teacher',
    description: 'Teaching staff with class and student management access',
  },
  {
    name: 'Office Staff',
    code: 'office-staff',
    description: 'Office staff with student and parent management access',
  },
  {
    name: 'Accountant',
    code: 'accountant',
    description: 'Finance team with fee and payment management access',
  },
];

const setupAdminRoles = async (strapi) => {
  const roleService = strapi.admin.services.role;
  const permissionService = strapi.admin.services.permission;

  const pickPermissionFields = (permission) => ({
    action: permission.action,
    subject: permission.subject,
    properties: permission.properties,
    conditions: permission.conditions,
    actionParameters: permission.actionParameters,
  });

  for (const roleDef of ADMIN_ROLES) {
    const existing = await roleService.find({ code: roleDef.code });
    if (existing?.length) continue;

    const role = await roleService.create({
      name: roleDef.name,
      code: roleDef.code,
      description: roleDef.description,
    });

    strapi.log.info(`Created admin role: ${roleDef.name}`);

    const permissions = await permissionService.findMany({
      where: { role: { $null: true } },
    });

    if (roleDef.code === 'accountant') {
      const financeActions = permissions.filter(
        (p) =>
          p.action.includes('fee') ||
          p.action.includes('fee-payment') ||
          p.action.includes('student') ||
          p.action.includes('parent')
      );
      await roleService.assignPermissions(role.id, financeActions.map(pickPermissionFields));
    } else if (roleDef.code === 'teacher') {
      const teacherActions = permissions.filter(
        (p) =>
          p.action.includes('homework') ||
          p.action.includes('assignment') ||
          p.action.includes('attendance') ||
          p.action.includes('timetable') ||
          p.action.includes('exam') ||
          p.action.includes('student') ||
          p.action.includes('upload')
      );
      await roleService.assignPermissions(role.id, teacherActions.map(pickPermissionFields));
    } else if (roleDef.code === 'principal') {
      await roleService.assignPermissions(role.id, permissions.map(pickPermissionFields));
    }
  }
};

const cleanupExpiredOtps = async (strapi) => {
  try {
    const expired = await strapi.documents('api::otp-record.otp-record').findMany({
      filters: { expiresAt: { $lt: new Date().toISOString() } },
    });

    for (const record of expired) {
      await strapi.documents('api::otp-record.otp-record').delete({
        documentId: record.documentId,
      });
    }
  } catch (error) {
    strapi.log.warn('OTP cleanup skipped:', error.message);
  }
};

const { PERMISSION_SEED } = require('./utils/teacher-permissions');

const seedTeacherPermissions = async (strapi) => {
  for (const perm of PERMISSION_SEED) {
    const existing = await strapi.documents('api::permission.permission').findFirst({
      filters: { key: perm.key },
    });

    if (existing) continue;

    await strapi.documents('api::permission.permission').create({
      data: {
        name: perm.name,
        key: perm.key,
        enabled: true,
      },
    });
  }
};

module.exports = {
  register({ strapi }) {
    strapi.customSchoolErp = {
      brandColors: {
        primary: '#5E2A84',
        secondary: '#F4B400',
        white: '#FFFFFF',
      },
    };
  },

  async bootstrap({ strapi }) {
    await setupAdminRoles(strapi);
    await seedTeacherPermissions(strapi);
    await cleanupExpiredOtps(strapi);

    setInterval(() => cleanupExpiredOtps(strapi), 15 * 60 * 1000);

    strapi.log.info('School ERP backend initialized');
  },
};
