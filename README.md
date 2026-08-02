# School ERP Backend (Strapi v5)

Production-ready School ERP backend serving **Parent Mobile App APIs** for a React Native frontend.

**Brand colors:** Purple `#5E2A84` · Gold `#F4B400` · White `#FFFFFF`

## Tech Stack

| Layer | Technology |
|-------|------------|
| CMS / API | Strapi v5.49 |
| Database | PostgreSQL |
| Auth | JWT + Mobile OTP |
| Payments | Razorpay |
| Push | Firebase Cloud Messaging |
| API Style | REST (JSON) |

## Project Structure

```
gates-admin/
├── config/                    # Strapi configuration
│   ├── admin.js
│   ├── api.js                 # Pagination defaults
│   ├── database.js            # PostgreSQL config
│   ├── middlewares.js         # CORS, rate limit, body limits
│   ├── plugins.js             # Upload plugin
│   └── server.js
├── docs/
│   ├── API.md                 # Full API documentation
│   ├── DATABASE.md            # ER diagram & relations
│   └── DEPLOYMENT.md          # Production deployment guide
├── scripts/
│   └── generate-apis.js       # Scaffold core CRUD modules
├── src/
│   ├── api/                   # Content types & custom APIs
│   │   ├── auth/              # OTP login (public)
│   │   ├── parent-mobile/     # Parent app endpoints (JWT)
│   │   ├── payment/           # Razorpay order & verify
│   │   ├── push-notification/ # FCM admin endpoints
│   │   └── [23 content types]
│   ├── middlewares/
│   │   ├── rate-limit.js
│   │   └── secure-upload.js
│   ├── policies/
│   │   └── is-parent-authenticated.js
│   ├── services/
│   │   ├── firebase.js
│   │   └── razorpay.js
│   ├── utils/
│   │   ├── api-response.js
│   │   ├── jwt.js
│   │   └── otp.js
│   └── index.js               # Bootstrap & admin roles
├── .env.example
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 6+

### Installation

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL, JWT, Razorpay, and Firebase credentials

# Create PostgreSQL database
createdb school_erp

# Start development server
npm run develop
```

Admin panel: `http://localhost:1337/admin`

### First-time Setup

1. Create Super Admin account on first launch
2. Add **School** profile (Settings → Content Manager → School)
3. Create **Academic Year**, **Classes**, **Sections**, **Teachers**, **Subjects**
4. Register **Parents** with mobile numbers
5. Link **Students** to parents and classes

## Authentication Flow

```
Mobile Number → Send OTP → Verify OTP → JWT Token → Parent Profile
```

All `/api/parent/*`, `/api/payment/*`, and `/api/auth/me` endpoints require:

```
Authorization: Bearer <parent_jwt_token>
```

OTP endpoints are public but rate-limited.

## Content Types (23)

School, Academic Year, Class, Section, Subject, Teacher, Parent, Student, Attendance, Homework, Assignment, Exam, Exam Schedule, Exam Result, Timetable, Circular, Holiday, Fee, Fee Payment, Notification, Gallery, Contact Details, OTP Record

## Admin Roles

| Role | Access |
|------|--------|
| Super Admin | Full system access |
| Principal | Full academic & admin access |
| Teacher | Homework, attendance, assignments, exams |
| Office Staff | Students, parents, circulars |
| Accountant | Fees, payments, receipts |

## Parent Mobile Features

| Feature | Endpoint |
|---------|----------|
| Student Profile | `GET /api/parent/students/:id` |
| Homework | `GET /api/parent/homework` |
| Assignments | `GET /api/parent/assignments` |
| Attendance | `GET /api/parent/attendance` |
| Exam Schedule | `GET /api/parent/exam-schedules` |
| Exam Results | `GET /api/parent/exam-results` |
| Timetable | `GET /api/parent/timetable` |
| Circulars | `GET /api/parent/circulars` |
| Fees | `GET /api/parent/fees` |
| Pay Now | `POST /api/payment/create-order` |
| Notifications | `GET /api/parent/notifications` |
| School Info | `GET /api/parent/school` |
| Contact | `GET /api/parent/contacts` |

See [docs/API.md](./docs/API.md) for complete documentation.

## Environment Variables

See [.env.example](./.env.example) for all required variables.

## Scripts

```bash
npm run develop   # Development with hot reload
npm run build     # Production build
npm run start     # Production server
```

## Security

- JWT authentication for all parent APIs
- OTP rate limiting (5 requests / 15 min per IP+mobile)
- Global rate limiting (100 requests / 15 min per IP)
- Input validation on auth & payment endpoints
- Secure file upload (images + PDF only)
- Role-based admin panel permissions
- Parent data scoped to linked students only

## License

Private — School ERP
