import { seedBaseData } from './seedData.js'

seedBaseData({ reset: true }).catch((error) => {
  console.error('Seed reset failed', error)
  process.exit(1)
})
