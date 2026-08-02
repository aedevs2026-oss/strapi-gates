'use strict';

const {
  buildPagination,
  buildSort,
  success,
  badRequest,
  forbidden,
  notFound,
  created,
} = require('../../../utils/api-response');
const {
  ensureClassAccess,
  ensureAssignmentAccess,
  ensureClassInchargeAccess,
  buildClassSubjectFilter,
  buildClassFilter,
  formatClass,
  formatSubject,
} = require('../../../utils/teacher-context');

const getTodayDayName = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

module.exports = {
  async getDashboard(ctx) {
    const { teacher, teacherContext } = ctx.state;
    const today = getTodayDayName();
    const classFilter = buildClassFilter(ctx);
    const { assignedClassIds } = ctx.state.teacherContext;

    const notificationFilters = {
      $or: [
        { target: 'all_teachers' },
        ...(assignedClassIds.length
          ? [{ target: 'specific_class', targetClass: { documentId: { $in: assignedClassIds } } }]
          : []),
      ],
    };

    const [todayTimetable, recentHomework, unreadNotifications] = await Promise.all([
      strapi.documents('api::timetable.timetable').findMany({
        filters: {
          $and: [{ day: today }, { teacher: { documentId: teacher.documentId } }, classFilter],
        },
        populate: ['class', 'subject'],
        sort: 'period:asc',
        limit: 20,
      }),
      strapi.documents('api::homework.homework').findMany({
        status: 'published',
        filters: {
          $and: [{ teacher: { documentId: teacher.documentId } }, buildClassSubjectFilter(ctx)],
        },
        populate: ['class', 'subject'],
        sort: 'dueDate:desc',
        limit: 5,
      }),
      strapi.documents('api::notification.notification').findMany({
        filters: notificationFilters,
        sort: 'sentDate:desc',
        limit: 5,
      }),
    ]);

    return success(ctx, {
      teacher: {
        documentId: teacher.documentId,
        name: teacher.name,
        employeeId: teacher.employeeId,
      },
      summary: {
        assignedClasses: teacherContext.assignedClasses.length,
        assignedSubjects: teacherContext.assignedSubjects.length,
        inchargeClasses: teacherContext.inchargeClassIds.length,
        todayPeriods: todayTimetable.length,
      },
      todayTimetable,
      recentHomework,
      notifications: unreadNotifications,
      assignedClasses: teacherContext.assignedClasses.map(formatClass),
    });
  },

  async getClasses(ctx) {
    const { teacherContext } = ctx.state;

    const classes = teacherContext.assignedClasses.map((cls) => ({
      ...formatClass(cls),
      isClassIncharge: teacherContext.inchargeClassIds.includes(cls.documentId),
      assignments: teacherContext.assignments
        .filter((a) => a.class?.documentId === cls.documentId)
        .map((a) => ({
          documentId: a.documentId,
          subject: a.subject ? formatSubject(a.subject) : null,
        })),
    }));

    return success(ctx, classes, { total: classes.length });
  },

  async getStudents(ctx) {
    const { classId } = ctx.query;
    const { inchargeClassIds } = ctx.state.teacherContext;

    // #region agent log
    const fs = require('fs');
    const path = require('path');
    try {
      fs.appendFileSync(
        path.join(process.cwd(), '..', 'debug-12d67a.log'),
        `${JSON.stringify({
          sessionId: '12d67a',
          timestamp: Date.now(),
          location: 'teacher-mobile.js:getStudents',
          message: 'students request',
          data: { classId: classId || null, inchargeClassCount: inchargeClassIds.length },
          hypothesisId: 'H1',
        })}\n`
      );
    } catch {
      // ignore
    }
    // #endregion

    if (!inchargeClassIds.length) {
      return forbidden(ctx, 'Student list is available only for class incharge teachers.');
    }

    let targetClassIds = inchargeClassIds;

    if (classId) {
      if (!ensureClassInchargeAccess(ctx, classId)) {
        return forbidden(ctx, 'Student list is available only for your incharge classes.');
      }
      targetClassIds = [classId];
    }

    const students = await strapi.documents('api::student.student').findMany({
      filters: { class: { documentId: { $in: targetClassIds } } },
      populate: ['photo', 'class', 'section'],
      sort: 'studentName:asc',
    });

    return success(ctx, students, { total: students.length, classIds: targetClassIds });
  },

  async getTimetable(ctx) {
    const { classId, day } = ctx.query;
    const { teacher } = ctx.state;
    const targetDay = (day || getTodayDayName()).toLowerCase();

    const filters = {
      day: targetDay,
      teacher: { documentId: teacher.documentId },
    };

    if (classId) {
      if (!ensureClassAccess(ctx, classId)) {
        return forbidden(ctx, 'Access denied for this class.');
      }
      filters.class = { documentId: classId };
    } else {
      filters.$and = [buildClassFilter(ctx)];
    }

    const timetable = await strapi.documents('api::timetable.timetable').findMany({
      filters,
      populate: ['class', 'subject'],
      sort: 'period:asc',
    });

    return success(ctx, timetable, { day: targetDay, total: timetable.length });
  },

  async getAttendance(ctx) {
    const { classId, date, from, to } = ctx.query;

    if (!classId) {
      return badRequest(ctx, 'classId is required.');
    }

    if (!ensureClassAccess(ctx, classId)) {
      return forbidden(ctx, 'Access denied for this class.');
    }

    const students = await strapi.documents('api::student.student').findMany({
      filters: { class: { documentId: classId } },
      populate: ['photo', 'section'],
      sort: 'studentName:asc',
    });

    const studentIds = students.map((s) => s.documentId);
    if (!studentIds.length) {
      return success(ctx, { students: [], records: [] });
    }

    const filters = { student: { documentId: { $in: studentIds } } };

    if (date) {
      filters.date = date;
    } else if (from || to) {
      filters.date = {};
      if (from) filters.date.$gte = from;
      if (to) filters.date.$lte = to;
    }

    const records = await strapi.documents('api::attendance.attendance').findMany({
      filters,
      populate: ['student'],
      sort: 'date:desc',
    });

    return success(ctx, { students, records }, { total: records.length });
  },

  async submitAttendance(ctx) {
    const { classId, date, entries } = ctx.request.body || {};

    if (!classId || !date || !Array.isArray(entries) || !entries.length) {
      return badRequest(ctx, 'classId, date, and entries are required.');
    }

    if (!ensureClassAccess(ctx, classId)) {
      return forbidden(ctx, 'Access denied for this class.');
    }

    const students = await strapi.documents('api::student.student').findMany({
      filters: { class: { documentId: classId } },
    });
    const allowedStudentIds = new Set(students.map((s) => s.documentId));

    const results = [];

    for (const entry of entries) {
      if (!entry.studentId || !entry.status) continue;
      if (!allowedStudentIds.has(entry.studentId)) {
        return forbidden(ctx, `Student ${entry.studentId} is not in this class.`);
      }

      const existing = await strapi.documents('api::attendance.attendance').findFirst({
        filters: {
          student: { documentId: entry.studentId },
          date,
        },
      });

      if (existing) {
        const updated = await strapi.documents('api::attendance.attendance').update({
          documentId: existing.documentId,
          data: {
            status: entry.status,
            remarks: entry.remarks || null,
          },
          populate: ['student'],
        });
        results.push(updated);
      } else {
        const createdRecord = await strapi.documents('api::attendance.attendance').create({
          data: {
            student: entry.studentId,
            date,
            status: entry.status,
            remarks: entry.remarks || null,
          },
          populate: ['student'],
        });
        results.push(createdRecord);
      }
    }

    return created(ctx, results, { total: results.length });
  },

  async getHomework(ctx) {
    const { classId, subjectId } = ctx.query;
    const { teacher } = ctx.state;
    const { start, limit } = buildPagination(ctx);

    const filters = {
      $and: [
        { teacher: { documentId: teacher.documentId } },
        buildClassSubjectFilter(ctx),
      ],
    };

    if (classId) {
      if (!ensureClassAccess(ctx, classId)) {
        return forbidden(ctx, 'Access denied for this class.');
      }
      filters.$and.push({ class: { documentId: classId } });
    }

    if (subjectId) {
      if (classId && !ensureAssignmentAccess(ctx, classId, subjectId)) {
        return forbidden(ctx, 'Access denied for this class and subject combination.');
      }
      filters.$and.push({ subject: { documentId: subjectId } });
    }

    const [data, total] = await Promise.all([
      strapi.documents('api::homework.homework').findMany({
        status: 'published',
        filters,
        populate: ['subject', 'class', 'attachmentPdf'],
        sort: buildSort(ctx, 'dueDate:desc'),
        start,
        limit,
      }),
      strapi.documents('api::homework.homework').count({
        status: 'published',
        filters,
      }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  async createHomework(ctx) {
    const { title, description, classId, subjectId, dueDate } = ctx.request.body || {};
    const { teacher } = ctx.state;

    if (!title || !classId || !subjectId || !dueDate) {
      return badRequest(ctx, 'title, classId, subjectId, and dueDate are required.');
    }

    if (!ensureAssignmentAccess(ctx, classId, subjectId)) {
      return forbidden(ctx, 'You are not assigned to this class and subject.');
    }

    const homework = await strapi.documents('api::homework.homework').create({
      data: {
        title,
        description,
        class: classId,
        subject: subjectId,
        teacher: teacher.documentId,
        dueDate,
        status: 'published',
      },
      status: 'published',
      populate: ['subject', 'class', 'teacher'],
    });

    return created(ctx, homework);
  },

  async getMarks(ctx) {
    const { classId, subjectId, examId } = ctx.query;

    if (!classId || !subjectId) {
      return badRequest(ctx, 'classId and subjectId are required.');
    }

    if (!ensureAssignmentAccess(ctx, classId, subjectId)) {
      return forbidden(ctx, 'Access denied for this class and subject combination.');
    }

    const students = await strapi.documents('api::student.student').findMany({
      filters: { class: { documentId: classId } },
      sort: 'studentName:asc',
    });
    const studentIds = students.map((s) => s.documentId);

    const filters = {
      student: { documentId: { $in: studentIds } },
      subject: { documentId: subjectId },
    };

    if (examId) {
      filters.exam = { documentId: examId };
    }

    const results = await strapi.documents('api::exam-result.exam-result').findMany({
      filters,
      populate: ['student', 'exam', 'subject'],
      sort: 'createdAt:desc',
    });

    return success(ctx, { students, results }, { total: results.length });
  },

  async submitMarks(ctx) {
    const { classId, subjectId, examId, entries } = ctx.request.body || {};

    if (!classId || !subjectId || !examId || !Array.isArray(entries)) {
      return badRequest(ctx, 'classId, subjectId, examId, and entries are required.');
    }

    if (!ensureAssignmentAccess(ctx, classId, subjectId)) {
      return forbidden(ctx, 'Access denied for this class and subject combination.');
    }

    const students = await strapi.documents('api::student.student').findMany({
      filters: { class: { documentId: classId } },
    });
    const allowedStudentIds = new Set(students.map((s) => s.documentId));

    const saved = [];

    for (const entry of entries) {
      if (!entry.studentId || entry.marks == null) continue;
      if (!allowedStudentIds.has(entry.studentId)) {
        return forbidden(ctx, `Student ${entry.studentId} is not in this class.`);
      }

      const existing = await strapi.documents('api::exam-result.exam-result').findFirst({
        filters: {
          student: { documentId: entry.studentId },
          exam: { documentId: examId },
          subject: { documentId: subjectId },
        },
      });

      const payload = {
        student: entry.studentId,
        exam: examId,
        subject: subjectId,
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        grade: entry.grade,
        remarks: entry.remarks,
      };

      if (existing) {
        const updated = await strapi.documents('api::exam-result.exam-result').update({
          documentId: existing.documentId,
          data: payload,
          status: 'published',
          populate: ['student', 'exam', 'subject'],
        });
        saved.push(updated);
      } else {
        const createdResult = await strapi.documents('api::exam-result.exam-result').create({
          data: payload,
          status: 'published',
          populate: ['student', 'exam', 'subject'],
        });
        saved.push(createdResult);
      }
    }

    return created(ctx, saved, { total: saved.length });
  },

  async getNotifications(ctx) {
    const { start, limit } = buildPagination(ctx);
    const { assignedClassIds } = ctx.state.teacherContext;

    const filters = {
      $or: [
        { target: 'all_teachers' },
        ...(assignedClassIds.length
          ? [{ target: 'specific_class', targetClass: { documentId: { $in: assignedClassIds } } }]
          : []),
      ],
    };

    const [data, total] = await Promise.all([
      strapi.documents('api::notification.notification').findMany({
        filters,
        populate: ['image'],
        sort: buildSort(ctx, 'sentDate:desc'),
        start,
        limit,
      }),
      strapi.documents('api::notification.notification').count({ filters }),
    ]);

    return success(ctx, data, { pagination: { start, limit, total } });
  },

  async getProfile(ctx) {
    const { teacher, teacherContext } = ctx.state;

    const profile = await strapi.documents('api::teacher.teacher').findOne({
      documentId: teacher.documentId,
      populate: ['photo', 'inchargeClasses', 'teacherAssignments'],
    });

    if (!profile) {
      return notFound(ctx, 'Teacher profile not found.');
    }

    return success(ctx, {
      ...profile,
      assignedClasses: teacherContext.assignedClasses.map(formatClass),
      assignedSubjects: teacherContext.assignedSubjects.map(formatSubject),
    });
  },

  async getExams(ctx) {
    const { classId } = ctx.query;

    if (!classId) {
      return badRequest(ctx, 'classId is required.');
    }

    if (!ensureClassAccess(ctx, classId)) {
      return forbidden(ctx, 'Access denied for this class.');
    }

    const exams = await strapi.documents('api::exam.exam').findMany({
      filters: { class: { documentId: classId } },
      populate: ['class', 'academicYear'],
      sort: 'createdAt:desc',
    });

    return success(ctx, exams, { total: exams.length });
  },
};
