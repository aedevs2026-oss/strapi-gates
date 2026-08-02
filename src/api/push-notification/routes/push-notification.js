'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/push/parent',
      handler: 'push-notification.sendToParent',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/push/all-parents',
      handler: 'push-notification.sendToAllParents',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/push/class',
      handler: 'push-notification.sendToClass',
      config: { auth: false },
    },
  ],
};
