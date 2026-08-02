'use strict';

const jwt = require('jsonwebtoken');

const getParentSecret = () => process.env.PARENT_JWT_SECRET || process.env.JWT_SECRET;
const getTeacherSecret = () => process.env.TEACHER_JWT_SECRET || process.env.JWT_SECRET;

const getParentExpiresIn = () => process.env.PARENT_JWT_EXPIRES_IN || '30d';
const getTeacherExpiresIn = () => process.env.TEACHER_JWT_EXPIRES_IN || '30d';

const signParentToken = (payload) => {
  return jwt.sign({ ...payload, type: 'parent' }, getParentSecret(), {
    expiresIn: getParentExpiresIn(),
  });
};

const verifyParentToken = (token) => {
  return jwt.verify(token, getParentSecret());
};

const signTeacherToken = (payload) => {
  return jwt.sign({ ...payload, type: 'teacher' }, getTeacherSecret(), {
    expiresIn: getTeacherExpiresIn(),
  });
};

const verifyTeacherToken = (token) => {
  return jwt.verify(token, getTeacherSecret());
};

const extractBearerToken = (ctx) => {
  const authHeader = ctx.request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

module.exports = {
  signParentToken,
  verifyParentToken,
  signTeacherToken,
  verifyTeacherToken,
  extractBearerToken,
};
