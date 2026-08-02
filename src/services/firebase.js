'use strict';

let firebaseApp = null;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    firebaseApp = admin.app();
  }

  return firebaseApp;
};

const sendPushNotification = async ({ token, title, body, data = {}, imageUrl }) => {
  const app = initFirebase();
  if (!app) {
    strapi?.log?.warn('Firebase not configured. Push notification skipped.');
    return { success: false, reason: 'Firebase not configured' };
  }

  const admin = require('firebase-admin');
  const message = {
    token,
    notification: { title, body, ...(imageUrl && { imageUrl }) },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
  };

  const response = await admin.messaging().send(message);
  return { success: true, messageId: response };
};

const sendMulticast = async ({ tokens, title, body, data = {} }) => {
  const app = initFirebase();
  if (!app || !tokens?.length) {
    return { success: false, reason: 'Firebase not configured or no tokens' };
  }

  const admin = require('firebase-admin');
  const message = {
    tokens,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
  };

  return admin.messaging().sendEachForMulticast(message);
};

module.exports = {
  initFirebase,
  sendPushNotification,
  sendMulticast,
};
