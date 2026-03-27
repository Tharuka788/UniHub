import { seedBaseData } from './seedData.js'

seedBaseData().catch((error) => {
  console.error('Seed failed', error)
  process.exit(1)
})
