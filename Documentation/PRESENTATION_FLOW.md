# Presentation Flow

## Recommended Demo Sequence

### 1. Prepare environment

Set:

```env
APP_MODE=standalone
EMAIL_PROVIDER=console
ALLOW_MOCK_SYNC=true
VITE_APP_MODE=standalone
```

### 2. Seed presentation data

From the root:

```bash
npm run seed:standalone
```

### 3. Start the apps

```bash
npm run dev
```

### 4. Open the dashboard

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`

### 5. Show the dashboard flow

- summary cards with mixed statuses
- filter by session
- search by student name/email
- review sent, pending, and failed deliveries

### 6. Trigger class-link dispatch

- choose a session
- click `Send class link`
- confirm the modal
- show the success/failure toast

### 7. Explain standalone behavior

- no special demo labels are shown in the UI
- console mail transport is used for safe local demonstration
- the same core business flow is used as integrated mode
