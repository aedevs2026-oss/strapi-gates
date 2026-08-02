'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/whatsapp/fee-reminder',
      handler: 'whatsapp-notification.sendFeeReminder',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/whatsapp/attendance-alert',
      handler: 'whatsapp-notification.sendAttendanceAlert',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/whatsapp/gate-entry',
      handler: 'whatsapp-notification.sendGateEntry',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/whatsapp/gate-exit',
      handler: 'whatsapp-notification.sendGateExit',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/whatsapp/circular',
      handler: 'whatsapp-notification.sendCircular',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/whatsapp/send',
      handler: 'whatsapp-notification.sendCustom',
      config: { auth: false },
    },
  ],
};
