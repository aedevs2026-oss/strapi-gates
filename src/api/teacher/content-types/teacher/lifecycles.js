'use strict';

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(process.cwd(), '..', 'debug-12d67a.log');

const writeDebugLog = (payload) => {
  try {
    fs.appendFileSync(
      LOG_PATH,
      `${JSON.stringify({ sessionId: '12d67a', timestamp: Date.now(), ...payload })}\n`
    );
  } catch {
    // ignore logging failures
  }
};

module.exports = {
  async beforeCreate(event) {
    const data = event.params?.data || {};
    if (!data.mobile && data.phone) {
      data.mobile = data.phone;
    }
    if (!data.teacherStatus) {
      data.teacherStatus = 'active';
    }

    // #region agent log
    writeDebugLog({
      location: 'teacher/lifecycles.js:beforeCreate',
      message: 'teacher create payload',
      data: {
        keys: Object.keys(data),
        hasTeacherStatus: data.teacherStatus != null,
        hasReservedStatus: data.status != null,
      },
      hypothesisId: 'H1',
    });
    // #endregion
  },

  async beforeUpdate(event) {
    const data = event.params?.data || {};
    if (!data.mobile && data.phone) {
      data.mobile = data.phone;
    }
  },

  async afterCreate(event) {
    // #region agent log
    writeDebugLog({
      location: 'teacher/lifecycles.js:afterCreate',
      message: 'teacher created',
      data: { documentId: event.result?.documentId },
      hypothesisId: 'H1',
    });
    // #endregion
  },
};
