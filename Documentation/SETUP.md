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
