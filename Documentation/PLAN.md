# Student Confirmation Dashboard and Class Link Dispatch

## Full Development Plan

## 1. Project Objective

Build the **post-registration student confirmation component** of the class management system in MERN. This component starts only **after registration and payment are successful** in the external flow.

The component must:

- receive and store successful student registration details
- maintain a confirmed student list for admins
- allow the admin to send the class link to all confirmed students
- support clean integration with other team members’ components later
- support a smooth **individual presentation mode** without changing code quality or architecture
- follow a clean, production-grade structure and standards from the beginning

This project starts from an **empty root folder**.

---

## 2. Functional Scope

### In Scope

1. Save student details after registration + payment success
2. Show a dashboard of confirmed students
3. Allow admin to send the class link to confirmed students by email
4. Log link dispatch status
5. Support two runtime modes using environment variables:
   - `standalone` mode for individual presentation
   - `integrated` mode for team integration

6. Provide seeding commands for quick local setup
7. Provide integration contracts for teammates

### Out of Scope

1. Payment gateway implementation
2. Student self-registration form UI
3. Full authentication/authorization platform unless another teammate owns it
4. Video platform integration beyond storing/sending the class URL

---

## 3. Runtime Mode Strategy

The system must support two **first-class runtime modes**, both implemented cleanly and permanently.

### Mode A: `standalone`

Used for the individual progress presentation.

Behavior:

- uses seeded or locally simulated successful registration data
- can enable mock ingestion endpoints for local testing
- can use console/email sandbox transport if real SMTP is not configured
- keeps the same UI and same business flow
- shows no special demo disclaimers in the app

### Mode B: `integrated`

Used when merging with teammates’ components.

Behavior:

- accepts confirmed registration data from the actual shared team flow
- uses real integration endpoint(s)
- uses real email transport configuration
- disables mock-only helpers

### Required Environment Variables

Backend:

- `APP_MODE=standalone|integrated`
- `NODE_ENV=development|production`
- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/class_link_manager`
- `FRONTEND_URL=http://localhost:5173`
- `INTEGRATION_SHARED_SECRET=...`
- `EMAIL_PROVIDER=console|smtp`
- `SMTP_HOST=...`
- `SMTP_PORT=...`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `MAIL_FROM=...`
- `DEFAULT_CLASS_LINK=...`
- `ALLOW_MOCK_SYNC=true|false`

Frontend:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_APP_MODE=standalone|integrated`

### Mode Rules

- never fork the codebase into separate demo/prod branches
- never duplicate components for modes
- only switch behavior through configuration and feature guards
- use identical API shapes in both modes wherever possible

---

## 4. Recommended High-Level Architecture

## Frontend

- React with Vite
- Tailwind CSS v4
- admin dashboard UI
- API client layer
- reusable components
- filters and status feedback
- send link action UI

## Backend

- Node.js + Express
- MongoDB + Mongoose
- REST API
- service layer for business logic
- mailer service
- integration/webhook controller
- audit/logging support

## Database

Use MongoDB with a dedicated database for this component:

- `class_link_manager`

---

## 5. Root Folder Structure

```text
project-root/
├── frontend/
├── backend/
├── Documentation/
├── .gitignore
├── package.json
└── README.md
```

### Detailed Structure Target

```text
project-root/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   └── students/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   │   ├── seed.js
│   │   ├── seedReset.js
│   │   └── seedStandaloneDemo.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── Documentation/
│   ├── PLAN.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── DATA_MODEL.md
│   ├── SETUP.md
│   ├── SEEDING.md
│   ├── INTEGRATION_GUIDE.md
│   └── PRESENTATION_FLOW.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## 6. Domain Design

To keep the component integration-friendly, avoid putting everything into one collection. Separate the core concepts.

## Main Entities

### 6.1 Student

Represents the student as a person.

Suggested fields:

- `fullName`
- `email`
- `phone` (optional)
- `studentCode` (optional if the broader system later provides one)
- `createdAt`
- `updatedAt`

Constraints:

- email should be normalized to lowercase
- unique index on email if one student should only exist once system-wide

### 6.2 ClassOffering

Represents the class / batch / intake / session that students join.

Suggested fields:

- `title`
- `kuppiSession`
- `classLink`
- `startDateTime` (optional)
- `status` (`draft`, `ready`, `active`, `completed`)
- `createdAt`
- `updatedAt`

### 6.3 Enrollment

Represents the student’s confirmed participation in a class offering.

Suggested fields:

- `student`
- `classOffering`
- `registrationStatus`
- `paymentStatus`
- `confirmationSource`
- `registrationReference`
- `paymentReference`
- `linkDeliveryStatus`
- `linkSentAt`
- `createdAt`
- `updatedAt`

Recommended status values:

- `registrationStatus`: `confirmed`
- `paymentStatus`: `paid`
- `linkDeliveryStatus`: `pending`, `sent`, `failed`

### 6.4 DispatchLog

Tracks email sending attempts for auditability and retries.

Suggested fields:

- `classOffering`
- `student`
- `channel`
- `recipient`
- `subject`
- `status`
- `providerMessageId`
- `errorMessage`
- `sentAt`
- `createdAt`

---

## 7. Integration Boundary Design

This project must integrate later with teammates’ modules without needing major rewrites.

## Integration Principle

This component should not care **how** payment was processed. It should only consume a trusted “registration complete + payment complete” event or API call.

## Recommended Integration Entry

Create a backend integration endpoint such as:

```text
POST /api/integrations/enrollments/confirmed
```

This endpoint will:

- validate the shared secret or token
- accept a normalized payload from the upstream registration/payment component
- upsert the student
- create or update the enrollment
- return a clean response

## Example Payload

```json
{
  "fullName": "Nimal Perera",
  "email": "nimal@example.com",
  "phone": "0771234567",
  "kuppiSession": "2026 A/L Physics Support - Batch 01",
  "registrationReference": "REG-1001",
  "paymentReference": "PAY-9001",
  "paymentStatus": "paid",
  "registrationStatus": "confirmed"
}
```

## Integration Rules

- require idempotency by `registrationReference`
- reject incomplete or unpaid registrations
- do not allow duplicate paid enrollments for the same class unless explicitly intended
- document the request and response contract in `Documentation/API_CONTRACT.md`

---

## 8. API Design

## Admin APIs

### GET `/api/admin/dashboard/summary`

Returns:

- total confirmed students
- total links sent
- total pending link sends
- total failed sends

### GET `/api/admin/enrollments`

Supports:

- search by name/email
- filter by kuppi session
- filter by link delivery status
- pagination
- sorting by newest first

### POST `/api/admin/class-links/send`

Purpose:

- send class link email to all eligible students for one class offering

Request body:

```json
{
  "classOfferingId": "..."
}
```

Behavior:

- fetch all paid confirmed enrollments for the class
- skip already-sent records unless `forceResend=true`
- send emails
- update `Enrollment.linkDeliveryStatus`
- create `DispatchLog` entries
- return success/failure counts

### POST `/api/admin/class-offerings`

Optional but recommended for completeness.
Allows the admin to create or update a class offering and store the actual class link.

## Integration API

### POST `/api/integrations/enrollments/confirmed`

Consumes upstream success events.

## Health API

### GET `/api/health`

Returns service health for local testing and later deployment checks.

---

## 9. Frontend UI Plan

Build a minimal, modern admin dashboard using React + Tailwind CSS v4. Tailwind’s current Vite guide recommends creating the Vite app first, installing `tailwindcss` and `@tailwindcss/vite`, adding the Vite plugin, and importing Tailwind with `@import "tailwindcss";`. ([Tailwind CSS][2])

## Main Screens

### 9.1 Dashboard Page

Sections:

- summary cards
- session filter
- search field
- student table
- send class link button
- last sync / last send information

### 9.2 Student Table

Columns:

- name
- email
- kuppi session
- registered status
- payment status
- link delivery status
- created date

### 9.3 Send Link Interaction

When admin clicks:

- show confirmation modal
- display target class/session
- show count of intended recipients
- call backend API
- show success toast / failure summary

### 9.4 Empty / Loading / Error States

Must include:

- empty list message
- loading skeletons
- clear retry action
- inline error alerts

## UI Style Direction

- white/neutral base
- minimal spacing
- rounded cards
- clear typography
- accessible button states
- responsive table/card layout
- no visual noise

---

## 10. Backend Standards

## Required Practices

- configuration in one place
- controllers thin, services thick
- Mongoose models clean and indexed
- request validation before business logic
- centralized error handler
- structured success/error responses
- environment variable validation on startup
- email logic isolated in a mail service
- integration routes protected with shared secret

## Suggested Backend Packages

Core:

- `express`
- `mongoose`
- `dotenv`
- `cors`
- `helmet`
- `morgan`
- `nodemailer`
- `zod`

Dev:

- `nodemon`
- `eslint`
- `prettier`

Testing:

- `vitest` or `jest`
- `supertest`

---

## 11. Root Tooling Strategy

Use a root `package.json` to simplify developer commands and integration.

## Root Scripts

Recommended:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "dev:frontend": "npm run dev --prefix frontend",
    "dev:backend": "npm run dev --prefix backend",
    "install:all": "npm install && npm install --prefix backend && npm install --prefix frontend",
    "seed": "npm run seed --prefix backend",
    "seed:reset": "npm run seed:reset --prefix backend",
    "seed:standalone": "npm run seed:standalone --prefix backend",
    "lint": "npm run lint --prefix backend && npm run lint --prefix frontend",
    "format": "npm run format --prefix backend && npm run format --prefix frontend",
    "test": "npm run test --prefix backend && npm run test --prefix frontend"
  }
}
```

Also install at root:

- `concurrently`

---

## 12. Initialization Plan

Vite currently supports scaffolding React through `npm create vite@latest`, including direct template selection, and explicitly notes it works well in monorepo-style setups. Express’s install guide still starts from a basic Node app initialized with `npm init`, then `npm install express`. ([vitejs][1])

## Step 1: Initialize Repository and Base Structure

Tasks:

- initialize Git in the empty root folder
- create `frontend`, `backend`, and `Documentation`
- create root `package.json`
- add `.gitignore`
- add `README.md`
- add initial `Documentation/PLAN.md`

Commands:

```bash
git init
mkdir frontend backend Documentation
npm init -y
npm install -D concurrently
```

Create `.gitignore` with at least:

```gitignore
node_modules
dist
.env
.env.*
!.env.example
coverage
.DS_Store
npm-debug.log*
```

Deliverable:

- clean root monorepo-like structure ready for app scaffolding

---

## 13. Frontend Setup Plan

Vite’s current docs use `npm create vite@latest` and support the React template. Tailwind CSS v4’s current Vite setup is to install `tailwindcss` and `@tailwindcss/vite`, register the plugin in Vite config, and import Tailwind from CSS. ([vitejs][1])

## Step 2: Scaffold Frontend with Vite React

Commands:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

## Step 3: Install Tailwind CSS v4

Commands:

```bash
npm install tailwindcss @tailwindcss/vite
```

Configure `frontend/vite.config.js` to include the Tailwind plugin.

In the main CSS file:

```css
@import "tailwindcss";
```

## Step 4: Frontend Base Structure

Create:

- `src/api`
- `src/app`
- `src/components`
- `src/features/students`
- `src/pages`
- `src/layouts`
- `src/hooks`
- `src/utils`

Create:

- app layout shell
- dashboard page
- reusable button, table, badge, modal, toast components
- API client wrapper
- environment config helper

Deliverable:

- frontend starts with Vite and renders a styled shell page

---

## 14. Backend Setup Plan

Express’s install guide still follows a simple app-directory + `npm init` + `npm install express` flow, and Mongoose’s current getting-started flow still uses `mongoose.connect(...)` to a local MongoDB instance. ([Express][3])

## Step 5: Initialize Backend

Commands:

```bash
cd backend
npm init -y
npm install express mongoose dotenv cors helmet morgan nodemailer zod
npm install -D nodemon eslint prettier vitest supertest
```

## Step 6: Backend Base Files

Create:

- `src/app.js`
- `src/server.js`
- `src/config/env.js`
- `src/db/connectDb.js`
- `src/middlewares/errorHandler.js`
- `src/routes/index.js`

Backend package scripts:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node scripts/seed.js",
    "seed:reset": "node scripts/seedReset.js",
    "seed:standalone": "node scripts/seedStandaloneDemo.js",
    "test": "vitest run"
  }
}
```

## Step 7: Database Connection

Use:

```env
MONGODB_URI=mongodb://localhost:27017/class_link_manager
```

Connection responsibilities:

- connect once at app startup
- fail fast if DB is unavailable
- log connection state clearly

---

## 15. Data Modeling Plan

## Step 8: Create Mongoose Models

Models:

- `Student.js`
- `ClassOffering.js`
- `Enrollment.js`
- `DispatchLog.js`

Indexes:

- `Student.email` unique
- `Enrollment.registrationReference` unique
- compound index on `Enrollment.classOffering + Enrollment.student`
- index on `Enrollment.linkDeliveryStatus`

Validation examples:

- normalized email
- required kuppi session through class offering link
- only `paid` enrollments can become send targets

Deliverable:

- stable domain model that supports both standalone and integrated flows

---

## 16. Registration Success Ingestion Plan

## Step 9: Build the Confirmed Enrollment Ingestion Endpoint

Create:

- validation schema for external payload
- controller for integration request
- service that performs:
  - upsert student
  - resolve class offering by kuppi session
  - create or update enrollment
  - maintain idempotency by registration reference

### Additional Rules

- only accept `paymentStatus=paid`
- only accept `registrationStatus=confirmed`
- reject malformed payloads with clear validation messages
- require `INTEGRATION_SHARED_SECRET` header/token in integrated mode
- in standalone mode, optionally allow local mock ingestion if `ALLOW_MOCK_SYNC=true`

Deliverable:

- backend can accept and save confirmed student data

---

## 17. Dashboard Data APIs Plan

## Step 10: Build Admin Read APIs

Create:

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/enrollments`
- `GET /api/admin/class-offerings`

Enrollment listing must support:

- pagination
- search
- session filter
- delivery status filter
- newest-first sorting

Response shape should be consistent and frontend-friendly:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

---

## 18. Email Dispatch Plan

## Step 11: Build Mail Service

Create:

- `src/services/mailerService.js`
- `src/services/classLinkService.js`

Responsibilities:

- build email subject/body
- send to all eligible students
- update enrollment delivery status
- create dispatch logs
- return batch summary

### Required Email Features

- send individually, not one giant CC list
- support `console` provider for standalone local runs
- support `smtp` provider for integrated/real mail sending
- record successes and failures separately
- support future resend flow cleanly

### API

```text
POST /api/admin/class-links/send
```

Optional request body:

```json
{
  "classOfferingId": "...",
  "forceResend": false
}
```

### Dispatch Rules

- only target `confirmed + paid` enrollments
- skip records already sent unless forced
- set `linkSentAt` when successful
- record provider response metadata when available

---

## 19. Frontend Feature Implementation Plan

## Step 12: Dashboard UI Implementation

Build:

- summary stat cards
- filters
- searchable student list
- badges for status
- send class link modal
- toast notifications
- loading indicators

### Components

- `StatCard`
- `FilterBar`
- `StudentTable`
- `StatusBadge`
- `ConfirmSendModal`
- `EmptyState`
- `PageHeader`

### UX Requirements

- disable send button while request is in progress
- show result counts after sending
- preserve filter state on refresh if practical
- keep the interface simple for a live presentation

---

## 20. Standalone / Integrated Mode Implementation Plan

## Step 13: Add Runtime Configuration Layer

Create a central config module on both frontend and backend.

### Backend Mode Behavior

`APP_MODE=standalone`

- allow seed-focused data setup
- optionally allow mock ingestion endpoint
- default `EMAIL_PROVIDER=console`

`APP_MODE=integrated`

- require integration secret
- use real upstream confirmed-registration payloads
- use real SMTP if configured

### Frontend Mode Behavior

`VITE_APP_MODE=standalone`

- optionally show preloaded data faster
- keep all screens identical
- avoid any demo-only labels

`VITE_APP_MODE=integrated`

- use real integration-connected backend
- no code duplication

### Important Rule

The UI must remain visually consistent across modes. The switch changes data source and capability routing, not design language.

---

## 21. Easy Seeding Plan

## Step 14: Create Database Seed Scripts

This project must have very easy local seeding.

### Required Commands

From root:

```bash
npm run seed
npm run seed:reset
npm run seed:standalone
```

### Expected Behavior

`npm run seed`

- insert base class offering(s)
- insert sample students
- insert sample confirmed paid enrollments

`npm run seed:reset`

- clear related collections
- reseed cleanly

`npm run seed:standalone`

- prepare the exact dataset used for individual presentation:
  - at least 1 class offering
  - at least 8–12 students
  - mixed delivery states:
    - pending
    - sent
    - failed

### Seed Data Requirements

Include:

- realistic Sri Lankan names/emails
- at least 2 different kuppi sessions
- at least 1 already-sent class link case
- at least 1 failed email case for dashboard realism

### Seed Script Design

Prefer a shared seed utility so test data is consistent.

---

## 22. Testing Plan

## Step 15: Add Backend Tests

Test:

- confirmed enrollment ingestion
- duplicate registration handling
- admin enrollments listing
- send class link flow
- resend protection
- invalid payload rejection

## Step 16: Add Frontend Tests

Test:

- dashboard renders summary
- filters update API query state
- send button disabled during request
- success/failure summaries appear

### Minimum Test Standard

- backend integration tests for core APIs
- frontend component tests for critical interactions

---

## 23. Documentation Plan

## Step 17: Create Documentation Files

### `Documentation/ARCHITECTURE.md`

Include:

- component overview
- request flow
- backend module boundaries
- frontend module boundaries

### `Documentation/API_CONTRACT.md`

Include:

- admin endpoints
- integration endpoint
- sample payloads
- response shapes
- status codes

### `Documentation/DATA_MODEL.md`

Include:

- collection descriptions
- field definitions
- indexes
- sample documents

### `Documentation/SETUP.md`

Include:

- prerequisites
- install commands
- `.env` setup
- run commands

### `Documentation/SEEDING.md`

Include:

- what each seeding command does
- how to reset
- how to prepare presentation data

### `Documentation/INTEGRATION_GUIDE.md`

Include:

- required payload from payment/registration team
- required secrets
- session mapping rules
- idempotency expectations

### `Documentation/PRESENTATION_FLOW.md`

Include:

- exact sequence for local presentation
- start services
- seed standalone data
- open dashboard
- trigger send link

---

## 24. Team Integration Plan

## Step 18: Prepare for Team Merge

This component must be easy to integrate later.

### Integration Checklist

1. Keep all external dependencies behind service interfaces
2. Avoid hard-coding teammate-specific URLs
3. Put shared contracts in `Documentation/API_CONTRACT.md`
4. Keep session matching rules documented
5. Use environment variables for all shared endpoints/secrets
6. Keep ingestion payload versionable if needed later
7. Use consistent API success/error shape

### Expected Upstream Dependency

Another group component can call:

```text
POST /api/integrations/enrollments/confirmed
```

### Expected Downstream Behavior

This component will:

- store confirmed students
- expose dashboard data
- dispatch class links
- keep logs

### Merge Safety Rules

- no large refactor near integration time
- no renaming API fields after contract is documented
- no hidden assumptions about payment provider implementation
- do not couple UI state to raw backend database shape

---

## 25. Local Environment Files

## Backend `.env.example`

```env
NODE_ENV=development
PORT=5000
APP_MODE=standalone
MONGODB_URI=mongodb://localhost:27017/class_link_manager
FRONTEND_URL=http://localhost:5173
INTEGRATION_SHARED_SECRET=change-me
EMAIL_PROVIDER=console
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=no-reply@example.com
DEFAULT_CLASS_LINK=https://meet.google.com/xxx-xxxx-xxx
ALLOW_MOCK_SYNC=true
```

## Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_MODE=standalone
```

---

## 26. Git Workflow Requirements

The coding agent must initialize the repository immediately and commit after every meaningful step.

## Rules

- commit after each numbered implementation step
- use conventional commit style
- do not squash during development
- keep commit messages focused and scoped
- ensure each commit leaves the project in a valid state

## Required Commit Metadata Template

Use this exact format:

```bash
git add .

GIT_AUTHOR_NAME="Rumenhans" \
GIT_AUTHOR_EMAIL="rumenhansaja4@gmail.com" \
GIT_COMMITTER_NAME="Rumenhans" \
GIT_COMMITTER_EMAIL="rumenhansaja4@gmail.com" \
GIT_AUTHOR_DATE="2026-03-20 09:15:00 +0530" \
GIT_COMMITTER_DATE="2026-03-20 09:20:00 +0530" \
git commit -m "chore: initialize repository structure"
```

---

## 27. Planned Commit Timeline

Use the following timeline and messages unless implementation details require a very small wording adjustment.

### Commit 01

Date:

- `2026-03-20 09:15:00 +0530`
- `2026-03-20 09:20:00 +0530`

Message:

- `chore: initialize repository structure`

Includes:

- git init
- root folders
- root package
- gitignore
- base README
- Documentation folder scaffold

### Commit 02

Date:

- `2026-03-20 11:30:00 +0530`
- `2026-03-20 11:40:00 +0530`

Message:

- `chore(frontend): scaffold vite react application`

Includes:

- Vite React app in `frontend`
- initial install
- basic cleanup

### Commit 03

Date:

- `2026-03-20 14:10:00 +0530`
- `2026-03-20 14:18:00 +0530`

Message:

- `style(frontend): configure tailwindcss v4 with vite`

Includes:

- Tailwind install
- Vite plugin config
- base CSS import
- starter layout shell

### Commit 04

Date:

- `2026-03-20 17:05:00 +0530`
- `2026-03-20 17:14:00 +0530`

Message:

- `chore(backend): initialize express server and tooling`

Includes:

- backend package
- express server
- env config
- db connector
- middleware skeleton

### Commit 05

Date:

- `2026-03-21 09:25:00 +0530`
- `2026-03-21 09:35:00 +0530`

Message:

- `feat(backend): add core mongoose models for students classes and enrollments`

Includes:

- Student
- ClassOffering
- Enrollment
- DispatchLog

### Commit 06

Date:

- `2026-03-21 12:40:00 +0530`
- `2026-03-21 12:48:00 +0530`

Message:

- `feat(backend): implement confirmed enrollment ingestion api`

Includes:

- validation
- controller
- service
- idempotent upsert logic

### Commit 07

Date:

- `2026-03-21 16:20:00 +0530`
- `2026-03-21 16:28:00 +0530`

Message:

- `feat(backend): add admin dashboard and enrollment listing endpoints`

Includes:

- summary API
- enrollments list API
- filtering and pagination

### Commit 08

Date:

- `2026-03-22 09:50:00 +0530`
- `2026-03-22 10:00:00 +0530`

Message:

- `feat(backend): implement class link email dispatch workflow`

Includes:

- mail service
- batch send endpoint
- dispatch logs
- delivery status updates

### Commit 09

Date:

- `2026-03-22 14:30:00 +0530`
- `2026-03-22 14:40:00 +0530`

Message:

- `feat(frontend): build admin dashboard layout and reusable ui components`

Includes:

- stat cards
- table
- badges
- modal
- toast
- page shell

### Commit 10

Date:

- `2026-03-23 09:10:00 +0530`
- `2026-03-23 09:18:00 +0530`

Message:

- `feat(frontend): connect dashboard to backend apis`

Includes:

- API layer
- list rendering
- filters
- summary data
- send link action wiring

### Commit 11

Date:

- `2026-03-23 15:45:00 +0530`
- `2026-03-23 15:55:00 +0530`

Message:

- `feat(config): add standalone and integrated runtime modes`

Includes:

- backend mode guards
- frontend mode config
- mock sync enablement
- no visual mode labels

### Commit 12

Date:

- `2026-03-24 10:20:00 +0530`
- `2026-03-24 10:30:00 +0530`

Message:

- `feat(seed): add database seed and reset scripts`

Includes:

- seed data
- standalone presentation dataset
- reset flow

### Commit 13

Date:

- `2026-03-24 14:05:00 +0530`
- `2026-03-24 14:15:00 +0530`

Message:

- `refactor(backend): improve validation error handling and logging`

Includes:

- shared response utilities
- error middleware
- request validation hardening
- cleaner logs

### Commit 14

Date:

- `2026-03-25 10:35:00 +0530`
- `2026-03-25 10:50:00 +0530`

Message:

- `test: add backend and frontend coverage for core workflows`

Includes:

- ingestion tests
- listing tests
- send link tests
- key UI behavior tests

### Commit 15

Date:

- `2026-03-25 16:10:00 +0530`
- `2026-03-25 16:20:00 +0530`

Message:

- `docs: add setup integration and presentation documentation`

Includes:

- setup guide
- API contract
- data model
- seeding guide
- presentation flow

### Commit 16

Date:

- `2026-03-25 20:15:00 +0530`
- `2026-03-25 20:25:00 +0530`

Message:

- `chore: finalize project polish and root scripts`

Includes:

- root command cleanup
- README final pass
- minor UI polish
- final environment examples

---

## 28. Definition of Done

This component is done when all of the following are true:

1. confirmed student data can be ingested from an external success event
2. the backend stores student, class, enrollment, and dispatch data cleanly
3. the dashboard shows confirmed paid students
4. admin can send the class link to all target students
5. delivery results are logged
6. standalone mode works with one env switch
7. integrated mode works with one env switch
8. seeding commands work from the root
9. documentation exists for setup and integration
10. the git history is clean and stepwise with required author metadata

---

## 29. Immediate Execution Order for the Coding Agent

Execute in this exact order:

1. initialize git and root structure
2. scaffold Vite React frontend
3. configure Tailwind v4
4. initialize Express backend
5. add MongoDB connection and model layer
6. build confirmed-enrollment ingestion
7. build admin read APIs
8. build class-link send workflow
9. build dashboard UI
10. wire frontend to backend
11. add standalone/integrated mode config
12. add seeding scripts
13. add tests
14. write documentation
15. polish scripts and finalize

Do not skip commits between these steps.

---

## 30. Final Technical Notes

- keep the source of truth for confirmed students in the backend
- keep email dispatch idempotent where possible
- separate domain models from API response formatting
- keep the integration contract stable as early as possible
- prefer explicit status enums over boolean flags
- keep the standalone mode hidden behind environment configuration, not special UI text
- use the same business flow in both standalone and integrated modes

---
