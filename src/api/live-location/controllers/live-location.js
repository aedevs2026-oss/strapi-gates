'use strict';

const { badRequest, success, created, notFound } = require('../../../utils/api-response');
const { haversineDistanceKm } = require('../../../utils/haversine');
const { broadcastLocationUpdate } = require('../../../services/socket');
const { formatLocationPayload } = require('../../../utils/transport');

module.exports = {
  /**
   * POST /api/live-locations
   * Saves GPS point, updates trip distance, and broadcasts via Socket.IO.
   */
  async create(ctx) {
    const driver = ctx.state.driver;
    const body = ctx.request.body || {};

    const {
      driverId,
      busId,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      timestamp,
      tripId,
    } = body;

    if (driverId && driverId !== driver.documentId) {
      return badRequest(ctx, 'driverId does not match authenticated driver.');
    }

    if (latitude == null || longitude == null) {
      return badRequest(ctx, 'latitude and longitude are required.');
    }

    const bus = driver.bus;
    if (!bus) {
      return badRequest(ctx, 'No bus assigned to this driver.');
    }

    if (busId && busId !== bus.documentId) {
      return badRequest(ctx, 'busId does not match assigned bus.');
    }

    let trip = null;
    if (tripId) {
      trip = await strapi.documents('api::trip.trip').findOne({
        documentId: tripId,
        populate: ['driver', 'bus'],
      });
    } else {
      trip = await strapi.documents('api::trip.trip').findFirst({
        filters: {
          driver: { documentId: driver.documentId },
          status: 'Running',
        },
        sort: 'startTime:desc',
      });
    }

    if (!trip || trip.status !== 'Running') {
      return badRequest(ctx, 'No active trip found. Start a trip before sending location.');
    }

    const locationTimestamp = timestamp ? new Date(timestamp) : new Date();

    const location = await strapi.documents('api::live-location.live-location').create({
      data: {
        driver: driver.documentId,
        bus: bus.documentId,
        trip: trip.documentId,
        latitude,
        longitude,
        speed: speed ?? null,
        heading: heading ?? null,
        accuracy: accuracy ?? null,
        timestamp: locationTimestamp,
      },
    });

    const previousLocation = await strapi.documents('api::live-location.live-location').findFirst({
      filters: {
        trip: { documentId: trip.documentId },
        documentId: { $ne: location.documentId },
      },
      sort: 'timestamp:desc',
    });

    if (previousLocation) {
      const segmentKm = haversineDistanceKm(
        Number(previousLocation.latitude),
        Number(previousLocation.longitude),
        Number(latitude),
        Number(longitude)
      );

      const currentDistance = Number(trip.distance || 0);
      await strapi.documents('api::trip.trip').update({
        documentId: trip.documentId,
        data: {
          distance: Number((currentDistance + segmentKm).toFixed(4)),
        },
      });
      trip.distance = Number((currentDistance + segmentKm).toFixed(4));
    }

    const route = bus.route;
    const payload = formatLocationPayload(location, driver, bus, route, trip);
    broadcastLocationUpdate(payload);

    return created(ctx, payload);
  },

  /**
   * GET /api/live-locations/active
   * Returns the latest location for each bus with a running trip.
   */
  async findActive(ctx) {
    const runningTrips = await strapi.documents('api::trip.trip').findMany({
      filters: { status: 'Running' },
      populate: {
        driver: true,
        bus: { populate: ['route', 'school'] },
        route: true,
      },
    });

    const activeLocations = [];

    for (const trip of runningTrips) {
      const latest = await strapi.documents('api::live-location.live-location').findFirst({
        filters: { trip: { documentId: trip.documentId } },
        sort: 'timestamp:desc',
      });

      if (!latest) continue;

      activeLocations.push(
        formatLocationPayload(
          latest,
          trip.driver,
          trip.bus,
          trip.route || trip.bus?.route,
          trip
        )
      );
    }

    return success(ctx, activeLocations);
  },
};
