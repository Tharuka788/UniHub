# Seeding

## Commands

From the repository root:

```bash
npm run seed
npm run seed:reset
npm run seed:standalone
```

## Command Behavior

### `npm run seed`

- connects to MongoDB
- upserts a base dataset
- creates 5 class offerings
- creates 7 confirmed paid enrollments
- includes an archived class offering and an inactive student example
- covers readiness labels for `Ready`, `Almost Ready`, and `Needs Setup`
- creates dispatch logs with mixed history for report previews

### `npm run seed:reset`

- clears class offerings, students, enrollments, and dispatch logs
- reseeds the base dataset

### `npm run seed:standalone`

- clears all related collections
- loads the presentation dataset
- creates 6 class offerings
- creates 13 confirmed paid enrollments
- includes mixed `pending`, `sent`, and `failed` delivery states
- includes multiple date variations for report filtering and PDF demos

## Demo Dataset Notes

The standalone dataset includes:

- realistic Sri Lankan names
- multiple kuppi sessions
- explicit active, inactive, archived, and draft examples
- already-sent class links
- failed dispatch examples for dashboard realism
- readiness states across all three labels

## Troubleshooting

- ensure MongoDB is running before seeding
- if seed scripts fail on duplicate data, run `npm run seed:reset`
