import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Typography,
  Badge,
  Alert,
  Loader,
  Main,
} from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

const statusColor = {
  connected: 'success',
  connecting: 'warning',
  disconnected: 'danger',
};

const HomePage = () => {
  const { get, post } = useFetchClient();
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await get('/whatsapp/status');
      setStatus(data.status || 'disconnected');
      setQrCode(data.qrCode || null);
      setStats(data.stats || null);
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch WhatsApp status');
    }
  }, [get]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status !== 'connecting' && !qrCode) {
      return undefined;
    }

    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [status, qrCode, fetchStatus]);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    setStatus('connecting');
    try {
      const { data } = await post('/whatsapp/connect');
      setStatus(data.status || 'connecting');
      setQrCode(data.qrCode || null);
      if (data.error) {
        setError(data.error);
        if (data.status === 'disconnected') {
          setStatus('disconnected');
        }
      }
    } catch (err) {
      setStatus('disconnected');
      setError('Failed to initialize WhatsApp. Ensure Chrome or Edge is installed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await post('/whatsapp/disconnect');
      setStatus(data.status || 'disconnected');
      setQrCode(null);
      if (data.message) {
        setError('');
      }
      if (data.sessionCleared === false && data.message) {
        setError(data.message);
      }
    } catch (err) {
      setStatus('disconnected');
      setQrCode(null);
      setError('Failed to disconnect WhatsApp. Stop Strapi, delete .wwebjs_auth, then restart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Main>
      <Box padding={8}>
        <Typography variant="alpha" as="h1">
          WhatsApp
        </Typography>
        <Typography variant="epsilon" textColor="neutral600">
          Connect WhatsApp to send OTPs and parent notifications from Strapi.
        </Typography>

        {error ? (
          <Box paddingTop={4}>
            <Alert closeLabel="Close" title="Error" variant="danger" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        ) : null}

        <Flex gap={4} paddingTop={6} alignItems="flex-start" wrap="wrap">
          <Box
            background="neutral0"
            hasRadius
            shadow="tableShadow"
            padding={6}
            style={{ flex: '1 1 420px', textAlign: 'center' }}
          >
            <Flex justifyContent="center" alignItems="center" gap={3} paddingBottom={4}>
              <Typography variant="beta">Connection Status</Typography>
              <Badge active={status === 'connected'}>
                <Typography
                  textColor={statusColor[status] ? `${statusColor[status]}600` : 'neutral600'}
                >
                  {status}
                </Typography>
              </Badge>
            </Flex>

            {status === 'connected' ? (
              <Box paddingTop={2} paddingBottom={4}>
                <Typography textColor="neutral600" paddingBottom={4}>
                  WhatsApp is connected. OTP and notifications will be sent automatically.
                </Typography>
                <Button variant="danger-light" onClick={handleDisconnect} loading={loading}>
                  Disconnect
                </Button>
              </Box>
            ) : null}

            {(status === 'connecting' || qrCode) && status !== 'connected' ? (
              <Box paddingTop={2} paddingBottom={4}>
                {qrCode ? (
                  <>
                    <Typography textColor="neutral600" paddingBottom={4}>
                      Open WhatsApp, go to Settings, Linked Devices, Link a Device, then scan this
                      QR code.
                    </Typography>
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      width={280}
                      height={280}
                      style={{ borderRadius: 12, border: '1px solid #dcdce4' }}
                    />
                  </>
                ) : (
                  <Flex direction="column" alignItems="center" gap={3}>
                    <Loader />
                    <Typography textColor="neutral600">Generating QR code...</Typography>
                  </Flex>
                )}
                <Box paddingTop={4}>
                  <Button variant="secondary" onClick={handleDisconnect} loading={loading}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : null}

            {status === 'disconnected' && !qrCode ? (
              <Box paddingTop={2} paddingBottom={4}>
                <Typography textColor="neutral600" paddingBottom={4}>
                  Connect your WhatsApp account to enable OTP login and parent notifications.
                  After disconnecting from your phone, click Connect to scan a new QR code.
                </Typography>
                <Button onClick={handleConnect} loading={loading}>
                  Connect WhatsApp
                </Button>
              </Box>
            ) : null}
          </Box>

          <Box
            background="neutral0"
            hasRadius
            shadow="tableShadow"
            padding={6}
            style={{ flex: '1 1 320px' }}
          >
            <Typography variant="beta" paddingBottom={4}>
              Stats
            </Typography>
            <Flex direction="column" gap={2}>
              <Typography>Messages sent: {stats?.totalMessagesSent ?? 0}</Typography>
              <Typography>Unique contacts: {stats?.totalContacts ?? 0}</Typography>
            </Flex>

            <Typography variant="beta" paddingTop={6} paddingBottom={2}>
              Setup
            </Typography>
            <Typography as="ol" textColor="neutral600">
              <li>Click Connect WhatsApp</li>
              <li>Scan the QR code with your phone</li>
              <li>Set WHFLOW_ENABLED=true in .env</li>
              <li>Set OTP_DEV_MODE=false for production OTP via WhatsApp</li>
            </Typography>
          </Box>
        </Flex>
      </Box>
    </Main>
  );
};

export default HomePage;
