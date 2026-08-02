'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/status',
    handler: 'whatsapp.getStatus',
    config: { policies: [] },
  },
  {
    method: 'POST',
    path: '/connect',
    handler: 'whatsapp.connect',
    config: { policies: [] },
  },
  {
    method: 'POST',
    path: '/disconnect',
    handler: 'whatsapp.disconnect',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/stats',
    handler: 'whatsapp.getStats',
    config: { policies: [] },
  },
  {
    method: 'GET',
    path: '/logs',
    handler: 'whatsapp.getLogs',
    config: { policies: [] },
  },
];
