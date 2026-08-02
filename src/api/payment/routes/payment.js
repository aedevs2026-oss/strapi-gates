'use strict';

const parentPolicy = 'global::is-parent-authenticated';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/payment/create-order',
      handler: 'payment.createOrder',
      config: { auth: false, policies: [parentPolicy] },
    },
    {
      method: 'POST',
      path: '/payment/verify',
      handler: 'payment.verifyPayment',
      config: { auth: false, policies: [parentPolicy] },
    },
  ],
};
