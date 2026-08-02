'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/send-otp',
      handler: 'auth.sendOtp',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/verify-otp',
      handler: 'auth.verifyOtp',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'auth.refreshProfile',
      config: {
        auth: false,
        policies: ['global::is-parent-authenticated'],
      },
    },
    {
      method: 'PUT',
      path: '/auth/device-token',
      handler: 'auth.updateDeviceToken',
      config: {
        auth: false,
        policies: ['global::is-parent-authenticated'],
      },
    },
  ],
};
