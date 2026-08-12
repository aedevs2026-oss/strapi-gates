'use strict';

const driverPolicy = 'global::is-driver-authenticated';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/live-locations',
      handler: 'live-location.create',
      config: { auth: false, policies: [driverPolicy] },
    },
    {
      method: 'GET',
      path: '/live-locations/active',
      handler: 'live-location.findActive',
      config: { auth: false },
    },
  ],
};
