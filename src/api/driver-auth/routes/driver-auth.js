'use strict';

const driverPolicy = 'global::is-driver-authenticated';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/driver-auth/send-otp',
      handler: 'driver-auth.sendOtp',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/driver-auth/verify-otp',
      handler: 'driver-auth.verifyOtp',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/driver-auth/me',
      handler: 'driver-auth.me',
      config: { auth: false, policies: [driverPolicy] },
    },
  ],
};
