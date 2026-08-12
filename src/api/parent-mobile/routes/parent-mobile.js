'use strict';

const parentPolicy = 'global::is-parent-authenticated';

module.exports = {
  routes: [
    { method: 'GET', path: '/parent/students', handler: 'parent-mobile.getStudents', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/students/:studentId', handler: 'parent-mobile.getStudentProfile', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/students/:studentId/bus-tracking', handler: 'parent-mobile.getStudentBusTracking', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/homework', handler: 'parent-mobile.getHomework', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/assignments', handler: 'parent-mobile.getAssignments', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/attendance', handler: 'parent-mobile.getAttendance', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/exam-schedules', handler: 'parent-mobile.getExamSchedules', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/exam-results', handler: 'parent-mobile.getExamResults', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/timetable', handler: 'parent-mobile.getTimetable', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/circulars', handler: 'parent-mobile.getCirculars', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/holidays', handler: 'parent-mobile.getHolidays', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/fees', handler: 'parent-mobile.getFees', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/fees/pending', handler: 'parent-mobile.getPendingFees', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/fees/history', handler: 'parent-mobile.getFeeHistory', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/notifications', handler: 'parent-mobile.getNotifications', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/school', handler: 'parent-mobile.getSchoolInfo', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/contacts', handler: 'parent-mobile.getContactDetails', config: { auth: false, policies: [parentPolicy] } },
    { method: 'GET', path: '/parent/gallery', handler: 'parent-mobile.getGallery', config: { auth: false, policies: [parentPolicy] } },
  ],
};
