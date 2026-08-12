import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Typography, Badge } from '@strapi/design-system';
import { PinMap } from '@strapi/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons in bundled admin build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

const getApiUrl = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

/** Keeps map centered when buses update */
const MapAutoFit = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) return;
    const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [locations, map]);

  return null;
};

const formatSpeed = (speed) => {
  if (speed == null || Number.isNaN(speed)) return '—';
  return `${Number(speed).toFixed(1)} km/h`;
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const LiveTrackingPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);

  const locationsByBus = useMemo(() => {
    const index = {};
    for (const loc of locations) {
      index[loc.busId] = loc;
    }
    return index;
  }, [locations]);

  const upsertLocation = useCallback((payload) => {
    if (!payload?.busId) return;
    setLocations((prev) => {
      const next = prev.filter((item) => item.busId !== payload.busId);
      next.push(payload);
      return next;
    });
  }, []);

  // Initial fetch of active bus locations
  useEffect(() => {
    const loadActive = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/live-locations/active`);
        const json = await res.json();
        const items = json?.data || [];
        setLocations(items);
      } catch (error) {
        console.error('Failed to load active locations', error);
      }
    };
    loadActive();
  }, []);

  // Socket.IO real-time updates with auto-reconnect
  useEffect(() => {
    const socket = io(getSocketUrl(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join:admin');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    socket.on('location:update', (payload) => {
      upsertLocation(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [upsertLocation]);

  const selected = selectedBusId ? locationsByBus[selectedBusId] : null;
  const defaultCenter = locations.length
    ? [locations[0].latitude, locations[0].longitude]
    : [20.5937, 78.9629];

  return (
    <Box padding={8} background="neutral0" style={{ minHeight: '100vh' }}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Flex gap={2} alignItems="center">
          <PinMap />
          <Typography variant="alpha">Live Bus Tracking</Typography>
        </Flex>
        <Badge
          backgroundColor={
            connectionStatus === 'connected'
              ? 'success100'
              : connectionStatus === 'connecting'
                ? 'warning100'
                : 'danger100'
          }
        >
          {connectionStatus === 'connected'
            ? 'Live'
            : connectionStatus === 'connecting'
              ? 'Connecting…'
              : 'Reconnecting…'}
        </Badge>
      </Flex>

      <Flex gap={4} alignItems="stretch" style={{ minHeight: '70vh' }}>
        <Box style={{ flex: 1, minHeight: '70vh', borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '70vh', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={OSM_TILE_URL} />
            <MapAutoFit locations={locations} />
            {locations.map((loc) => (
              <Marker
                key={loc.busId}
                position={[loc.latitude, loc.longitude]}
                eventHandlers={{
                  click: () => setSelectedBusId(loc.busId),
                }}
              >
                <Popup>
                  <strong>{loc.busNumber}</strong>
                  <br />
                  {loc.driverName}
                  <br />
                  Speed: {formatSpeed(loc.speed)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>

        <Box
          padding={4}
          background="neutral100"
          hasRadius
          style={{ width: 320, flexShrink: 0 }}
        >
          <Typography variant="beta" marginBottom={3}>
            Bus Details
          </Typography>
          {selected ? (
            <Flex direction="column" gap={2}>
              <Typography variant="omega">
                <strong>Driver:</strong> {selected.driverName || '—'}
              </Typography>
              <Typography variant="omega">
                <strong>Bus Number:</strong> {selected.busNumber || '—'}
              </Typography>
              <Typography variant="omega">
                <strong>Route:</strong> {selected.routeName || '—'}
              </Typography>
              <Typography variant="omega">
                <strong>Speed:</strong> {formatSpeed(selected.speed)}
              </Typography>
              <Typography variant="omega">
                <strong>Latitude:</strong> {selected.latitude}
              </Typography>
              <Typography variant="omega">
                <strong>Longitude:</strong> {selected.longitude}
              </Typography>
              <Typography variant="omega">
                <strong>Last Updated:</strong> {formatTimestamp(selected.lastUpdated)}
              </Typography>
              <Typography variant="omega">
                <strong>Trip Status:</strong> {selected.tripStatus || '—'}
              </Typography>
            </Flex>
          ) : (
            <Typography variant="omega" textColor="neutral600">
              Click a bus marker on the map to view details.
            </Typography>
          )}

          <Typography variant="beta" marginTop={6} marginBottom={2}>
            Active Buses ({locations.length})
          </Typography>
          <Flex direction="column" gap={2}>
            {locations.map((loc) => (
              <Box
                key={loc.busId}
                padding={2}
                background={selectedBusId === loc.busId ? 'primary100' : 'neutral0'}
                hasRadius
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedBusId(loc.busId)}
              >
                <Typography variant="omega" fontWeight="bold">
                  {loc.busNumber}
                </Typography>
                <Typography variant="pi" textColor="neutral600">
                  {loc.driverName} · {loc.routeName}
                </Typography>
              </Box>
            ))}
            {!locations.length ? (
              <Typography variant="omega" textColor="neutral600">
                No active buses on the road right now.
              </Typography>
            ) : null}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default LiveTrackingPage;
