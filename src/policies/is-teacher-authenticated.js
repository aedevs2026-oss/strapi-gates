'use strict';

const { verifyTeacherToken, extractBearerToken } = require('../utils/jwt');
const { loadTeacherContext } = require('../utils/teacher-context');

module.exports = async (policyContext, config, { strapi }) => {
  const ctx = policyContext;
  const token = extractBearerToken(ctx);

  if (!token) {
    return false;
  }

  try {
    const decoded = verifyTeacherToken(token);

    if (decoded.type !== 'teacher') {
      return false;
    }

    if (!decoded.documentId) {
      return false;
    }

    const teacher = await strapi.documents('api::teacher.teacher').findOne({
      documentId: decoded.documentId,
    });

    if (!teacher || teacher.teacherStatus !== 'active') {
      return false;
    }

    if (decoded.mobile && teacher.mobile !== decoded.mobile) {
      return false;
    }

    const teacherContext = await loadTeacherContext(strapi, teacher.documentId);

    if (!teacherContext) {
      return false;
    }

    ctx.state.teacher = teacher;
    ctx.state.teacherJwt = decoded;
    ctx.state.teacherContext = teacherContext;
    return true;
  } catch (error) {
    strapi.log.debug('Teacher auth policy failed:', error.message);
    return false;
  }
};
