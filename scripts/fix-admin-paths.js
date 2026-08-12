const fs = require('node:fs');
const path = require('node:path');

const indexPath = path.join(process.cwd(), '.strapi', 'client', 'index.html');

if (!fs.existsSync(indexPath)) {
  process.exit(0);
}

const html = fs.readFileSync(indexPath, 'utf8');
const fixed = html.replace(/src="([^"]+)"/g, (match, src) => {
  const normalized = src.replace(/\\/g, '/');
  return normalized === src ? match : `src="${normalized}"`;
});

if (fixed !== html) {
  fs.writeFileSync(indexPath, fixed);
  console.log('[admin] Fixed Windows path separators in .strapi/client/index.html');
}
