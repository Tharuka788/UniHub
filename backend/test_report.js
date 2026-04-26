import { getReportSummary } from './src/services/reportService.js'
import mongoose from 'mongoose'
import { env } from './src/config/env.js'

async function run() {
  await mongoose.connect(env.MONGODB_URI)
  try {
    const res = await getReportSummary({ reportType: 'confirmed-students', includeArchived: false })
    console.log(res)
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
