'use strict';

/** Shared formatter for live location payloads (admin + parent apps). */
const formatLocationPayload = (location, driver, bus, route, trip) => ({
  documentId: location.documentId,
  driverId: driver?.documentId,
  driverName: driver?.name,
  busId: bus?.documentId,
  busNumber: bus?.busNumber,
  routeName: route?.name,
  tripId: trip?.documentId,
  tripStatus: trip?.status,
  latitude: Number(location.latitude),
  longitude: Number(location.longitude),
  speed: location.speed != null ? Number(location.speed) : null,
  heading: location.heading != null ? Number(location.heading) : null,
  accuracy: location.accuracy != null ? Number(location.accuracy) : null,
  timestamp: location.timestamp,
  lastUpdated: location.timestamp,
});

module.exports = {
  formatLocationPayload,
};
