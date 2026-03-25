# Architecture

## Overview

The project is a small monorepo with a React admin frontend and an Express/MongoDB backend.

### Frontend

- `frontend/src/app`: runtime configuration helpers
- `frontend/src/api`: HTTP client and admin API functions
- `frontend/src/components`: reusable UI primitives, tables, filters, modals, and readiness widgets
- `frontend/src/layouts`: page shell
- `frontend/src/pages`: dashboard, students, class offerings, and reports screens
- `frontend/src/hooks`: persisted UI state helpers
- `frontend/src/features/students`: local feature-only data helpers

### Backend

- `backend/src/config`: environment parsing and runtime-mode rules
- `backend/src/controllers`: thin HTTP controllers
- `backend/src/db`: MongoDB connection setup
- `backend/src/middlewares`: request validation, integration auth, and error handling
- `backend/src/models`: Mongoose domain models
- `backend/src/routes`: admin, integration, and health routing
- `backend/src/services`: business logic for ingestion, CRUD, reports, mail, readiness, and dispatch
- `backend/src/utils`: shared HTTP errors, logging, and response formatting
- `backend/src/validations`: zod request schemas

## Request Flow

### Confirmed enrollment ingestion

1. Upstream system sends `POST /api/integrations/enrollments/confirmed`
2. Backend checks runtime-mode access rules and shared secret requirements
3. Request body is validated with zod
4. Service upserts the student and class offering
5. Enrollment is created or updated idempotently by `registrationReference`
6. Backend returns a normalized success payload

### Admin dashboard reads

1. Frontend loads summary, class offerings, and enrollments
2. Backend query validation normalizes pagination and filter values
3. Dashboard services query MongoDB models and shape frontend-friendly responses
4. Frontend renders summary cards, filters, table rows, and pagination

### Admin CRUD and reporting

1. Students and class offerings use dedicated CRUD routes under `/api/admin`
2. Zod validation normalizes body/query input before services run
3. Services enforce business rules such as unique active emails, archived edit restrictions, and report filter validation
4. Reports use a preview endpoint and a PDF endpoint backed by `pdfkit`
5. Frontend surfaces inline validation errors, filter chips, and downloadable report actions

### Class-link dispatch

1. Admin selects a session and calls `POST /api/admin/class-links/send`
2. Backend loads eligible confirmed and paid enrollments
3. Mailer service sends one email per student
4. Enrollment delivery status is updated
5. Dispatch logs are written for sent and failed attempts
6. Frontend refreshes summary/list data and shows toast feedback

## Runtime Modes

### `standalone`

- permits mock ingestion when `ALLOW_MOCK_SYNC=true`
- allows console mail transport
- frontend auto-selects the first available session for a smoother local demo

### `integrated`

- requires a non-default `INTEGRATION_SHARED_SECRET`
- requires `EMAIL_PROVIDER=smtp`
- disables mock-only ingestion access

## Key Design Decisions

- confirmed student state lives in the backend, not in the UI
- student, class offering, enrollment, and dispatch log are separate collections
- student deactivation and class-offering archive flows preserve operational history
- controllers stay thin and delegate to services
- request validation happens before services
- validation happens in UI, Zod schemas, and Mongoose validators
- both modes use the same UI and endpoint shapes
