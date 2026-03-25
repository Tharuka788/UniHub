## CRUD Expansion, Advanced Validation, Search, Reporting, and Novelty Feature

## 1. Amendment Objective

This amendment upgrades the existing component into a more complete academic and presentation-ready module by adding:

1. **1 or 2 clean and complete CRUD modules**
2. **Search**
3. **Custom and improved validations**
4. **Report generation with PDF downloading**
5. **One less-complex novelty feature**

This amendment must be implemented **on top of the current repository**, not as a rewrite. The existing architecture, runtime modes, ingestion flow, dispatch flow, and documentation must be preserved and extended.

---

## 2. Amendment Scope Summary

### New Required Additions

1. Full CRUD for **Class Offering**
2. Full CRUD for **Student**
3. Unified admin search across student/enrollment/class data
4. Custom validation rules at API, model, and UI levels
5. Report generation endpoint with downloadable PDF
6. Simple novelty feature: **Class Readiness Score**

### Existing Features to Keep

1. Confirmed enrollment ingestion
2. Admin dashboard summary
3. Enrollment listing
4. Class-link dispatch workflow
5. Standalone and integrated runtime modes
6. Existing seed commands and presentation flow

These are already part of the current documented system and must remain working after the update.

---

## 3. Amendment Design Direction

This amendment should make the component feel like a **well-structured admin subsystem** instead of only a dispatch dashboard.

The project after this amendment should have:

- **CRUD Module 1:** `ClassOffering`
- **CRUD Module 2:** `Student`
- **Operational Read Module:** `Enrollment`
- **Audit Module:** `DispatchLog`
- **Search Layer:** admin search and filtered retrieval
- **Reporting Layer:** generated PDF reports
- **Novelty Layer:** class readiness score and badge

This keeps the design clean and aligned with the current data model, which already separates students, class offerings, enrollments, and dispatch logs.

---

## 4. CRUD Strategy

## 4.1 Primary CRUD 1: Class Offering

The current project already supports class offering listing and creation through admin APIs. This amendment upgrades it to a **complete CRUD module**.

### Required Operations

- **Create** class offering
- **Read** class offering list
- **Read one** class offering detail
- **Update** class offering
- **Delete** class offering

### Required Fields

- `title`
- `kuppiSession`
- `classLink`
- `startDateTime`
- `status`

### New Endpoints

- `POST /api/admin/class-offerings`
- `GET /api/admin/class-offerings`
- `GET /api/admin/class-offerings/:id`
- `PATCH /api/admin/class-offerings/:id`
- `DELETE /api/admin/class-offerings/:id`

### Delete Rule

Use **soft delete / archive behavior** instead of destructive hard delete when the class offering already has enrollments or dispatch logs.

Recommended field additions:

- `isArchived`
- `archivedAt`

### UI Requirements

Add a full Class Offering management screen:

- list view
- create modal/page
- edit modal/page
- archive/delete confirmation
- detail drawer/page showing summary and linked enrollments

---

## 4.2 Primary CRUD 2: Student

Students currently exist as a managed identity entity in the data model and are exposed through enrollment responses. This amendment upgrades student management into a **clean, explicit CRUD module**.

### Required Operations

- **Create** student
- **Read** student list
- **Read one** student detail
- **Update** student
- **Delete** student

### Required Fields

- `fullName`
- `email`
- `phone`
- `studentCode` (optional but supported)

### New Endpoints

- `POST /api/admin/students`
- `GET /api/admin/students`
- `GET /api/admin/students/:id`
- `PATCH /api/admin/students/:id`
- `DELETE /api/admin/students/:id`

### Delete Rule

Do not hard delete a student if linked enrollments exist. Use one of:

- soft delete
- inactive flag
- archive flag

Recommended field additions:

- `isActive`
- `deactivatedAt`

### UI Requirements

Add a Student management screen:

- list
- search
- create
- edit
- view linked enrollments
- deactivate/archive action

---

## 5. Search Feature Plan

The current presentation flow already relies on search by student name/email in the dashboard. This amendment formalizes and expands search into a clearer admin feature.

## 5.1 Search Scope

### Search Targets

1. Student name
2. Student email
3. Student phone
4. Student code
5. Kuppi session
6. Class title
7. Registration reference
8. Payment reference

### Search Surfaces

- enrollments page
- students page
- class offerings page

## 5.2 Search Types

- free-text search
- exact field filter
- status filter
- session filter
- date-range filter
- sortable results

## 5.3 Required API Enhancements

### Student Search

`GET /api/admin/students?search=&isActive=&page=&limit=`

### Class Offering Search

`GET /api/admin/class-offerings?search=&status=&isArchived=&page=&limit=`

### Enrollment Search Upgrade

Extend current endpoint with:

- `dateFrom`
- `dateTo`
- `paymentReference`
- `registrationReference`
- `sortBy`
- `sortOrder`

The project already has enrollment listing with pagination and filters; this amendment expands that query surface rather than replacing it.

## 5.4 Backend Search Rules

- sanitize search input
- trim whitespace
- reject overlong search strings
- escape special regex characters
- use indexed fields wherever possible
- use case-insensitive matching for user-facing search
- default sort by newest first

## 5.5 Frontend Search UX

- one search input per module
- optional advanced filters drawer
- debounce search input
- reset filters button
- visible active-filter chips
- empty-state guidance when no results match

---

## 6. Custom and Improved Validation Plan

The current API contract already defines a consistent error shape, and the current architecture already uses zod plus request validation before services. This amendment strengthens validation depth and adds custom business-rule validation.

Mongoose supports built-in and custom validators, but update validators must be explicitly enabled for update operations; Zod supports custom refinements for business-rule validation. ([Mongoose][1])

## 6.1 Validation Layers

Validation must exist in all three layers:

### Layer A: Frontend validation

- required field checks
- URL format checks
- email format checks
- simple date constraints
- user-friendly inline messages

### Layer B: API schema validation

Use Zod request schemas with:

- `.trim()`
- `.toLowerCase()` for email where needed
- custom `.refine()` / `.superRefine()` rules

### Layer C: Mongoose model validation

- required fields
- enum constraints
- custom validators
- update validators enabled on update operations

## 6.2 New Custom Rules

### Student Rules

- `fullName` minimum 3 characters
- `fullName` reject purely numeric values
- `email` normalized to lowercase
- `email` unique for active students
- `phone` optional but if provided must match accepted local/international pattern
- `studentCode` optional but if provided must be unique

### Class Offering Rules

- `title` minimum 5 characters
- `kuppiSession` required and unique
- `classLink` must be a valid URL
- `classLink` must be from an allowed domain set in standalone/integrated config if such policy is enabled
- `startDateTime` must not be invalid
- `status` must be from allowed enum
- archived class offering cannot be edited except through explicit restore flow

### Enrollment Rules

- cannot create paid enrollment without required references
- cannot dispatch class link if `classLink` is missing
- cannot dispatch class link to inactive student
- cannot duplicate active enrollment for same `student + classOffering`
- when moving enrollment to another class, uniqueness must still hold

### Reporting Rules

- `dateFrom` cannot be after `dateTo`
- PDF report request must reject invalid report type
- download endpoint must reject empty-result report unless explicitly allowed

## 6.3 Error Response Improvements

Preserve the current global response style and add:

- error code string
- field-level validation path
- actionable message
- optional suggestion field for admin-facing cases

Suggested shape:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errorCode": "VALIDATION_ERROR",
  "details": [
    {
      "path": "classLink",
      "message": "Class link must be a valid URL."
    }
  ]
}
```

---

## 7. Report Generation and PDF Download Plan

The current repo has summary data, enrollment lists, class offerings, dispatch logs, and deterministic seed data, which makes it a good base for admin reporting.

For PDF generation in Node, PDFKit remains a straightforward and actively maintained option for server-side PDF document creation, with current installation and stream-based generation support documented in its official site and npm package. ([pdfkit.org][2])

## 7.1 Report Scope

Implement backend-generated PDF reports for download.

### Required Report Types

1. **Confirmed Students Report**
2. **Class Offering Summary Report**
3. **Dispatch Status Report**

## 7.2 Recommended First Version

Implement at least these two:

- `confirmed-students`
- `dispatch-summary`

Optional third:

- `class-offering-summary`

## 7.3 Report Filters

- class offering / kuppi session
- date range
- delivery status
- include archived records or not

## 7.4 PDF Content Requirements

### Confirmed Students Report

Include:

- report title
- generation timestamp
- selected session / filters
- total students
- table with:
  - name
  - email
  - phone
  - kuppi session
  - payment status
  - link delivery status

### Dispatch Summary Report

Include:

- report title
- generation timestamp
- selected session
- summary counts:
  - total targets
  - sent
  - failed
  - pending

- failed recipients section
- recent dispatch history section

## 7.5 Backend Endpoints

### Metadata / Preview Endpoint

`GET /api/admin/reports/summary?reportType=&classOfferingId=&dateFrom=&dateTo=`

Purpose:

- validate filters
- return preview counts before download

### PDF Download Endpoint

`GET /api/admin/reports/pdf?reportType=&classOfferingId=&dateFrom=&dateTo=`

Behavior:

- validate request
- fetch data
- generate PDF on the backend
- stream or return downloadable file
- set correct headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="..."`

## 7.6 Frontend UI

Add a Report Center or Reports section:

- report type selector
- session selector
- date range filter
- preview counts
- download PDF button
- loading state
- empty state if no data

## 7.7 Implementation Notes

- keep PDF generation in backend service layer
- create `reportService.js`
- create `pdfService.js`
- avoid rendering PDFs in-browser first; prioritize download
- ensure filenames are clean and deterministic
- ensure the same filters are used for preview and PDF generation

---

## 8. Novelty Feature Plan

## 8.1 Selected Novelty Feature: Class Readiness Score

This is intentionally simple, useful, and easy to explain in a progress presentation.

### Purpose

Show whether a class is operationally ready for link dispatch.

### Why This Feature

- low complexity
- visually effective
- relevant to the domain
- no heavy algorithm or external dependency
- useful in both standalone and integrated modes

## 8.2 Readiness Calculation

For each class offering, compute a score out of 100.

### Suggested Scoring

- class link present: +30
- class status is `ready` or `active`: +20
- at least 1 confirmed paid student: +20
- no failed validations on class data: +10
- less than 20% failed dispatch rate: +20

### Derived Labels

- `Needs Setup` = 0–39
- `Almost Ready` = 40–79
- `Ready` = 80–100

## 8.3 Usage

Display on:

- class offering list
- class offering detail page
- report summary area

## 8.4 Backend Support

Add computed readiness data in:

- class offering list response
- class offering detail response

## 8.5 Frontend Support

Use:

- colored badge
- score bar
- tooltip or short helper text

---

## 9. Backend Amendment Plan

## Step A1: Extend Models

Add new fields if needed:

- `ClassOffering.isArchived`
- `ClassOffering.archivedAt`
- `Student.isActive`
- `Student.deactivatedAt`
- optional `Student.studentCode`

Ensure indexes are updated carefully:

- `students.email`
- `students.studentCode` if used
- `classofferings.kuppiSession`
- search-supporting indexes where appropriate

## Step A2: Add CRUD Routes

Create new route groups:

- `backend/src/routes/adminStudentsRoutes.js`
- `backend/src/routes/adminClassOfferingsRoutes.js`
- `backend/src/routes/adminReportsRoutes.js`

## Step A3: Add Controllers

Create:

- `adminStudentsController.js`
- `adminClassOfferingsController.js`
- `adminReportsController.js`

## Step A4: Add Services

Create:

- `studentService.js`
- `classOfferingService.js`
- `reportService.js`
- `pdfService.js`
- `searchService.js` if helpful

## Step A5: Add Validations

Create:

- `studentSchemas.js`
- `classOfferingSchemas.js`
- `reportSchemas.js`
- `sharedSearchSchemas.js`

## Step A6: Add Soft Delete / Archive Logic

Do not physically remove linked data by default.

Implement:

- archive class offering
- deactivate student
- prevent destructive deletes where historical records exist

## Step A7: Add Downloadable PDF Service

Use a backend PDF library and stream the result.

Recommended package:

- `pdfkit`

Add package:

```bash
npm install --prefix backend pdfkit
```

---

## 10. Frontend Amendment Plan

## Step B1: Add New Pages

Create:

- `StudentsPage`
- `StudentFormPage` or modal-based form
- `ClassOfferingsPage`
- `ClassOfferingFormPage` or modal-based form
- `ReportsPage`

## Step B2: Add CRUD UI Components

Create reusable:

- `DataTable`
- `SearchBar`
- `FilterPanel`
- `EntityFormModal`
- `DeleteConfirmModal`
- `DetailDrawer`
- `ReadinessBadge`

## Step B3: Student CRUD UI

Must support:

- create student
- edit student
- deactivate/delete student
- search/filter student
- view associated enrollments

## Step B4: Class Offering CRUD UI

Must support:

- create offering
- edit offering
- archive/delete offering
- view readiness score
- view linked student count
- update class link

## Step B5: Reports UI

Must support:

- report type selection
- filters
- preview data
- PDF download
- disabled download button when invalid

## Step B6: Shared Search UX

Keep search consistent across modules:

- same input style
- same filter chip behavior
- same reset action
- same loading feedback

---

## 11. API Contract Amendment

Update `Documentation/API_CONTRACT.md` to include the following additions.

## 11.1 Student CRUD

### `POST /admin/students`

### `GET /admin/students`

### `GET /admin/students/:id`

### `PATCH /admin/students/:id`

### `DELETE /admin/students/:id`

## 11.2 Class Offering CRUD

### `GET /admin/class-offerings/:id`

### `PATCH /admin/class-offerings/:id`

### `DELETE /admin/class-offerings/:id`

## 11.3 Reporting

### `GET /admin/reports/summary`

### `GET /admin/reports/pdf`

## 11.4 Search Query Parameters

Document full allowed filters for:

- students
- class offerings
- enrollments
- reports

## 11.5 Validation Error Additions

Document:

- `errorCode`
- field-level issues
- archive/deactivate restrictions
- report generation errors

---

## 12. Data Model Amendment

Update `Documentation/DATA_MODEL.md`.

## 12.1 `students`

Add:

- `isActive`
- `deactivatedAt`
- `studentCode`

## 12.2 `classofferings`

Add:

- `isArchived`
- `archivedAt`

## 12.3 Index Notes

Clarify any new index or uniqueness behavior introduced by search and CRUD updates.

---

## 13. Seeding Amendment

The current seed flows already support base and standalone datasets. Extend them rather than replacing them.

## Step C1: Add Seed Support for New CRUD Views

Seed data must include:

- inactive student examples
- archived class offering example
- offerings with readiness scores across all label states
- enough records to test search

## Step C2: Add Reporting-Friendly Data

Include:

- multiple dispatch logs per offering
- a mix of sent, failed, pending
- date variation for report date filtering

## Step C3: Update Seed Commands

Keep existing root commands unchanged:

- `npm run seed`
- `npm run seed:reset`
- `npm run seed:standalone`

These commands already exist and are part of the documented workflow, so the agent must preserve them.

---

## 14. Testing Amendment

## Step D1: Backend Tests

Add test coverage for:

- student CRUD
- class offering CRUD
- archive/deactivate restrictions
- search filters
- custom validation failures
- report summary endpoint
- PDF download endpoint

## Step D2: Frontend Tests

Add coverage for:

- student create/edit flow
- class offering create/edit/archive flow
- search/filter UI behavior
- report form validation
- download button state
- readiness badge rendering

## Step D3: Validation-Specific Tests

Add explicit tests for:

- invalid email
- invalid class link
- duplicate student code
- invalid date ranges
- report type rejection
- update validator behavior

---

## 15. Documentation Amendment Tasks

Update these files after implementation:

- `README.md`
- `Documentation/ARCHITECTURE.md`
- `Documentation/API_CONTRACT.md`
- `Documentation/DATA_MODEL.md`
- `Documentation/SEEDING.md`
- `Documentation/SETUP.md`
- `Documentation/PRESENTATION_FLOW.md`

The current docs already describe the repo structure, setup flow, seeding flow, integration behavior, and presentation flow, so these should be amended rather than rewritten from scratch.

### New Documentation File

Add:

- `Documentation/AMENDMENT_PLAN.md`

---

## 16. Git Commit Continuation Plan

Continue the existing disciplined commit style. Keep the same author/committer identity format the project already requires.

Use this exact shell pattern:

```bash
git add .

GIT_AUTHOR_NAME="Rumenhans" \
GIT_AUTHOR_EMAIL="rumenhansaja4@gmail.com" \
GIT_COMMITTER_NAME="Rumenhans" \
GIT_COMMITTER_EMAIL="rumenhansaja4@gmail.com" \
GIT_AUTHOR_DATE="2026-03-25 21:00:00 +0530" \
GIT_COMMITTER_DATE="2026-03-25 21:10:00 +0530" \
git commit -m "feat(admin): add student crud module"
```

---

## 17. Amendment Commit Plan

Use the remaining timeline logically within the allowed project window.

### Commit A

Date:

- `2026-03-25 21:00:00 +0530`
- `2026-03-25 21:10:00 +0530`

Message:

- `feat(admin): add student crud module`

Includes:

- student routes
- controller
- service
- validation
- UI list/form/detail

### Commit B

Date:

- `2026-03-25 22:05:00 +0530`
- `2026-03-25 22:15:00 +0530`

Message:

- `feat(admin): complete class offering crud and archive flow`

Includes:

- detail/get one
- update
- archive/delete behavior
- UI form/edit/archive
- readiness data base support

### Commit C

Date:

- `2026-03-25 23:00:00 +0530`
- `2026-03-25 23:10:00 +0530`

Message:

- `feat(search): add unified admin search and advanced filters`

Includes:

- student search
- class offering search
- enrollment search enhancements
- frontend filter panel
- backend query normalization

### Commit D

Date:

- `2026-03-25 23:40:00 +0530`
- `2026-03-25 23:50:00 +0530`

Message:

- `feat(validation): add custom business rules and improved error responses`

Includes:

- zod refinements
- mongoose custom validators
- update validators
- error response improvement

### Commit E

Date:

- `2026-03-26 00:05:00 +0530`
- `2026-03-26 00:15:00 +0530`

Message:

- `feat(reports): add pdf report generation and download flows`

Includes:

- report endpoints
- pdf service
- reports page
- download action

### Commit F

Date:

- `2026-03-26 00:20:00 +0530`
- `2026-03-26 00:25:00 +0530`

Message:

- `feat(novelty): add class readiness score indicators`

Includes:

- readiness computation
- readiness badge UI
- summary visibility

### Commit G

Date:

- `2026-03-26 00:30:00 +0530`
- `2026-03-26 00:40:00 +0530`

Message:

- `test(docs): extend coverage seeds and documentation for amendment features`

Includes:

- test updates
- seed updates
- doc amendments
- README updates

---

## 18. Definition of Done for This Amendment

This amendment is complete when all of the following are true:

1. student CRUD works end-to-end
2. class offering CRUD works end-to-end
3. search works across the new admin views
4. custom validation rules work and return structured errors
5. admin can generate and download at least one PDF report
6. report filters are validated properly
7. class readiness score appears in class offering UI
8. existing ingestion and dispatch features still work
9. standalone mode still supports a clean presentation flow
10. seed commands still work and now cover the new features

The existing standalone demo flow and setup flow must remain usable after the amendment.

---

## 19. Immediate Execution Order for the Coding Agent

Execute in this exact order:

1. extend data models for soft delete / activity state
2. implement full student CRUD
3. implement full class offering CRUD
4. add advanced search and filter support
5. add custom and improved validation rules
6. add report summary and PDF download backend
7. add reports UI
8. add class readiness novelty feature
9. update seed data
10. update tests
11. update documentation

Do not rewrite existing stable flows unless required by the amendment.

---

## 20. Final Amendment Notes

- preserve the current monorepo structure
- preserve the current standalone/integrated mode strategy
- preserve current seed command names
- preserve current response shape style
- extend existing documentation, do not replace it blindly
- keep CRUD entities clean and explicit
- keep novelty feature simple and demonstrable
- keep PDF generation backend-driven
- keep validations strict but user-friendly
- prefer archive/deactivate over destructive delete for linked records

---
