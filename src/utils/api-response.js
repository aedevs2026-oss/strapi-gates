'use strict';

const DEFAULT_POPULATE = {
  student: {
    populate: ['photo', 'class', 'parent'],
  },
  homework: {
    populate: ['subject', 'teacher', 'class', 'attachmentPdf'],
  },
  assignment: {
    populate: ['teacher', 'student', 'attachment'],
  },
  attendance: {
    populate: ['student'],
  },
  examSchedule: {
    populate: ['exam', 'subject'],
  },
  examResult: {
    populate: ['student', 'exam', 'subject'],
  },
  timetable: {
    populate: ['subject', 'teacher', 'class'],
  },
  circular: {
    populate: ['pdf', 'image'],
  },
  fee: {
    populate: ['student', 'academicYear'],
  },
  feePayment: {
    populate: ['student', 'receipt', 'fee'],
  },
  notification: {
    populate: ['image'],
  },
  gallery: {
    populate: ['images'],
  },
};

const getStudentIds = (parent) => {
  const students = parent.students || [];
  return students.map((s) => s.documentId);
};

const buildPagination = (ctx) => {
  const page = Math.max(1, parseInt(ctx.query.page || '1', 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(ctx.query.pageSize || ctx.query.pagination?.pageSize || '25', 10) || 25)
  );
  return { page, pageSize, start: (page - 1) * pageSize, limit: pageSize };
};

const buildSort = (ctx, defaultSort = 'createdAt:desc') => {
  return ctx.query.sort || defaultSort;
};

const success = (ctx, data, meta = {}) => {
  ctx.status = 200;
  ctx.body = { data, meta };
};

const created = (ctx, data, meta = {}) => {
  ctx.status = 201;
  ctx.body = { data, meta };
};

const badRequest = (ctx, message, details = null) => {
  ctx.status = 400;
  ctx.body = { error: { status: 400, name: 'BadRequestError', message, details } };
};

const unauthorized = (ctx, message = 'Unauthorized') => {
  ctx.status = 401;
  ctx.body = { error: { status: 401, name: 'UnauthorizedError', message } };
};

const forbidden = (ctx, message = 'Forbidden') => {
  ctx.status = 403;
  ctx.body = { error: { status: 403, name: 'ForbiddenError', message } };
};

const notFound = (ctx, message = 'Not found') => {
  ctx.status = 404;
  ctx.body = { error: { status: 404, name: 'NotFoundError', message } };
};

module.exports = {
  DEFAULT_POPULATE,
  getStudentIds,
  buildPagination,
  buildSort,
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
};
