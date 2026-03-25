# API Contract

Base URL: `http://localhost:5000/api`

## Response Shape

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Request body validation failed.",
  "details": [
    {
      "path": "fullName",
      "message": "fullName is required."
    }
  ]
}
```

## Health

### `GET /health`

Returns:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-25T10:00:00.000Z"
  }
}
```

## Runtime Config

### `GET /config`

Returns frontend-safe runtime information:

```json
{
  "success": true,
  "data": {
    "appMode": "standalone",
    "emailProvider": "console",
    "allowMockSync": true
  }
}
```

## Integration API

### `POST /integrations/enrollments/confirmed`

Headers:

- `x-integration-secret: <shared-secret>` in integrated mode

Request body:

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

Success response:

```json
{
  "success": true,
  "data": {
    "created": true,
    "student": {
      "id": "student-id",
      "fullName": "Nimal Perera",
      "email": "nimal@example.com"
    },
    "classOffering": {
      "id": "class-id",
      "kuppiSession": "2026 A/L Physics Support - Batch 01",
      "title": "2026 A/L Physics Support - Batch 01"
    },
    "enrollment": {
      "id": "enrollment-id",
      "registrationReference": "REG-1001",
      "paymentReference": "PAY-9001",
      "linkDeliveryStatus": "pending"
    }
  }
}
```

Status codes:

- `201` new enrollment created
- `200` idempotent update of an existing registration reference
- `400` invalid body
- `401` invalid integration secret
- `409` duplicate paid enrollment for the same student and class

## Admin APIs

### `GET /admin/dashboard/summary`

Returns:

```json
{
  "success": true,
  "data": {
    "totalConfirmedStudents": 8,
    "totalLinksSent": 3,
    "totalPendingLinkSends": 3,
    "totalFailedSends": 2,
    "lastEnrollmentAt": "2026-03-24T09:00:00.000Z",
    "lastLinkSentAt": "2026-03-24T10:00:00.000Z"
  }
}
```

### `GET /admin/enrollments`

Query params:

- `page`
- `limit`
- `search`
- `kuppiSession`
- `linkDeliveryStatus`

Returns:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "enrollment-id",
        "registrationReference": "REG-1001",
        "paymentReference": "PAY-9001",
        "registrationStatus": "confirmed",
        "paymentStatus": "paid",
        "linkDeliveryStatus": "pending",
        "linkSentAt": null,
        "createdAt": "2026-03-24T09:00:00.000Z",
        "student": {
          "id": "student-id",
          "fullName": "Nimal Perera",
          "email": "nimal@example.com",
          "phone": "0771234567"
        },
        "classOffering": {
          "id": "class-id",
          "title": "2026 A/L Physics Support",
          "kuppiSession": "2026 A/L Physics Support - Batch 01",
          "classLink": "https://meet.google.com/phy-batch-01",
          "status": "active"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

### `GET /admin/class-offerings`

Returns:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "class-id",
        "title": "2026 A/L Physics Support",
        "kuppiSession": "2026 A/L Physics Support - Batch 01",
        "classLink": "https://meet.google.com/phy-batch-01",
        "status": "active",
        "startDateTime": null,
        "createdAt": "2026-03-24T09:00:00.000Z"
      }
    ]
  }
}
```

### `POST /admin/class-offerings`

Request body:

```json
{
  "title": "2026 A/L Physics Support",
  "kuppiSession": "2026 A/L Physics Support - Batch 01",
  "classLink": "https://meet.google.com/phy-batch-01",
  "status": "active"
}
```

### `POST /admin/class-links/send`

Request body:

```json
{
  "classOfferingId": "class-id",
  "forceResend": false
}
```

Response:

```json
{
  "success": true,
  "data": {
    "classOffering": {
      "id": "class-id",
      "title": "2026 A/L Physics Support",
      "kuppiSession": "2026 A/L Physics Support - Batch 01"
    },
    "totalTargets": 5,
    "attempted": 3,
    "sent": 2,
    "failed": 1,
    "skipped": 2,
    "errors": [
      {
        "enrollmentId": "enrollment-id",
        "email": "student@example.com",
        "message": "SMTP unavailable"
      }
    ]
  }
}
```
