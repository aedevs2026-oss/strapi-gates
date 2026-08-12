# Live GPS Bus Tracking API

## Overview

Free OpenStreetMap-based live bus tracking with Socket.IO real-time updates.

## Content Types

| Collection | Fields |
|------------|--------|
| **Driver** | name, mobile, licenseNumber, driverStatus, bus |
| **Bus** | busNumber, registrationNumber, capacity, busStatus, school, route, driver |
| **Route** | name, description, startPoint, endPoint, routeStatus, school |
| **Trip** | driver, bus, route, date, startTime, endTime, distance, duration, status |
| **Live Location** | driver, bus, trip, latitude, longitude, speed, heading, accuracy, timestamp |

## Parent Mobile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/parent/students/:studentId/bus-tracking` | Child's assigned bus + live location |

Parent app joins Socket.IO room via `join:parent` with `{ busId }` for real-time updates.

## Driver Auth (OTP)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/driver-auth/send-otp` | Send OTP to registered driver mobile |
| POST | `/api/driver-auth/verify-otp` | Verify OTP, returns JWT + driver/bus/route/school |
| GET | `/api/driver-auth/me` | Refresh driver session (Bearer token) |

## Driver Mobile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/driver/profile` | Dashboard info + active trip |
| POST | `/api/trips/start` | Start trip (status = Running) |
| POST | `/api/trips/:tripId/end` | End trip, compute duration |
| GET | `/api/trips/active` | Current running trip |

## Live Location

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/live-locations` | Save GPS point (driver auth required) |
| GET | `/api/live-locations/active` | Latest location per active bus |

### POST `/api/live-locations` body

```json
{
  "driverId": "documentId",
  "busId": "documentId",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speed": 32.5,
  "heading": 180,
  "accuracy": 8,
  "timestamp": "2026-08-03T10:00:00.000Z",
  "tripId": "optional-trip-documentId"
}
```

## Socket.IO

- **Path:** `/socket.io`
- **Admin event:** `join:admin` — subscribe to live updates
- **Broadcast:** `location:update` — emitted when a location is saved

## Admin Dashboard

Open Strapi admin → **Live Bus Tracking** in the sidebar.

Uses CARTO basemap tiles (OpenStreetMap data, production-friendly): `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`

## Setup

1. Start Strapi: `npm run develop`
2. Create School, Route, Bus, Driver in admin (or run `node scripts/seed-transport.js`)
3. Assign bus → route → school and driver → bus
4. Set `OTP_DEV_MODE=true` for dev OTP in server logs
5. Mobile app: select **Driver** role on login screen

## Folder Structure

```
strapi-gates/src/
├── api/
│   ├── bus/
│   ├── driver/
│   ├── driver-auth/
│   ├── driver-mobile/
│   ├── live-location/
│   ├── route/
│   └── trip/
├── admin/
│   ├── app.js
│   └── pages/LiveTracking/
├── policies/is-driver-authenticated.js
├── services/socket.js
└── utils/haversine.js

Frontend/golden-gates-parent-app/src/
├── api/tracking.ts, driverAuth.ts
├── context/DriverTripContext.tsx
├── hooks/useLocationTracking.ts
├── navigation/DriverMainStackNavigator.tsx
├── screens/Driver/DriverDashboardScreen.tsx
├── screens/Transport/TrackBusScreen.tsx
├── components/LiveBusMap.tsx
├── hooks/useParentBusTracking.ts
├── services/tracking/
│   ├── BackgroundLocationService.ts
│   ├── LocationTrackingService.ts
│   ├── PermissionHandler.ts
│   └── socketClient.ts
└── types/tracking.ts
```
