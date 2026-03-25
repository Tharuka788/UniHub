# Kuppi System

Student confirmation dashboard and class link dispatch module built as a MERN-style monorepo.

## Apps

- `frontend`: React + Vite + Tailwind admin dashboard
- `backend`: Express + MongoDB API for ingestion, dashboard reads, and class-link dispatch
- `Documentation`: architecture, contracts, setup, seeding, integration, and presentation guides

## Core Features

- confirmed enrollment ingestion from an upstream registration/payment flow
- admin summary dashboard and filtered enrollment listing
- explicit student CRUD management
- class offering management
- report-center preview and PDF downloads
- readiness scoring for class-offering operations
- env-configured admin login with cookie-based session protection
- one-by-one class-link dispatch with delivery logging
- `standalone` and `integrated` runtime modes
- deterministic seed data and automated test coverage

## Repository Structure

```text
.
├── backend/
├── frontend/
├── Documentation/
├── package.json
└── README.md
```

## Quick Start

```bash
npm run install:all
npm run seed:standalone
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Default admin login after copying `backend/.env.example`:

- username: `admin`
- password: `change-me-admin`

Change these through `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in `backend/.env`.

## Useful Commands

```bash
npm run dev
npm run seed
npm run seed:reset
npm run seed:standalone
npm run test
npm run lint
```

## Documentation

- [Plan](Documentation/PLAN.md)
- [Amendment Plan](Documentation/AMENDMENT_PLAN.md)
- [Architecture](Documentation/ARCHITECTURE.md)
- [API Contract](Documentation/API_CONTRACT.md)
- [Data Model](Documentation/DATA_MODEL.md)
- [Setup](Documentation/SETUP.md)
- [Seeding](Documentation/SEEDING.md)
- [Integration Guide](Documentation/INTEGRATION_GUIDE.md)
- [Presentation Flow](Documentation/PRESENTATION_FLOW.md)
