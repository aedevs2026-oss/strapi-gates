'use strict';

const { badRequest, success, created, notFound } = require('../../../utils/api-response');

const getTodayDate = () => new Date().toISOString().slice(0, 10);

module.exports = {
  /**
   * GET /api/driver/profile — driver dashboard info
   */
  async getProfile(ctx) {
    const driver = ctx.state.driver;
    const bus = driver.bus;
    const route = bus?.route;
    const school = bus?.school;

    const activeTrip = await strapi.documents('api::trip.trip').findFirst({
      filters: {
        driver: { documentId: driver.documentId },
        status: 'Running',
      },
      sort: 'startTime:desc',
    });

    return success(ctx, {
      driver: {
        documentId: driver.documentId,
        name: driver.name,
        mobile: driver.mobile,
      },
      bus: bus
        ? {
            documentId: bus.documentId,
            busNumber: bus.busNumber,
          }
        : null,
      route: route
        ? {
            documentId: route.documentId,
            name: route.name,
          }
        : null,
      school: school
        ? {
            documentId: school.documentId,
            schoolName: school.schoolName,
          }
        : null,
      activeTrip: activeTrip
        ? {
            documentId: activeTrip.documentId,
            status: activeTrip.status,
            startTime: activeTrip.startTime,
            distance: Number(activeTrip.distance || 0),
          }
        : null,
    });
  },

  /**
   * POST /api/trips/start — create a running trip
   */
  async startTrip(ctx) {
    const driver = ctx.state.driver;
    const bus = driver.bus;

    if (!bus) {
      return badRequest(ctx, 'No bus assigned to this driver.');
    }

    const route = bus.route;
    if (!route) {
      return badRequest(ctx, 'No route assigned to this bus.');
    }

    const existingTrip = await strapi.documents('api::trip.trip').findFirst({
      filters: {
        driver: { documentId: driver.documentId },
        status: 'Running',
      },
    });

    if (existingTrip) {
      return badRequest(ctx, 'A trip is already running. End the current trip first.');
    }

    const now = new Date();
    const trip = await strapi.documents('api::trip.trip').create({
      data: {
        driver: driver.documentId,
        bus: bus.documentId,
        route: route.documentId,
        date: getTodayDate(),
        startTime: now,
        distance: 0,
        duration: 0,
        status: 'Running',
      },
      populate: ['driver', 'bus', 'route'],
    });

    return created(ctx, {
      documentId: trip.documentId,
      driverId: driver.documentId,
      busId: bus.documentId,
      routeId: route.documentId,
      date: trip.date,
      startTime: trip.startTime,
      status: trip.status,
      distance: 0,
      duration: 0,
    });
  },

  /**
   * POST /api/trips/:tripId/end — complete trip and stop tracking
   */
  async endTrip(ctx) {
    const driver = ctx.state.driver;
    const { tripId } = ctx.params;

    if (!tripId) {
      return badRequest(ctx, 'tripId is required.');
    }

    const trip = await strapi.documents('api::trip.trip').findOne({
      documentId: tripId,
      populate: ['driver'],
    });

    if (!trip) {
      return notFound(ctx, 'Trip not found.');
    }

    if (trip.driver?.documentId !== driver.documentId) {
      return badRequest(ctx, 'Trip does not belong to this driver.');
    }

    if (trip.status !== 'Running') {
      return badRequest(ctx, 'Trip is not running.');
    }

    const endTime = new Date();
    const startTime = new Date(trip.startTime);
    const durationSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));

    const updatedTrip = await strapi.documents('api::trip.trip').update({
      documentId: trip.documentId,
      data: {
        endTime,
        duration: durationSeconds,
        status: 'Completed',
      },
    });

    return success(ctx, {
      documentId: updatedTrip.documentId,
      startTime: trip.startTime,
      endTime: updatedTrip.endTime,
      duration: durationSeconds,
      distance: Number(updatedTrip.distance || trip.distance || 0),
      status: updatedTrip.status,
    });
  },

  /**
   * GET /api/trips/active — current running trip for driver
   */
  async getActiveTrip(ctx) {
    const driver = ctx.state.driver;

    const trip = await strapi.documents('api::trip.trip').findFirst({
      filters: {
        driver: { documentId: driver.documentId },
        status: 'Running',
      },
      sort: 'startTime:desc',
      populate: ['bus', 'route'],
    });

    if (!trip) {
      return success(ctx, null);
    }

    return success(ctx, {
      documentId: trip.documentId,
      busId: trip.bus?.documentId,
      routeId: trip.route?.documentId,
      startTime: trip.startTime,
      distance: Number(trip.distance || 0),
      status: trip.status,
    });
  },
};
