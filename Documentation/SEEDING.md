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
- creates 2 class offerings
- creates 5 confirmed paid enrollments
- creates dispatch logs for pre-seeded `sent` and `failed` entries

### `npm run seed:reset`

- clears class offerings, students, enrollments, and dispatch logs
- reseeds the base dataset

### `npm run seed:standalone`

- clears all related collections
- loads the presentation dataset
- creates 3 class offerings
- creates 10 confirmed paid enrollments
- includes mixed `pending`, `sent`, and `failed` delivery states

## Demo Dataset Notes

The standalone dataset includes:

- realistic Sri Lankan names
- multiple kuppi sessions
- already-sent class links
- failed dispatch examples for dashboard realism

## Troubleshooting

- ensure MongoDB is running before seeding
- if seed scripts fail on duplicate data, run `npm run seed:reset`
