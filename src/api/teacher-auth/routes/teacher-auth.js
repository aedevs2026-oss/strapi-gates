'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/teacher-auth/send-otp',
      handler: 'teacher-auth.sendOtp',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/teacher-auth/verify-otp',
      handler: 'teacher-auth.verifyOtp',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/teacher-auth/me',
      handler: 'teacher-auth.me',
      config: {
        auth: false,
        policies: ['global::is-teacher-authenticated'],
      },
    },
    {
      method: 'PUT',
      path: '/teacher-auth/device-token',
      handler: 'teacher-auth.updateDeviceToken',
      config: {
        auth: false,
        policies: ['global::is-teacher-authenticated'],
      },
    },
  ],
};
