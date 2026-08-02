'use strict';

const getActiveAcademicYear = async (strapi) => {
  const active = await strapi.documents('api::academic-year.academic-year').findFirst({
    filters: { status: 'active' },
    sort: 'startDate:desc',
  });

  if (active) return active;

  return strapi.documents('api::academic-year.academic-year').findFirst({
    sort: 'startDate:desc',
  });
};

const loadTeacherContext = async (strapi, teacherDocumentId) => {
  const teacher = await strapi.documents('api::teacher.teacher').findOne({
    documentId: teacherDocumentId,
    populate: {
      inchargeClasses: true,
      teacherAssignments: {
        populate: ['class', 'subject', 'academicYear'],
      },
    },
  });

  if (!teacher) {
    return null;
  }

  const activeYear = await getActiveAcademicYear(strapi);
  const activeYearId = activeYear?.documentId;

  const allAssignments = teacher.teacherAssignments || [];
  const assignments = activeYearId
    ? allAssignments.filter((a) => a.academicYear?.documentId === activeYearId)
    : allAssignments;

  const inchargeClasses = teacher.inchargeClasses || [];
  const inchargeClassIds = inchargeClasses.map((c) => c.documentId);

  const legacyInchargeClasses = await strapi.documents('api::class.class').findMany({
    filters: { classTeacher: { documentId: teacherDocumentId } },
  });

  for (const cls of legacyInchargeClasses) {
    if (!inchargeClassIds.includes(cls.documentId)) {
      inchargeClasses.push(cls);
      inchargeClassIds.push(cls.documentId);
    }
  }

  const assignedClassesMap = new Map();
  const assignedSubjectsMap = new Map();
  const assignmentPairs = [];

  for (const assignment of assignments) {
    const classId = assignment.class?.documentId;
    const subjectId = assignment.subject?.documentId;

    if (classId) {
      assignedClassesMap.set(classId, assignment.class);
    }
    if (subjectId) {
      assignedSubjectsMap.set(subjectId, assignment.subject);
    }
    if (classId && subjectId) {
      assignmentPairs.push({ classId, subjectId, assignment });
    }
  }

  for (const cls of inchargeClasses) {
    assignedClassesMap.set(cls.documentId, cls);
  }

  const assignedClassIds = [...assignedClassesMap.keys()];
  const assignedSubjectIds = [...assignedSubjectsMap.keys()];

  return {
    teacher,
    activeYear,
    assignments,
    inchargeClasses,
    inchargeClassIds,
    assignedClasses: [...assignedClassesMap.values()],
    assignedSubjects: [...assignedSubjectsMap.values()],
    assignedClassIds,
    assignedSubjectIds,
    assignmentPairs,
    isClassIncharge: inchargeClassIds.length > 0,
    hasSubjectAssignments: assignments.length > 0,
  };
};

const ensureClassAccess = (ctx, classDocumentId) => {
  const { assignedClassIds, inchargeClassIds } = ctx.state.teacherContext;

  if (!assignedClassIds.includes(classDocumentId)) {
    return false;
  }

  return true;
};

const ensureAssignmentAccess = (ctx, classDocumentId, subjectDocumentId) => {
  const { assignmentPairs, inchargeClassIds } = ctx.state.teacherContext;

  if (inchargeClassIds.includes(classDocumentId)) {
    return true;
  }

  return assignmentPairs.some(
    (pair) => pair.classId === classDocumentId && pair.subjectId === subjectDocumentId
  );
};

const ensureClassInchargeAccess = (ctx, classDocumentId) => {
  const { inchargeClassIds } = ctx.state.teacherContext;
  return inchargeClassIds.includes(classDocumentId);
};

const buildClassSubjectFilter = (ctx) => {
  const { assignmentPairs, inchargeClassIds } = ctx.state.teacherContext;
  const orFilters = [];

  for (const pair of assignmentPairs) {
    orFilters.push({
      class: { documentId: pair.classId },
      subject: { documentId: pair.subjectId },
    });
  }

  for (const classId of inchargeClassIds) {
    orFilters.push({ class: { documentId: classId } });
  }

  return orFilters.length ? { $or: orFilters } : { documentId: { $in: [] } };
};

const buildClassFilter = (ctx) => {
  const { assignedClassIds } = ctx.state.teacherContext;
  return assignedClassIds.length
    ? { documentId: { $in: assignedClassIds } }
    : { documentId: { $in: [] } };
};

const formatClass = (cls) => ({
  documentId: cls.documentId,
  className: cls.className,
  section: cls.section,
});

const formatSubject = (subject) => ({
  documentId: subject.documentId,
  subjectName: subject.subjectName || subject.name,
  code: subject.code,
});

const formatAssignment = (assignment) => ({
  documentId: assignment.documentId,
  class: assignment.class ? formatClass(assignment.class) : null,
  subject: assignment.subject ? formatSubject(assignment.subject) : null,
  academicYear: assignment.academicYear
    ? {
        documentId: assignment.academicYear.documentId,
        name: assignment.academicYear.name,
      }
    : null,
});

module.exports = {
  getActiveAcademicYear,
  loadTeacherContext,
  ensureClassAccess,
  ensureAssignmentAccess,
  ensureClassInchargeAccess,
  buildClassSubjectFilter,
  buildClassFilter,
  formatClass,
  formatSubject,
  formatAssignment,
};
