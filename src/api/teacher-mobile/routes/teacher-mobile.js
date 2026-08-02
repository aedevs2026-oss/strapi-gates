'use strict';

const teacherPolicy = 'global::is-teacher-authenticated';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/teacher/dashboard',
      handler: 'teacher-mobile.getDashboard',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/classes',
      handler: 'teacher-mobile.getClasses',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/students',
      handler: 'teacher-mobile.getStudents',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/timetable',
      handler: 'teacher-mobile.getTimetable',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/attendance',
      handler: 'teacher-mobile.getAttendance',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'POST',
      path: '/teacher/attendance',
      handler: 'teacher-mobile.submitAttendance',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/homework',
      handler: 'teacher-mobile.getHomework',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'POST',
      path: '/teacher/homework',
      handler: 'teacher-mobile.createHomework',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/marks',
      handler: 'teacher-mobile.getMarks',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'POST',
      path: '/teacher/marks',
      handler: 'teacher-mobile.submitMarks',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/exams',
      handler: 'teacher-mobile.getExams',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/notifications',
      handler: 'teacher-mobile.getNotifications',
      config: { auth: false, policies: [teacherPolicy] },
    },
    {
      method: 'GET',
      path: '/teacher/profile',
      handler: 'teacher-mobile.getProfile',
      config: { auth: false, policies: [teacherPolicy] },
    },
  ],
};
