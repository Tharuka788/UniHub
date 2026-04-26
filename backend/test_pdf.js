import { getReportPdfPayload } from './src/services/reportService.js'
import { buildReportPdfBuffer } from './src/services/pdfService.js'
import mongoose from 'mongoose'
import { env } from './src/config/env.js'

async function run() {
  await mongoose.connect(env.MONGODB_URI)
  try {
    const report = await getReportPdfPayload({ reportType: 'confirmed-students', includeArchived: false, allowEmpty: true })
    const pdf = await buildReportPdfBuffer(report)
    console.log('PDF built, size:', pdf.length)
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
