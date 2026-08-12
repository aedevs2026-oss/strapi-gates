'use strict';

const {
  getStudentIds,
  buildPagination,
  buildSort,
  success,
  badRequest,
  forbidden,
  notFound,
} = require('../../../utils/api-response');
const { formatLocationPayload } = require('../../../utils/transport');

const ensureStudentAccess = (parent, studentDocumentId) => {
  const studentIds = getStudentIds(parent);
  if (!studentIds.includes(studentDocumentId)) {
    return false;
  }
  return true;
};

const emptyList = (ctx, meta = {}) => success(ctx, [], meta);

const paginatedEmpty = (ctx, start, limit, extra = {}) =>
  success(ctx, [], { pagination: { start, limit, total: 0, page: 1 }, ...extra });

module.exports = {
  async getStudents(ctx) {
    const parent = ctx.state.parent;
    const students = await strapi.documents('api::student.student').findMany({
      filters: { parent: { documentId: parent.documentId } },
      populate: ['photo', 'class', 'section'],
      sort: 'studentName:asc',
    });

    return success(ctx, students, { total: students.length });
  },

  async getStudentProfile(ctx) {
    const { studentId } = ctx.params;
    const parent = ctx.state.parent;

    if (!ensureStudentAccess(parent, studentId)) {
      return forbidden(ctx, 'You do not have access to this student profile.');
    }

    const student = await strapi.documents('api::student.student').findOne({
      documentId: studentId,
      populate: {
        photo: true,
        class: true,
        section: true,
        parent: true,
        bus: { populate: ['route'] },
      },
    });

    if (!student) {
      return notFound(ctx, 'Student not found.');
    }

    return success(ctx, student);
  },

  async getHomework(ctx) {
    const parent = ctx.state.parent;
    const { studentId } = ctx.query;
    const { start, limit } = buildPagination(ctx);
    const sort = buildSort(ctx, 'dueDate:desc');

    let classIds = [];
    if (studentId) {
      if (!ensureStudentAccess(parent, studentId)) {
        return forbidden(ctx, 'Access denied.');
      }
      const student = await strapi.documents('api::student.student').findOne({
        documentId: studentId,
        populate: ['class'],
      });
      if (student?.class?.documentId) {
        classIds = [student.class.documentId];
      }
    } else {
      const students = parent.students || [];
      classIds = [...new Set(students.map((s) => s.class?.documentId).filter(Boolean))];
    }

    if (!classIds.length) {
      return success(ctx, [], { pagination: { start, limit, total: 0 } });
    }

    const homeworkFilters = {
      class: { documentId: { $in: classIds } },
      status: { $in: ['published', 'closed'] },
    };

    const [data, total] = await Promise.all([
      strapi.documents('api::homework.homework').findMany({
        status: 'published',
        filters: homeworkFilters,
        populate: ['subject', 'teacher', 'class', 'attachmentPdf'],
        sort,
        start,
        limit,
      }),
      strapi.documents('api::homework.homework').count({
        status: 'published',
        filters: homeworkFilters,
      }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total, page: Math.floor(start / limit) + 1 } });
  },

  async getAssignments(ctx) {
    const parent = ctx.state.parent;
    const { studentId } = ctx.query;
    const studentIds = studentId ? [studentId] : getStudentIds(parent);

    if (studentId && !ensureStudentAccess(parent, studentId)) {
      return forbidden(ctx, 'Access denied.');
    }

    const { start, limit } = buildPagination(ctx);
    const sort = buildSort(ctx, 'submissionDate:desc');

    if (!studentIds.length) {
      return paginatedEmpty(ctx, start, limit);
    }

    const filters = { student: { documentId: { $in: studentIds } } };

    const [data, total] = await Promise.all([
      strapi.documents('api::assignment.assignment').findMany({
        filters,
        populate: ['teacher', 'student', 'attachment'],
        sort,
        start,
        limit,
      }),
      strapi.documents('api::assignment.assignment').count({ filters }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  async getAttendance(ctx) {
    const parent = ctx.state.parent;
    const { studentId, from, to, status } = ctx.query;

    if (!studentId || !ensureStudentAccess(parent, studentId)) {
      return badRequest(ctx, 'Valid studentId is required.');
    }

    const { start, limit } = buildPagination(ctx);
    const filters = { student: { documentId: studentId } };

    if (from || to) {
      filters.date = {};
      if (from) filters.date.$gte = from;
      if (to) filters.date.$lte = to;
    }
    if (status) filters.status = status;

    const [data, total] = await Promise.all([
      strapi.documents('api::attendance.attendance').findMany({
        filters,
        populate: ['student'],
        sort: buildSort(ctx, 'date:desc'),
        start,
        limit,
      }),
      strapi.documents('api::attendance.attendance').count({ filters }),
    ]);

    const summary = await strapi.documents('api::attendance.attendance').findMany({
      filters: { student: { documentId: studentId } },
    });

    const stats = summary.reduce(
      (acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, half_day: 0, leave: 0, total: 0 }
    );

    return success(ctx, data, { pagination: { start, limit, total }, stats });
  },

  async getExamSchedules(ctx) {
    const parent = ctx.state.parent;
    const { studentId } = ctx.query;

    if (!studentId || !ensureStudentAccess(parent, studentId)) {
      return badRequest(ctx, 'Valid studentId is required.');
    }

    const student = await strapi.documents('api::student.student').findOne({
      documentId: studentId,
      populate: ['class'],
    });

    if (!student?.class?.documentId) {
      return success(ctx, []);
    }

    const exams = await strapi.documents('api::exam.exam').findMany({
      filters: { class: { documentId: student.class.documentId } },
    });

    const examIds = exams.map((e) => e.documentId);
    if (!examIds.length) {
      return success(ctx, []);
    }

    const schedules = await strapi.documents('api::exam-schedule.exam-schedule').findMany({
      filters: { exam: { documentId: { $in: examIds } } },
      populate: ['exam', 'subject'],
      sort: 'date:asc',
    });

    return success(ctx, schedules);
  },

  async getExamResults(ctx) {
    const parent = ctx.state.parent;
    const { studentId, examId } = ctx.query;

    if (!studentId || !ensureStudentAccess(parent, studentId)) {
      return badRequest(ctx, 'Valid studentId is required.');
    }

    const filters = { student: { documentId: studentId } };
    if (examId) filters.exam = { documentId: examId };

    const results = await strapi.documents('api::exam-result.exam-result').findMany({
      status: 'published',
      filters,
      populate: ['exam', 'subject', 'student'],
      sort: 'createdAt:desc',
    });

    return success(ctx, results);
  },

  async getTimetable(ctx) {
    const parent = ctx.state.parent;
    const { studentId, day } = ctx.query;

    if (!studentId || !ensureStudentAccess(parent, studentId)) {
      return badRequest(ctx, 'Valid studentId is required.');
    }

    const student = await strapi.documents('api::student.student').findOne({
      documentId: studentId,
      populate: ['class'],
    });

    if (!student?.class?.documentId) {
      return success(ctx, []);
    }

    const filters = { class: { documentId: student.class.documentId } };
    if (day) filters.day = day;

    const timetable = await strapi.documents('api::timetable.timetable').findMany({
      filters,
      populate: ['subject', 'teacher', 'class'],
      sort: ['day:asc', 'period:asc'],
    });

    return success(ctx, timetable);
  },

  async getCirculars(ctx) {
    const parent = ctx.state.parent;
    const { start, limit } = buildPagination(ctx);
    const classIds = [...new Set((parent.students || []).map((s) => s.class?.documentId).filter(Boolean))];

    const filters = {
      $or: [
        { target: { $in: ['all', 'parents'] } },
        ...(classIds.length
          ? [{ target: 'specific_class', targetClass: { documentId: { $in: classIds } } }]
          : []),
      ],
    };

    const [data, total] = await Promise.all([
      strapi.documents('api::circular.circular').findMany({
        status: 'published',
        filters,
        populate: ['pdf', 'image', 'targetClass'],
        sort: buildSort(ctx, 'publishDate:desc'),
        start,
        limit,
      }),
      strapi.documents('api::circular.circular').count({
        status: 'published',
        filters,
      }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  async getHolidays(ctx) {
    const { from, to } = ctx.query;
    const filters = {};
    if (from || to) {
      filters.date = {};
      if (from) filters.date.$gte = from;
      if (to) filters.date.$lte = to;
    }

    const holidays = await strapi.documents('api::holiday.holiday').findMany({
      filters,
      sort: 'date:asc',
    });

    return success(ctx, holidays);
  },

  async getFees(ctx) {
    const parent = ctx.state.parent;
    const { studentId, status } = ctx.query;
    const studentIds = studentId ? [studentId] : getStudentIds(parent);

    if (studentId && !ensureStudentAccess(parent, studentId)) {
      return forbidden(ctx, 'Access denied.');
    }

    if (!studentIds.length) {
      return emptyList(ctx);
    }

    const filters = { student: { documentId: { $in: studentIds } } };
    if (status) filters.status = status;

    const fees = await strapi.documents('api::fee.fee').findMany({
      filters,
      populate: ['student', 'academicYear', 'payments'],
      sort: 'dueDate:asc',
    });

    return success(ctx, fees);
  },

  async getPendingFees(ctx) {
    const parent = ctx.state.parent;
    const { studentId } = ctx.query;
    const studentIds = studentId ? [studentId] : getStudentIds(parent);

    if (studentId && !ensureStudentAccess(parent, studentId)) {
      return forbidden(ctx, 'Access denied.');
    }

    if (!studentIds.length) {
      return success(ctx, [], { totalPending: 0 });
    }

    const fees = await strapi.documents('api::fee.fee').findMany({
      filters: {
        student: { documentId: { $in: studentIds } },
        status: { $in: ['pending', 'partial', 'overdue'] },
      },
      populate: ['student', 'academicYear'],
      sort: 'dueDate:asc',
    });

    const totalPending = fees.reduce((sum, f) => sum + parseFloat(f.pendingAmount || 0), 0);

    return success(ctx, fees, { totalPending });
  },

  async getFeeHistory(ctx) {
    const parent = ctx.state.parent;
    const { studentId } = ctx.query;
    const studentIds = studentId ? [studentId] : getStudentIds(parent);

    if (studentId && !ensureStudentAccess(parent, studentId)) {
      return forbidden(ctx, 'Access denied.');
    }

    const { start, limit } = buildPagination(ctx);

    if (!studentIds.length) {
      return paginatedEmpty(ctx, start, limit);
    }

    const filters = {
      student: { documentId: { $in: studentIds } },
      status: 'success',
    };

    const [data, total] = await Promise.all([
      strapi.documents('api::fee-payment.fee-payment').findMany({
        filters,
        populate: ['student', 'fee', 'receipt'],
        sort: 'paymentDate:desc',
        start,
        limit,
      }),
      strapi.documents('api::fee-payment.fee-payment').count({ filters }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  async getNotifications(ctx) {
    const parent = ctx.state.parent;
    const { start, limit } = buildPagination(ctx);
    const classIds = [...new Set((parent.students || []).map((s) => s.class?.documentId).filter(Boolean))];

    const filters = {
      $or: [
        { target: 'all_parents' },
        { targetParent: { documentId: parent.documentId } },
        ...(classIds.length
          ? [{ target: 'specific_class', targetClass: { documentId: { $in: classIds } } }]
          : []),
      ],
    };

    const [data, total] = await Promise.all([
      strapi.documents('api::notification.notification').findMany({
        filters,
        populate: ['image'],
        sort: 'sentDate:desc',
        start,
        limit,
      }),
      strapi.documents('api::notification.notification').count({ filters }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  async getSchoolInfo(ctx) {
    let school = null;
    try {
      school = await strapi.documents('api::school.school').findFirst({
        populate: ['logo'],
      });
    } catch (error) {
      strapi.log.warn('[parent-mobile] getSchoolInfo populate failed, retrying without logo:', error.message);
      school = await strapi.documents('api::school.school').findFirst();
    }

    return success(ctx, school || {});
  },

  async getContactDetails(ctx) {
    const contacts = await strapi.documents('api::contact-detail.contact-detail').findMany({
      sort: 'sortOrder:asc',
    });

    contacts.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

    return success(ctx, contacts);
  },

  async getGallery(ctx) {
    const { start, limit } = buildPagination(ctx);

    const [data, total] = await Promise.all([
      strapi.documents('api::gallery.gallery').findMany({
        status: 'published',
        populate: ['images', 'coverImage'],
        sort: 'eventDate:desc',
        start,
        limit,
      }),
      strapi.documents('api::gallery.gallery').count({ status: 'published' }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  /**
   * GET /api/parent/students/:studentId/bus-tracking
   * Returns assigned bus, route, driver, and latest live location for the child's bus.
   */
  async getStudentBusTracking(ctx) {
    const { studentId } = ctx.params;
    const parent = ctx.state.parent;

    if (!ensureStudentAccess(parent, studentId)) {
      return forbidden(ctx, 'You do not have access to this student.');
    }

    const student = await strapi.documents('api::student.student').findOne({
      documentId: studentId,
      populate: {
        bus: {
          populate: {
            route: true,
            driver: true,
          },
        },
      },
    });

    if (!student) {
      return notFound(ctx, 'Student not found.');
    }

    if (!student.bus) {
      return success(ctx, {
        assigned: false,
        student: {
          documentId: student.documentId,
          name: student.studentName,
        },
        message: 'No school bus assigned to this student.',
      });
    }

    const bus = student.bus;
    const route = bus.route;
    const driver = bus.driver;

    const runningTrip = await strapi.documents('api::trip.trip').findFirst({
      filters: {
        bus: { documentId: bus.documentId },
        status: 'Running',
      },
      sort: 'startTime:desc',
    });

    let location = null;
    if (runningTrip) {
      const latest = await strapi.documents('api::live-location.live-location').findFirst({
        filters: { trip: { documentId: runningTrip.documentId } },
        sort: 'timestamp:desc',
      });

      if (latest) {
        location = formatLocationPayload(latest, driver, bus, route, runningTrip);
      }
    }

    return success(ctx, {
      assigned: true,
      student: {
        documentId: student.documentId,
        name: student.studentName,
      },
      bus: {
        documentId: bus.documentId,
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
      },
      route: route
        ? {
            documentId: route.documentId,
            name: route.name,
            startPoint: route.startPoint,
            endPoint: route.endPoint,
          }
        : null,
      driver: driver
        ? {
            documentId: driver.documentId,
            name: driver.name,
          }
        : null,
      trip: runningTrip
        ? {
            documentId: runningTrip.documentId,
            status: runningTrip.status,
            startTime: runningTrip.startTime,
            distance: Number(runningTrip.distance || 0),
          }
        : null,
      location,
      isLive: Boolean(runningTrip && location),
    });
  },
};
