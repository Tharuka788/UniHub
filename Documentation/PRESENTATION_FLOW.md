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
- search across student, class, and reference fields
- review sent, pending, and failed deliveries

### 6. Show the CRUD modules

- open `Students` and demonstrate search plus deactivation state
- open `Class Offerings` and show archive-aware management
- highlight readiness badges for ready, almost-ready, and needs-setup states

### 7. Show the report center

- open `Reports`
- switch between confirmed-students and dispatch-summary reports
- change the date range to show preview updates
- download a PDF report

### 8. Trigger class-link dispatch

- choose a session
- click `Send class link`
- confirm the modal
- show the success/failure toast

### 9. Explain standalone behavior

- no special demo labels are shown in the UI
- console mail transport is used for safe local demonstration
- the same core business flow is used as integrated mode
