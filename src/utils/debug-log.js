'use strict';

const path = require('path');
const fs = require('fs');

const SESSION_ID = 'fd57a5';
const INGEST_URL = 'http://127.0.0.1:7924/ingest/3a5603c5-05ae-460c-8d90-3d7d30bfc83d';
const LOG_FILE = path.join(__dirname, '..', '..', '..', 'debug-fd57a5.log');

function debugLog(location, message, data = {}, hypothesisId = '') {
  if (process.env.DEBUG_PARENT_API !== 'true') {
    return;
  }

  const entry = {
    sessionId: SESSION_ID,
    location,
    message,
    data,
    hypothesisId,
    timestamp: Date.now(),
  };

  // #region agent log
  fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION_ID,
    },
    body: JSON.stringify(entry),
  }).catch(() => {});

  try {
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`);
  } catch (_) {
    /* ignore file write errors */
  }
  // #endregion
}

module.exports = { debugLog };
