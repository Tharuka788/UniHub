# Integration Guide

## Upstream Contract

The registration/payment component should call:

```text
POST /api/integrations/enrollments/confirmed
```

This component assumes the upstream system has already confirmed:

- registration is complete
- payment is successful

## Required Payload

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

## Required Environment Variables

Backend integrated mode:

```env
APP_MODE=integrated
INTEGRATION_SHARED_SECRET=your-shared-secret
EMAIL_PROVIDER=smtp
SMTP_HOST=...
SMTP_PORT=...
MAIL_FROM=...
```

Frontend integrated mode:

```env
VITE_APP_MODE=integrated
VITE_API_BASE_URL=http://your-backend-host/api
```

## Secret Handling

- send the shared secret in `x-integration-secret`
- do not embed the secret in the browser
- rotate the secret if it is exposed

## Idempotency

- `registrationReference` is the idempotency key
- repeated submissions with the same `registrationReference` update the existing enrollment
- duplicate paid enrollments for the same student and class are rejected

## Session Mapping Rule

- `kuppiSession` is used to resolve or create the matching class offering
- keep the session naming convention stable across teams to avoid accidental duplicates

## Expected Downstream Behavior

After a successful call this component will:

- upsert the student
- upsert or resolve the class offering
- create/update the enrollment
- expose the record in admin APIs
- include the student in class-link dispatch eligibility
