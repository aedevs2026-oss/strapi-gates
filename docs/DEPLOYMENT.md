# Deployment Guide

## Production Checklist

- [ ] Generate strong secrets for all JWT/encryption keys
- [ ] Set `NODE_ENV=production`
- [ ] Set `OTP_DEV_MODE=false`
- [ ] Configure PostgreSQL with SSL
- [ ] Set up Razorpay live keys
- [ ] Configure Firebase service account
- [ ] Configure SMS gateway for OTP (MSG91/Twilio)
- [ ] Set restrictive `CORS_ORIGINS`
- [ ] Enable HTTPS reverse proxy (Nginx/Caddy)
- [ ] Set up database backups
- [ ] Configure log aggregation

## Environment Variables (Production)

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

APP_KEYS=<4-random-strings>
ADMIN_JWT_SECRET=<random-64-chars>
JWT_SECRET=<random-64-chars>
PARENT_JWT_SECRET=<random-64-chars>
API_TOKEN_SALT=<random-string>
TRANSFER_TOKEN_SALT=<random-string>
ENCRYPTION_KEY=<random-32-chars>

DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=school_erp
DATABASE_USERNAME=school_erp_user
DATABASE_PASSWORD=<strong-password>
DATABASE_SSL=true

OTP_DEV_MODE=false
OTP_EXPIRY_MINUTES=5

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=<live-secret>

FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

CORS_ORIGINS=https://yourdomain.com
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Build & Start

```bash
npm ci --omit=dev
npm run build
npm run start
```

## WhatsApp on Render (or other Linux hosts)

The WhatsApp plugin uses Puppeteer (headless Chrome). On Render you must install Chrome during **build**, not only at runtime.

### Render settings

| Setting | Value |
|---------|--------|
| **Root directory** | `strapi-gates` |
| **Build command** | `npm ci && NODE_OPTIONS="--max-old-space-size=2048" npm run build:render` |
| **Start command** | `npm run start` |
| **Instance type** | **Starter (512 MB) minimum** — use **Standard (2 GB)** if startup still OOMs |

The repo includes a `render.yaml` blueprint with these defaults.

**Why deploys fail with "No open ports" / OOM:** Strapi must finish booting and bind to `PORT` before Render marks the service healthy. On 512 MB instances, loading Puppeteer/WhatsApp at startup can exhaust memory and crash before the port opens. The app now lazy-loads WhatsApp only when you connect from Admin; Chrome is installed during **build** (`postinstall` + `build:render`), not at runtime startup.

The repo includes:

- `postinstall` → runs `scripts/ensure-puppeteer-chrome.js` to download Chrome when none is found
- `Aptfile` → system libraries Chromium needs on Render’s Ubuntu image

After deploy, open **Strapi Admin → WhatsApp → Connect** and scan the QR code.

### If Chrome is still missing

1. Redeploy with a **clear build cache** (Render dashboard → Manual Deploy → Clear build cache).
2. On Render, Chrome is stored in the project at `puppeteer-cache/` (auto-detected from app root). **Do not** set `PUPPETEER_CACHE_DIR` to `/opt/render/project/src/puppeteer-cache` — that path is wrong when `rootDir` is `strapi-gates`.
3. Optional explicit env on Render (only if you use a persistent disk mount):
   ```env
   PUPPETEER_CACHE_DIR=./puppeteer-cache
   ```
4. If the build still fails, check deploy logs for `[postinstall] Cache dir:` diagnostics.

### Session persistence

WhatsApp login is stored in `WHATSAPP_AUTH_PATH` (default `.wwebjs_auth`). On Render, use a **persistent disk** mounted at your app root (or set `WHATSAPP_AUTH_PATH` to that mount), or you will need to scan the QR again after every redeploy.

### Local development (Windows)

Chrome or Edge is auto-detected. No extra setup unless browsers are installed in non-standard paths — then set `CHROME_PATH`.

## Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 1337
CMD ["npm", "run", "start"]
```

```yaml
# docker-compose.yml
services:
  strapi:
    build: .
    ports:
      - "1337:1337"
    env_file: .env
    depends_on:
      - postgres
    volumes:
      - uploads:/app/public/uploads

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: school_erp
      POSTGRES_USER: school_erp_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  uploads:
```

## Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourschool.com;

    ssl_certificate     /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## PostgreSQL Setup

```sql
CREATE USER school_erp_user WITH PASSWORD 'your_password';
CREATE DATABASE school_erp OWNER school_erp_user;
GRANT ALL PRIVILEGES ON DATABASE school_erp TO school_erp_user;
```

## Process Manager (PM2)

```bash
npm install -g pm2
pm2 start npm --name "school-erp" -- start
pm2 save
pm2 startup
```

## Database Backups

```bash
# Daily cron
pg_dump -h localhost -U school_erp_user school_erp | gzip > backup_$(date +%Y%m%d).sql.gz
```

## Monitoring

- Health check: `GET /_health` (Strapi built-in)
- Monitor PostgreSQL connections and disk usage
- Set up alerts for 5xx error rates
- Monitor Razorpay webhook failures

## SMS Integration (OTP Production)

Replace the log placeholder in `src/api/auth/controllers/auth.js` with your SMS provider:

```javascript
// Example: MSG91
await fetch('https://api.msg91.com/api/v5/flow/', {
  method: 'POST',
  headers: {
    authkey: process.env.MSG91_AUTH_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template_id: process.env.MSG91_OTP_TEMPLATE,
    recipients: [{ mobiles: `91${normalized}`, var: otp }],
  }),
});
```

## Scaling Notes

- Run Strapi in cluster mode with shared PostgreSQL
- Use S3/Cloudinary for media uploads in multi-instance setups
- Move OTP storage to Redis for high-throughput auth
- Use Redis for rate limiting in distributed deployments
