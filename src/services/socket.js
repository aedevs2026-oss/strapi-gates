'use strict';

const { Server } = require('socket.io');

let io = null;

/**
 * Attach Socket.IO to the Strapi HTTP server for real-time location broadcasts.
 */
const initSocketServer = (strapi) => {
  if (io) {
    return io;
  }

  const httpServer = strapi.server.httpServer;
  if (!httpServer) {
    strapi.log.warn('Socket.IO: HTTP server not available');
    return null;
  }

  io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    strapi.log.debug(`Socket connected: ${socket.id}`);
    socket.on('join:admin', () => {
      socket.join('admin');
    });

    // Parents subscribe to a specific bus only
    socket.on('join:parent', ({ busId }) => {
      if (busId) {
        socket.join(`bus:${busId}`);
      }
    });

    // Relay driver-emitted locations to admin dashboards
    socket.on('location:update', (payload) => {
      if (payload?.busId) {
        io.to(`bus:${payload.busId}`).emit('location:update', payload);
      }
      io.to('admin').emit('location:update', payload);
    });
    socket.on('disconnect', () => {
      strapi.log.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  strapi.log.info('Socket.IO server initialized');
  return io;
};

const getIO = () => io;

/**
 * Broadcast a location update to all admin dashboard clients.
 */
const broadcastLocationUpdate = (payload) => {
  if (!io) {
    return;
  }
  io.to('admin').emit('location:update', payload);
  if (payload?.busId) {
    io.to(`bus:${payload.busId}`).emit('location:update', payload);
  }
};

module.exports = {
  initSocketServer,
  getIO,
  broadcastLocationUpdate,
};
