const fs = require('fs');
const path = require('path');

const apis = [
  ['school', 'school'],
  ['academic-year', 'academic-year'],
  ['class', 'class'],
  ['section', 'section'],
  ['subject', 'subject'],
  ['teacher', 'teacher'],
  ['parent', 'parent'],
  ['student', 'student'],
  ['attendance', 'attendance'],
  ['homework', 'homework'],
  ['assignment', 'assignment'],
  ['exam', 'exam'],
  ['exam-schedule', 'exam-schedule'],
  ['exam-result', 'exam-result'],
  ['timetable', 'timetable'],
  ['circular', 'circular'],
  ['holiday', 'holiday'],
  ['fee', 'fee'],
  ['fee-payment', 'fee-payment'],
  ['notification', 'notification'],
  ['gallery', 'gallery'],
  ['contact-detail', 'contact-detail'],
  ['otp-record', 'otp-record'],
];

for (const [folder, uid] of apis) {
  const base = path.join(__dirname, '..', 'src', 'api', folder);
  const ctrl = `const { createCoreController } = require('@strapi/strapi').factories;\nmodule.exports = createCoreController('api::${uid}.${uid}');\n`;
  const svc = `const { createCoreService } = require('@strapi/strapi').factories;\nmodule.exports = createCoreService('api::${uid}.${uid}');\n`;
  const rt = `const { createCoreRouter } = require('@strapi/strapi').factories;\nmodule.exports = createCoreRouter('api::${uid}.${uid}');\n`;
  fs.mkdirSync(path.join(base, 'controllers'), { recursive: true });
  fs.mkdirSync(path.join(base, 'services'), { recursive: true });
  fs.mkdirSync(path.join(base, 'routes'), { recursive: true });
  fs.writeFileSync(path.join(base, 'controllers', `${folder}.js`), ctrl);
  fs.writeFileSync(path.join(base, 'services', `${folder}.js`), svc);
  fs.writeFileSync(path.join(base, 'routes', `${folder}.js`), rt);
}

console.log('Generated', apis.length, 'API modules');
