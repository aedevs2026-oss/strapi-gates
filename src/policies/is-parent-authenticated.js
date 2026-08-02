'use strict';

const { verifyParentToken, extractBearerToken } = require('../utils/jwt');
const { debugLog } = require('../utils/debug-log');

module.exports = async (policyContext, config, { strapi }) => {
  // Strapi v5 merges the Koa ctx into policyContext (no nested .ctx property)
  const ctx = policyContext;
  const token = extractBearerToken(ctx);

  if (!token) {
    debugLog(
      'is-parent-authenticated.js',
      'policy denied - no token',
      { path: ctx.request.path },
      'H2'
    );
    return false;
  }

  try {
    const decoded = verifyParentToken(token);

    if (decoded.type && decoded.type !== 'parent') {
      debugLog(
        'is-parent-authenticated.js',
        'policy denied - invalid token type',
        { path: ctx.request.path, tokenType: decoded.type },
        'H2'
      );
      return false;
    }

    if (!decoded.documentId) {
      return false;
    }

    const parent = await strapi.documents('api::parent.parent').findOne({
      documentId: decoded.documentId,
      populate: {
        students: {
          populate: ['class', 'section'],
        },
      },
    });

    if (!parent || parent.blocked) {
      debugLog(
        'is-parent-authenticated.js',
        'policy denied - parent missing or blocked',
        { path: ctx.request.path, hasParent: Boolean(parent), blocked: parent?.blocked },
        'H2'
      );
      return false;
    }

    if (decoded.mobileNumber && parent.mobileNumber !== decoded.mobileNumber) {
      debugLog(
        'is-parent-authenticated.js',
        'policy denied - token mobile mismatch',
        { path: ctx.request.path },
        'H2'
      );
      return false;
    }

    ctx.state.parent = parent;
    ctx.state.parentJwt = decoded;
    debugLog(
      'is-parent-authenticated.js',
      'policy passed',
      {
        path: ctx.request.path,
        parentDocumentId: parent.documentId,
        studentCount: parent.students?.length || 0,
      },
      'H2'
    );
    return true;
  } catch (error) {
    strapi.log.debug('Parent auth policy failed:', error.message);
    debugLog(
      'is-parent-authenticated.js',
      'policy error',
      { path: ctx.request.path, errorMessage: error.message },
      'H1,H2'
    );
    return false;
  }
};
