import { seedStandaloneDemoData } from './seedData.js'

seedStandaloneDemoData().catch((error) => {
  console.error('Standalone demo seed failed', error)
  process.exit(1)
})
