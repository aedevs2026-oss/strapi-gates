'use strict';

const { verifyDriverToken, extractBearerToken } = require('../utils/jwt');

module.exports = async (policyContext, config, { strapi }) => {
  const ctx = policyContext;
  const token = extractBearerToken(ctx);

  if (!token) {
    return false;
  }

  try {
    const decoded = verifyDriverToken(token);

    if (decoded.type !== 'driver') {
      return false;
    }

    if (!decoded.documentId) {
      return false;
    }

    const driver = await strapi.documents('api::driver.driver').findOne({
      documentId: decoded.documentId,
      populate: {
        bus: {
          populate: ['route', 'school'],
        },
      },
    });

    if (!driver || driver.driverStatus !== 'active') {
      return false;
    }

    if (decoded.mobile && driver.mobile !== decoded.mobile) {
      return false;
    }

    ctx.state.driver = driver;
    ctx.state.driverJwt = decoded;
    return true;
  } catch (error) {
    strapi.log.debug('Driver auth policy failed:', error.message);
    return false;
  }
};
