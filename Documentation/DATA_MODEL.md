# Data Model

## Collections

### `students`

Purpose: one document per student identity.

Fields:

- `fullName`
- `email`
- `phone`
- `studentCode`
- `isActive`
- `deactivatedAt`
- `createdAt`
- `updatedAt`

Indexes:

- partial unique `email` for active students
- partial unique `studentCode` for active students when present

### `classofferings`

Purpose: one document per kuppi session / class batch.

Fields:

- `title`
- `kuppiSession`
- `classLink`
- `startDateTime`
- `status`
- `isArchived`
- `archivedAt`
- `createdAt`
- `updatedAt`

Indexes:

- unique `kuppiSession`
- `isArchived`

### `enrollments`

Purpose: confirmed student participation in a class offering.

Fields:

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

Indexes:

- unique `registrationReference`
- unique compound `classOffering + student`
- `linkDeliveryStatus`
- `createdAt`

### `dispatchlogs`

Purpose: audit trail of email attempts.

Fields:

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

Indexes:

- compound `classOffering + student + createdAt`
- `recipient`

## Status Enums

### Enrollment

- `registrationStatus`: `confirmed`
- `paymentStatus`: `paid`
- `linkDeliveryStatus`: `pending`, `sent`, `failed`

### Class offering

- `status`: `draft`, `ready`, `active`, `completed`

## Derived Read Models

- class-offering list/detail responses include a computed readiness object: `score` + `label`
- report summary responses can include `readinessSummary` for class-offering reports

## Sample Enrollment Document

```json
{
  "_id": "enrollment-id",
  "student": "student-id",
  "classOffering": "class-id",
  "registrationStatus": "confirmed",
  "paymentStatus": "paid",
  "confirmationSource": "integration",
  "registrationReference": "REG-1001",
  "paymentReference": "PAY-9001",
  "linkDeliveryStatus": "pending",
  "linkSentAt": null,
  "createdAt": "2026-03-24T09:00:00.000Z",
  "updatedAt": "2026-03-24T09:00:00.000Z"
}
```
