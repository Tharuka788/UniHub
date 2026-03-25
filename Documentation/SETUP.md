# Setup

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB running locally on `mongodb://localhost:27017`

## Install

From the repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Or run:

```bash
npm run install:all
```

## Environment Files

### Backend

Copy `backend/.env.example` to `backend/.env` and adjust values as needed.

Key values:

- `APP_MODE=standalone`
- `MONGODB_URI=mongodb://localhost:27017/class_link_manager`
- `EMAIL_PROVIDER=console`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=change-me-admin`
- `ADMIN_SESSION_SECRET=replace-this-session-secret`
- `ADMIN_SESSION_TTL_HOURS=12`
- `ALLOW_MOCK_SYNC=true`
- `ENFORCE_CLASS_LINK_DOMAIN_POLICY=false`
- `CLASS_LINK_ALLOWED_DOMAINS=meet.google.com`

### Frontend

Copy `frontend/.env.example` to `frontend/.env`.

Key values:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_APP_MODE=standalone`

## Development

Run both apps:

```bash
npm run dev
```

Run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Admin Login

The frontend now opens behind a simple backend-managed admin login.

- copy `backend/.env.example` to `backend/.env`
- set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to the values you want
- set a non-default `ADMIN_SESSION_SECRET` before sharing or deploying the app
- sign in from the frontend using those backend environment values

## Verification Commands

```bash
npm run lint --prefix backend
npm run test --prefix backend
npm run lint --prefix frontend
npm run test --prefix frontend
npm run build --prefix frontend
```

## Amendment Verification

Use the same commands above after amendment work. The current branch also verifies:

- admin student CRUD
- admin class-offering CRUD + archive
- report preview and PDF download flows
- readiness badge rendering in class-offering UI
- env-driven admin login and protected admin API access
