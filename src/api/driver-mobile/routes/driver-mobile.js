'use strict';

const driverPolicy = 'global::is-driver-authenticated';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/driver/profile',
      handler: 'driver-mobile.getProfile',
      config: { auth: false, policies: [driverPolicy] },
    },
    {
      method: 'POST',
      path: '/trips/start',
      handler: 'driver-mobile.startTrip',
      config: { auth: false, policies: [driverPolicy] },
    },
    {
      method: 'POST',
      path: '/trips/:tripId/end',
      handler: 'driver-mobile.endTrip',
      config: { auth: false, policies: [driverPolicy] },
    },
    {
      method: 'GET',
      path: '/trips/active',
      handler: 'driver-mobile.getActiveTrip',
      config: { auth: false, policies: [driverPolicy] },
    },
  ],
};
